-- SecureScan AI PostgreSQL Schema

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(32) NOT NULL DEFAULT 'Analyst', -- 'Admin', 'Analyst', 'Viewer'
  title VARCHAR(255) DEFAULT 'Security Analyst',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS monitored_sites (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  port INTEGER DEFAULT 443,
  name VARCHAR(255),
  status VARCHAR(32) DEFAULT 'valid', -- 'valid', 'warning', 'expired', 'error', 'pending'
  days_remaining INTEGER DEFAULT 0,
  issuer VARCHAR(255),
  tls_version VARCHAR(32),
  last_scan_id VARCHAR(64),
  last_checked_at TIMESTAMP WITH TIME ZONE,
  check_frequency_minutes INTEGER DEFAULT 60,
  enable_email_alerts BOOLEAN DEFAULT TRUE,
  enable_inapp_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS scan_results (
  id VARCHAR(64) PRIMARY KEY,
  site_id VARCHAR(64),
  user_id VARCHAR(64),
  url VARCHAR(512) NOT NULL,
  domain VARCHAR(255) NOT NULL,
  port INTEGER DEFAULT 443,
  ip_addresses TEXT, -- JSON array of string IPs
  status VARCHAR(32) NOT NULL, -- 'valid', 'warning', 'expired', 'error'
  grade VARCHAR(8) DEFAULT 'A', -- 'A+', 'A', 'B', 'C', 'F'
  tls_version VARCHAR(32),
  cipher_suite VARCHAR(128),
  key_type VARCHAR(64),
  key_size INTEGER,
  common_name VARCHAR(255),
  sans TEXT, -- JSON array or comma list of Subject Alternative Names
  issuer VARCHAR(512),
  issuer_org VARCHAR(255),
  serial_number VARCHAR(128),
  signature_algorithm VARCHAR(128),
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_to TIMESTAMP WITH TIME ZONE,
  days_remaining INTEGER,
  thumbprint_sha1 VARCHAR(128),
  thumbprint_sha256 VARCHAR(128),
  certificate_chain TEXT, -- JSON array of cert details
  error_code VARCHAR(128),
  error_message TEXT,
  raw_details TEXT, -- JSON full payload
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS alert_preferences (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_alerts_enabled BOOLEAN DEFAULT TRUE,
  inapp_alerts_enabled BOOLEAN DEFAULT TRUE,
  threshold_warning_1 INTEGER DEFAULT 30,
  threshold_warning_2 INTEGER DEFAULT 15,
  threshold_critical INTEGER DEFAULT 7,
  site_preferences TEXT, -- JSON map of siteId -> { email: bool, inapp: bool }
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(32) NOT NULL, -- 'critical', 'warning', 'success', 'system'
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  domain VARCHAR(255),
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS api_keys (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  key_prefix VARCHAR(16) NOT NULL,
  key_hash VARCHAR(255) NOT NULL,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64),
  user_name VARCHAR(255),
  user_role VARCHAR(32),
  action VARCHAR(128) NOT NULL,
  resource_type VARCHAR(64),
  resource_id VARCHAR(64),
  details TEXT,
  ip_address VARCHAR(64),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
