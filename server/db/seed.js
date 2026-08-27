const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { db, initDB } = require('./index');

async function seed() {
  await initDB();
  console.log('🌱 Starting database seed...');

  // 1. Seed Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const defaultUsers = [
    {
      id: 'usr_admin_01',
      name: 'Analyst 01',
      email: 'analyst.01@securescan.ai',
      password_hash: passwordHash,
      role: 'Admin',
      title: 'Tier 3 Admin',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 'usr_admin_master',
      name: 'Sarah Chen',
      email: 'admin@securescan.ai',
      password_hash: passwordHash,
      role: 'Admin',
      title: 'Principal SecOps Lead',
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 'usr_analyst_02',
      name: 'Marcus Vance',
      email: 'marcus.v@securescan.ai',
      password_hash: passwordHash,
      role: 'Analyst',
      title: 'Security Operations Analyst',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80'
    },
    {
      id: 'usr_viewer_01',
      name: 'Elena Rostova',
      email: 'viewer@securescan.ai',
      password_hash: passwordHash,
      role: 'Viewer',
      title: 'Compliance Auditor',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&h=256&q=80'
    }
  ];

  for (const user of defaultUsers) {
    const existing = await db.findOne('users', { email: user.email });
    if (!existing) {
      await db.insert('users', user);
    }
  }

  // 2. Seed Monitored Sites
  const sampleSites = [
    {
      id: 'site_01',
      user_id: 'usr_admin_01',
      domain: 'google.com',
      port: 443,
      name: 'Google Production',
      status: 'valid',
      days_remaining: 84,
      issuer: 'Google Trust Services',
      tls_version: 'TLS 1.3',
      last_checked_at: new Date().toISOString(),
      check_frequency_minutes: 60,
      enable_email_alerts: true,
      enable_inapp_alerts: true
    },
    {
      id: 'site_02',
      user_id: 'usr_admin_01',
      domain: 'api.prod.internal.corp',
      port: 443,
      name: 'Internal Production API',
      status: 'valid',
      days_remaining: 42,
      issuer: 'Acme Root CA G3',
      tls_version: 'TLS 1.3',
      last_checked_at: new Date().toISOString(),
      check_frequency_minutes: 30,
      enable_email_alerts: true,
      enable_inapp_alerts: true
    },
    {
      id: 'site_03',
      user_id: 'usr_admin_01',
      domain: 'staging.app.net',
      port: 443,
      name: 'App Staging Cluster',
      status: 'warning',
      days_remaining: 21,
      issuer: 'GlobalSign Extended Validation CA',
      tls_version: 'TLS 1.2',
      last_checked_at: new Date().toISOString(),
      check_frequency_minutes: 15,
      enable_email_alerts: true,
      enable_inapp_alerts: true
    },
    {
      id: 'site_04',
      user_id: 'usr_admin_01',
      domain: 'example.com',
      port: 443,
      name: 'Example Public Domain',
      status: 'warning',
      days_remaining: 14,
      issuer: "Let's Encrypt Authority X3",
      tls_version: 'TLS 1.3',
      last_checked_at: new Date().toISOString(),
      check_frequency_minutes: 60,
      enable_email_alerts: true,
      enable_inapp_alerts: true
    },
    {
      id: 'site_05',
      user_id: 'usr_admin_01',
      domain: 'legacy-auth.corp.local',
      port: 443,
      name: 'Legacy Auth Microservice',
      status: 'expired',
      days_remaining: -4,
      issuer: "Let's Encrypt Authority X3",
      tls_version: 'TLS 1.2',
      last_checked_at: new Date().toISOString(),
      check_frequency_minutes: 15,
      enable_email_alerts: true,
      enable_inapp_alerts: true
    },
    {
      id: 'site_06',
      user_id: 'usr_admin_01',
      domain: 'api.financial-core.net',
      port: 443,
      name: 'Financial Core Ingestion',
      status: 'valid',
      days_remaining: 115,
      issuer: 'DigiCert Global G2 TLS RSA SHA256',
      tls_version: 'TLS 1.3',
      last_checked_at: new Date().toISOString(),
      check_frequency_minutes: 60,
      enable_email_alerts: true,
      enable_inapp_alerts: true
    }
  ];

  for (const site of sampleSites) {
    const existing = await db.findOne('monitored_sites', { id: site.id });
    if (!existing) {
      await db.insert('monitored_sites', site);
    }
  }

  // 3. Seed Scan Results
  const sampleScans = [
    {
      id: 'scan_google_01',
      site_id: 'site_01',
      user_id: 'usr_admin_01',
      url: 'https://google.com',
      domain: 'google.com',
      port: 443,
      ip_addresses: ['2a00:1450:4001:830::200e', '142.250.187.206'],
      status: 'valid',
      grade: 'A+',
      tls_version: 'TLS 1.3',
      cipher_suite: 'TLS_AES_256_GCM_SHA384',
      key_type: 'ECDSA (prime256v1)',
      key_size: 256,
      common_name: '*.google.com',
      sans: ['google.com', '*.google.com', '*.android.com', '*.appengine.google.com'],
      issuer: 'CN=GTS CA 1C3, O=Google Trust Services LLC, C=US',
      issuer_org: 'Google Trust Services',
      serial_number: '03:8B:2A:7E:1F:90:4B:2C:11:8A:9D:6E:5C:3A:2F',
      signature_algorithm: 'sha256WithRSAEncryption',
      valid_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      valid_to: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString(),
      days_remaining: 84,
      thumbprint_sha1: '3f7b2a9e1d8c4b6a5e0f7d2b9a8c1e3f5a7b9c1d',
      thumbprint_sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
      certificate_chain: [
        {
          type: 'Leaf Certificate',
          name: '*.google.com',
          organization: 'Google LLC',
          country: 'US',
          issuer: 'GTS CA 1C3',
          serial_number: '03:8B:2A:7E:1F:90:4B:2C:11:8A:9D:6E:5C:3A:2F',
          valid_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          valid_to: new Date(Date.now() + 84 * 24 * 60 * 60 * 1000).toISOString(),
          days_remaining: 84,
          signature_algorithm: 'sha256WithRSAEncryption',
          status: 'valid'
        },
        {
          type: 'Intermediate CA',
          name: 'GTS CA 1C3',
          organization: 'Google Trust Services LLC',
          country: 'US',
          issuer: 'GTS Root R1',
          serial_number: '02:03:BC:53:58:11:13:2B:B9:1A',
          valid_from: '2020-08-13T00:00:00.000Z',
          valid_to: '2027-09-30T00:00:00.000Z',
          days_remaining: 1130,
          signature_algorithm: 'sha256WithRSAEncryption',
          status: 'valid'
        },
        {
          type: 'Root CA',
          name: 'GTS Root R1',
          organization: 'Google Trust Services LLC',
          country: 'US',
          issuer: 'GTS Root R1',
          serial_number: '77:BD:0D:6C:DB:36:F9:1A:EA:21',
          valid_from: '2016-06-22T00:00:00.000Z',
          valid_to: '2036-06-22T00:00:00.000Z',
          days_remaining: 4316,
          signature_algorithm: 'sha256WithRSAEncryption',
          status: 'valid'
        }
      ],
      scanned_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    },
    {
      id: 'scan_corp_02',
      site_id: 'site_02',
      user_id: 'usr_admin_01',
      url: 'https://api.prod.internal.corp',
      domain: 'api.prod.internal.corp',
      port: 443,
      ip_addresses: ['10.0.4.15', '10.0.4.16'],
      status: 'valid',
      grade: 'A',
      tls_version: 'TLS 1.3',
      cipher_suite: 'TLS_AES_128_GCM_SHA256',
      key_type: 'RSA 2048',
      key_size: 2048,
      common_name: 'api.prod.internal.corp',
      sans: ['api.prod.internal.corp', '*.api.prod.internal.corp', 'legacy-api.prod.internal.corp'],
      issuer: 'CN=Internal Root CA G3, O=Acme Corp, C=US',
      issuer_org: 'Acme Corp',
      serial_number: '04:95:A3:F2:B1:C9:8D:7E:6F:5A:4B:3C:2D:1E:0F',
      signature_algorithm: 'sha256WithRSAEncryption',
      valid_from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      valid_to: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString(),
      days_remaining: 42,
      thumbprint_sha1: 'a1b2c3d4e5f678901234567890abcdef12345678',
      thumbprint_sha256: 'f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3',
      certificate_chain: [
        {
          type: 'Leaf Certificate',
          name: 'api.prod.internal.corp',
          organization: 'Acme Corp',
          country: 'US',
          issuer: 'Internal Root CA G3',
          serial_number: '04:95:A3:F2:B1:C9:8D:7E:6F:5A:4B:3C:2D:1E:0F',
          valid_from: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          valid_to: new Date(Date.now() + 42 * 24 * 60 * 60 * 1000).toISOString(),
          days_remaining: 42,
          signature_algorithm: 'sha256WithRSAEncryption',
          status: 'valid'
        },
        {
          type: 'Root CA',
          name: 'Internal Root CA G3',
          organization: 'Acme Corp',
          country: 'US',
          issuer: 'Internal Root CA G3',
          serial_number: '01:FD:6D:30:FC:A3:CA:51:A8:1B',
          valid_from: '2020-01-01T00:00:00.000Z',
          valid_to: '2035-01-01T00:00:00.000Z',
          days_remaining: 3770,
          signature_algorithm: 'sha256WithRSAEncryption',
          status: 'valid'
        }
      ],
      scanned_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    }
  ];

  for (const scan of sampleScans) {
    const existing = await db.findOne('scan_results', { id: scan.id });
    if (!existing) {
      await db.insert('scan_results', scan);
    }
  }

  // 4. Seed Alert Preferences
  const existingPrefs = await db.findOne('alert_preferences', { user_id: 'usr_admin_01' });
  if (!existingPrefs) {
    await db.insert('alert_preferences', {
      id: 'pref_admin_01',
      user_id: 'usr_admin_01',
      email_alerts_enabled: true,
      inapp_alerts_enabled: true,
      threshold_warning_1: 30,
      threshold_warning_2: 15,
      threshold_critical: 7,
      site_preferences: {}
    });
  }

  // 5. Seed Notifications
  const sampleNotifications = [
    {
      id: 'notif_01',
      user_id: 'usr_admin_01',
      type: 'critical',
      title: 'Certificate Expired: legacy-auth.corp.local',
      message: 'The certificate for legacy-auth.corp.local expired 4 days ago. Service degradation may occur.',
      domain: 'legacy-auth.corp.local',
      link: '/monitoring',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString()
    },
    {
      id: 'notif_02',
      user_id: 'usr_admin_01',
      type: 'warning',
      title: 'Upcoming Expiration: example.com',
      message: 'Certificate for example.com will expire in 14 days. Renewal suggested.',
      domain: 'example.com',
      link: '/monitoring',
      is_read: false,
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
    },
    {
      id: 'notif_03',
      user_id: 'usr_admin_01',
      type: 'success',
      title: 'Automated Renewal Verified: google.com',
      message: 'Certificate renewed successfully with GTS CA 1C3. Next expiry in 84 days.',
      domain: 'google.com',
      link: '/results?id=scan_google_01',
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 600).toISOString()
    },
    {
      id: 'notif_04',
      user_id: 'usr_admin_01',
      type: 'system',
      title: 'Scheduled Monitor Sweep Completed',
      message: 'Evaluated 6 monitored domains. 1 expired, 2 warning, 3 healthy.',
      domain: 'System',
      link: '/monitoring',
      is_read: true,
      created_at: new Date(Date.now() - 1000 * 60 * 1200).toISOString()
    }
  ];

  for (const notif of sampleNotifications) {
    const existing = await db.findOne('notifications', { id: notif.id });
    if (!existing) {
      await db.insert('notifications', notif);
    }
  }

  // 6. Seed API Keys
  const existingKey = await db.findOne('api_keys', { id: 'key_prod_01' });
  if (!existingKey) {
    await db.insert('api_keys', {
      id: 'key_prod_01',
      user_id: 'usr_admin_01',
      name: 'Production Ingestion Token',
      key_prefix: 'sec_live_9a8b...',
      key_hash: crypto.createHash('sha256').update('sec_live_9a8b1c2d3e4f5a6b').digest('hex'),
      last_used_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
    });

    await db.insert('api_keys', {
      id: 'key_ci_02',
      user_id: 'usr_admin_01',
      name: 'CI/CD Deployment Scanner',
      key_prefix: 'sec_live_4f2e...',
      key_hash: crypto.createHash('sha256').update('sec_live_4f2e5a6b7c8d9e0f').digest('hex'),
      last_used_at: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString()
    });
  }

  // 7. Seed Audit Logs
  const sampleAuditLogs = [
    {
      id: 'log_01',
      user_id: 'usr_admin_01',
      user_name: 'Analyst 01',
      user_role: 'Admin',
      action: 'SSL_SCAN_EXECUTED',
      resource_type: 'Domain',
      resource_id: 'google.com',
      details: 'Scanned google.com - Status: valid (84 days remaining)',
      ip_address: '192.168.1.100',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    },
    {
      id: 'log_02',
      user_id: 'usr_admin_01',
      user_name: 'Analyst 01',
      user_role: 'Admin',
      action: 'SITE_ADDED_TO_MONITOR',
      resource_type: 'Site',
      resource_id: 'site_01',
      details: 'Added google.com to active monitoring',
      ip_address: '192.168.1.100',
      created_at: new Date(Date.now() - 1000 * 60 * 40).toISOString()
    },
    {
      id: 'log_03',
      user_id: 'usr_admin_master',
      user_name: 'Sarah Chen',
      user_role: 'Admin',
      action: 'ALERT_PREFERENCES_UPDATED',
      resource_type: 'Preferences',
      resource_id: 'pref_admin_01',
      details: 'Updated warning thresholds to 30, 15, 7 days',
      ip_address: '192.168.1.105',
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
    }
  ];

  for (const log of sampleAuditLogs) {
    const existing = await db.findOne('audit_logs', { id: log.id });
    if (!existing) {
      await db.insert('audit_logs', log);
    }
  }

  console.log('✅ Database seed completed successfully!');
}

if (require.main === module) {
  seed().then(() => process.exit(0)).catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
}

module.exports = seed;
