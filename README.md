# SecureScan AI — SSL/TLS Certificate Scanner & Monitoring Platform

**SecureScan AI** is an enterprise-grade full-stack web application for scanning, analyzing, and continuously monitoring SSL/TLS certificates across websites and microservices.

---

## 🌟 Key Features

- **Live Native SSL/TLS Scanner**: Connects directly via Node.js native `tls` module with Server Name Indication (SNI) to extract real leaf and intermediate certificates, Subject Alternative Names (SANs), cipher suites, TLS protocol versions, signature algorithms, public key types, and SHA-1/SHA-256 fingerprints.
- **Certificate Chain Hierarchy**: Reconstructs and visualizes the complete certificate authority chain (Leaf &rarr; Intermediate CA &rarr; Root CA) with interactive node inspection.
- **Automated Background Monitoring**: Scheduled cron worker that re-evaluates all registered domains periodically, identifies expiring certificates, and updates site health statuses.
- **Multi-Tier Alert System**: Configurable expiration threshold warnings (e.g. 30, 15, and 7 days) and delivery channel preferences (Email Alerts and In-App Notifications) with an interactive Notifications Center.
- **Searchable Scan History & CSV Export**: Complete searchable and filterable database of past audits with one-click CSV export.
- **Role-Based Access Control (RBAC)**: Supports `Admin`, `Analyst`, and `Viewer` roles with team member invitation and permission management.
- **Audit Trail Logging**: Full audit trail recording all scans, site additions, permission updates, and security setting modifications with timestamps and IP addresses.
- **Pixel-Perfect Cyber Dark UI**: Engineered with Tailwind CSS, custom HUD radar scanning animations, glassmorphic tonal layering, and color-coded LED glowing status badges matching the project design system.
- **Zero-Config Dual-Database Engine**: Out-of-the-box support for PostgreSQL with an automatic zero-config persistent storage fallback for seamless local development.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Google Material Symbols Outlined, Inter & JetBrains Mono typography.
- **Backend**: Node.js, Express, Native `tls`, `crypto`, `net`, and `dns` modules, `node-cron`, `bcryptjs`, `jsonwebtoken`.
- **Database**: PostgreSQL (with `pg` connection pool and schema migrations), with integrated zero-config persistent storage fallback.
- **Testing**: Node.js built-in native test runner (`node --test`).

---

## 📁 Project Structure

```
stitch_securescan_ai_ssl_monitor/
├── server/
│   ├── index.js                  # Express server entrypoint & static client server
│   ├── db/
│   │   ├── index.js              # Database abstraction layer (PostgreSQL + Fallback)
│   │   ├── schema.sql            # PostgreSQL schema definitions
│   │   └── seed.js               # Initial seed data (users, sample domains, scans, logs)
│   ├── services/
│   │   ├── sslScanner.js         # Native Node.js TLS certificate extraction engine
│   │   ├── monitorCron.js        # Scheduled background multi-site monitoring worker
│   │   └── alertService.js       # Alert rules and notification engine
│   ├── routes/
│   │   ├── auth.js               # Login, Register, Profile, Role Switcher
│   │   ├── scan.js               # Live TLS scan endpoint & scan details
│   │   ├── sites.js              # Monitored domains CRUD & manual sweep triggers
│   │   ├── history.js            # Past scan results with search, filter, and CSV export
│   │   ├── alerts.js             # Alert preferences & notifications CRUD
│   │   ├── admin.js              # Team members management & audit logs
│   │   └── apiKeys.js            # API key generation & revocation
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & Role-based Access Control
│   │   └── audit.js              # Automatic audit logging helper
│   └── tests/
│       └── sslScanner.test.js    # Automated unit tests for scanner and cert parser
├── client/
│   ├── index.html                # HTML entry with preloaded fonts and icons
│   ├── vite.config.js            # Vite configuration with API proxy
│   ├── tailwind.config.js        # Design tokens from DESIGN.md
│   └── src/
│       ├── main.jsx              # React DOM root
│       ├── App.jsx               # Navigation router & main layout
│       ├── context/
│       │   ├── AuthContext.jsx   # Authentication state & role switcher
│       │   └── ScanContext.jsx   # Active scan state & scan triggers
│       ├── components/
│       │   ├── Sidebar.jsx       # Left sidebar navigation with live operational pulse
│       │   ├── Header.jsx        # Top header with quick-search, notifications, and profile
│       │   ├── AnimatedRadar.jsx # Concentric spinning HUD rings & laser pulse animation
│       │   ├── StatusBadge.jsx   # Color-coded glowing status pill
│       │   ├── GradeBadge.jsx    # Security score letter grade (A+, A, B, C, F)
│       │   └── Modal.jsx         # Glassmorphic modal dialog
│       └── pages/
│           ├── ScanHome.jsx      # Scan input page with active engine badge & sample targets
│           ├── ScanningPage.jsx  # HUD radar & terminal sequence loading state
│           ├── ResultsDashboard.jsx # Overview results card, bento metrics grid
│           ├── CertificateDetail.jsx # Deep metadata table & interactive cert chain tree
│           ├── ScanError.jsx     # Diagnostic details & retry action
│           ├── ScanHistory.jsx   # Searchable, filterable table + CSV export
│           ├── SiteMonitoring.jsx # Multi-site overview, stat cards, grid/list domains
│           ├── Notifications.jsx # Notification center with mark-all-as-read & filtering
│           ├── AlertSettings.jsx # Expiry thresholds (30/15/7) & delivery channel toggles
│           ├── AccountSettings.jsx # Profile, API Keys, Team Members (Admin), Audit Log
│           └── GetStarted.jsx    # Empty state / onboarding screen
├── package.json                  # Root package scripts
└── README.md                     # Documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- *(Optional)* **PostgreSQL**: v13+ if using a dedicated Postgres database (the application works out-of-the-box with zero configuration if PostgreSQL is not installed).

### Installation

1. Clone or navigate into the project directory:
   ```bash
   cd stitch_securescan_ai_ssl_monitor
   ```

2. Install dependencies for both server and client:
   ```bash
   npm --prefix server install
   npm --prefix client install
   ```

### Database Configuration

#### Option A: Zero-Config Embedded Engine (Default)
No setup required! Simply start the server and the app will automatically persist all users, scans, monitored sites, and logs to `server/data/securescan.json`.

#### Option B: PostgreSQL
Set the `DATABASE_URL` environment variable or standard PostgreSQL variables:
```bash
# Example .env file in server/
DATABASE_URL=postgresql://postgres:password@localhost:5432/securescan
# Or individual parameters:
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=securescan
```

---

## 💻 Running the Application

### 1. Build and Run the Complete Application (Single Server)
```bash
# Build frontend assets
npm --prefix client run build

