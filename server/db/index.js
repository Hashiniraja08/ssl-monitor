const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const DATA_DIR = path.join(__dirname, '../data');
const JSON_DB_FILE = path.join(DATA_DIR, 'securescan.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let isPgConnected = false;
let pgPool = null;

// Initial schema structure for fallback store
const initialData = {
  users: [],
  monitored_sites: [],
  scan_results: [],
  alert_preferences: [],
  notifications: [],
  api_keys: [],
  audit_logs: []
};

function readFallbackDB() {
  try {
    if (!fs.existsSync(JSON_DB_FILE)) {
      fs.writeFileSync(JSON_DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return { ...initialData };
    }
    const content = fs.readFileSync(JSON_DB_FILE, 'utf-8');
    return JSON.parse(content || '{}');
  } catch (err) {
    console.error('Error reading JSON fallback DB:', err);
    return { ...initialData };
  }
}

function writeFallbackDB(data) {
  try {
    fs.writeFileSync(JSON_DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing JSON fallback DB:', err);
  }
}

async function initDB() {
  const pgConnectionString = process.env.DATABASE_URL || process.env.PG_CONNECTION_STRING;
  const pgHost = process.env.PGHOST || (process.env.PG_ENABLED === 'true' ? 'localhost' : null);

  if (pgConnectionString || pgHost) {
    try {
      pgPool = new Pool(
        pgConnectionString
          ? { connectionString: pgConnectionString, ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false }
          : {
              host: process.env.PGHOST || 'localhost',
              port: parseInt(process.env.PGPORT || '5432', 10),
              user: process.env.PGUSER || 'postgres',
              password: process.env.PGPASSWORD || 'postgres',
              database: process.env.PGDATABASE || 'securescan'
            }
      );

      // Test connection
      const client = await pgPool.connect();
      console.log('✅ Connected to PostgreSQL database');
      isPgConnected = true;

      // Run schema
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
      await client.query(schemaSql);
      client.release();
    } catch (pgErr) {
      console.warn('⚠️ PostgreSQL connection failed or not configured. Using embedded persistent database engine.', pgErr.message);
      isPgConnected = false;
      pgPool = null;
    }
  } else {
    console.log('ℹ️ PostgreSQL not specified. Operating in zero-config mode with embedded persistent database.');
  }

  // Ensure JSON DB file is initialized
  readFallbackDB();
}

const db = {
  isPostgres() {
    return isPgConnected;
  },

  async query(text, params = []) {
    if (isPgConnected && pgPool) {
      const res = await pgPool.query(text, params);
      return res.rows;
    }
    throw new Error('Direct SQL queries not supported in fallback mode without adapter');
  },

  // Generic collection operations that work seamlessly on both PG and JSON fallback
  async findOne(table, queryFn) {
    if (isPgConnected && pgPool) {
      const keys = Object.keys(queryFn);
      const whereClauses = keys.map((k, idx) => `"${k}" = $${idx + 1}`).join(' AND ');
      const values = keys.map(k => queryFn[k]);
      const res = await pgPool.query(`SELECT * FROM ${table} WHERE ${whereClauses} LIMIT 1`, values);
      return res.rows[0] || null;
    } else {
      const data = readFallbackDB();
      const list = data[table] || [];
      return list.find(item => {
        return Object.entries(queryFn).every(([k, v]) => item[k] === v);
      }) || null;
    }
  },

  async findMany(table, queryFn = {}, sortFn = null) {
    if (isPgConnected && pgPool) {
      const keys = Object.keys(queryFn);
      let sql = `SELECT * FROM ${table}`;
      const values = [];
      if (keys.length > 0) {
        sql += ' WHERE ' + keys.map((k, idx) => `"${k}" = $${idx + 1}`).join(' AND ');
        values.push(...keys.map(k => queryFn[k]));
      }
      sql += ' ORDER BY created_at DESC';
      const res = await pgPool.query(sql, values);
      return res.rows;
    } else {
      const data = readFallbackDB();
      let list = data[table] || [];
      if (Object.keys(queryFn).length > 0) {
        list = list.filter(item => {
          return Object.entries(queryFn).every(([k, v]) => item[k] === v);
        });
      }
      if (sortFn) {
        list = [...list].sort(sortFn);
      } else {
        list = [...list].sort((a, b) => new Date(b.created_at || b.scanned_at || 0) - new Date(a.created_at || a.scanned_at || 0));
      }
      return list;
    }
  },

  async insert(table, record) {
    const row = {
      ...record,
      created_at: record.created_at || new Date().toISOString(),
      updated_at: record.updated_at || new Date().toISOString()
    };

    if (isPgConnected && pgPool) {
      const keys = Object.keys(row);
      const cols = keys.map(k => `"${k}"`).join(', ');
      const placeholders = keys.map((_, idx) => `$${idx + 1}`).join(', ');
      const values = keys.map(k => {
        const val = row[k];
        if (val !== null && typeof val === 'object') {
          return JSON.stringify(val);
        }
        return val;
      });

      const sql = `INSERT INTO ${table} (${cols}) VALUES (${placeholders}) RETURNING *`;
      const res = await pgPool.query(sql, values);
      return res.rows[0];
    } else {
      const data = readFallbackDB();
      if (!data[table]) data[table] = [];
      data[table].push(row);
      writeFallbackDB(data);
      return row;
    }
  },

  async update(table, queryFn, updateFields) {
    const now = new Date().toISOString();
    const updates = { ...updateFields, updated_at: now };

    if (isPgConnected && pgPool) {
      const updateKeys = Object.keys(updates);
      const queryKeys = Object.keys(queryFn);

      const setClause = updateKeys.map((k, idx) => `"${k}" = $${idx + 1}`).join(', ');
      const whereClause = queryKeys.map((k, idx) => `"${k}" = $${updateKeys.length + idx + 1}`).join(' AND ');

      const values = [
        ...updateKeys.map(k => {
          const val = updates[k];
          if (val !== null && typeof val === 'object') return JSON.stringify(val);
          return val;
        }),
        ...queryKeys.map(k => queryFn[k])
      ];

      const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause} RETURNING *`;
      const res = await pgPool.query(sql, values);
      return res.rows[0] || null;
    } else {
      const data = readFallbackDB();
      const list = data[table] || [];
      const index = list.findIndex(item => {
        return Object.entries(queryFn).every(([k, v]) => item[k] === v);
      });

      if (index !== -1) {
        list[index] = { ...list[index], ...updates };
        data[table] = list;
        writeFallbackDB(data);
        return list[index];
      }
      return null;
    }
  },

  async delete(table, queryFn) {
    if (isPgConnected && pgPool) {
      const keys = Object.keys(queryFn);
      const whereClause = keys.map((k, idx) => `"${k}" = $${idx + 1}`).join(' AND ');
      const values = keys.map(k => queryFn[k]);
      const sql = `DELETE FROM ${table} WHERE ${whereClause} RETURNING *`;
      const res = await pgPool.query(sql, values);
      return res.rows;
    } else {
      const data = readFallbackDB();
      const list = data[table] || [];
      const beforeCount = list.length;
      data[table] = list.filter(item => {
        return !Object.entries(queryFn).every(([k, v]) => item[k] === v);
      });
      writeFallbackDB(data);
      return beforeCount - data[table].length;
    }
  },

  async count(table, queryFn = {}) {
    if (isPgConnected && pgPool) {
      const keys = Object.keys(queryFn);
      let sql = `SELECT COUNT(*) as count FROM ${table}`;
      const values = [];
      if (keys.length > 0) {
        sql += ' WHERE ' + keys.map((k, idx) => `"${k}" = $${idx + 1}`).join(' AND ');
        values.push(...keys.map(k => queryFn[k]));
      }
      const res = await pgPool.query(sql, values);
      return parseInt(res.rows[0].count, 10);
    } else {
      const data = readFallbackDB();
      let list = data[table] || [];
      if (Object.keys(queryFn).length > 0) {
        list = list.filter(item => {
          return Object.entries(queryFn).every(([k, v]) => item[k] === v);
        });
      }
      return list.length;
    }
  }
};

module.exports = {
  db,
  initDB
};