# Start the full-stack server
node server/index.js
```
Open your browser at **`http://localhost:5000`**.

### 2. Development Mode with Hot-Reloading
In two separate terminals:

**Terminal 1 (Backend API & Cron Engine):**
```bash
node --watch server/index.js
```

**Terminal 2 (Frontend with Vite HMR):**
```bash
npm --prefix client run dev
```
Open your browser at **`http://localhost:3000`** (requests are proxied to `http://localhost:5000`).

---

## 🧪 Running Automated Tests

Run the test suite for the TLS scanner, certificate parser, and status logic:
```bash
node --test server/tests/sslScanner.test.js
```

---

## 👥 Demo Accounts & Role-Based Access

The database is pre-seeded with accounts for immediate testing:

| Persona | Email | Password | Role | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Analyst 01** | `analyst.01@securescan.ai` | `password123` | **Admin** | Full system access, team management, audit trail logs, settings |
| **Sarah Chen** | `admin@securescan.ai` | `password123` | **Admin** | Full system access |
| **Marcus Vance** | `marcus.v@securescan.ai` | `password123` | **Analyst** | Live scans, domain monitoring, alert configuration |
| **Elena Rostova** | `viewer@securescan.ai` | `password123` | **Viewer** | Read-only scan results and history inspection |

> **Tip**: Use the **Persona Switcher** in the top-right header to instantly toggle between `Admin`, `Analyst`, and `Viewer` personas without having to log out.

---

## 📡 REST API Reference

### SSL/TLS Scanning
- `POST /api/scan`: Run a live TLS scan on a URL or domain.
  - Body: `{"url": "https://google.com"}`
- `GET /api/scan/:id`: Retrieve scan details by ID.
- `GET /api/scan/list/recent`: Retrieve recently scanned domains.

### Monitored Domains
- `GET /api/sites`: List monitored sites with stats (Total, Expiring Soon, Expired, Healthy).
- `POST /api/sites`: Add a domain to active monitoring and trigger an initial scan.
- `DELETE /api/sites/:id`: Remove a domain from monitoring.
- `POST /api/sites/:id/scan`: Manually trigger an immediate re-scan of a specific domain.
- `POST /api/sites/check-all`: Execute a full background monitoring sweep across all registered domains.

### Scan History & Export
- `GET /api/history?q=query&status=valid&page=1&limit=50`: Search and filter scan history.
- `GET /api/history/export.csv`: Export all scan history records as a downloadable CSV.
- `DELETE /api/history/:id`: Delete a history record.

### Alerts & Notifications
- `GET /api/alerts/preferences`: Retrieve user threshold and delivery preferences.
- `PUT /api/alerts/preferences`: Update expiry thresholds (e.g. 30, 15, 7 days) and notification toggles.
- `GET /api/alerts/notifications`: Retrieve notification feed with unread counter.
- `PUT /api/alerts/notifications/read-all`: Mark all notifications as read.
- `PUT /api/alerts/notifications/:id/read`: Mark a specific notification as read.

### Administration & API Keys
- `GET /api/admin/members`: List team members (Admin/Analyst).
- `POST /api/admin/members`: Invite a new team member with assigned role.
- `PUT /api/admin/members/:id/role`: Update member role (`Admin`, `Analyst`, `Viewer`).
- `GET /api/admin/audit-logs`: View system audit trail logs (Admin only).
- `GET /api/apikeys`: List active API access tokens.
- `POST /api/apikeys`: Generate a new programmatic API token.
- `DELETE /api/apikeys/:id`: Revoke an API token.

---

## 🛡️ License

MIT License &bull; SecureScan AI Team
