const cron = require('node-cron');
const crypto = require('crypto');
const { db } = require('../db');
const { scanSSL } = require('./sslScanner');
const { evaluateAndTriggerAlerts } = require('./alertService');

let cronJob = null;
let isRunningSweep = false;

/**
 * Runs a single monitoring scan on a specific site
 */
async function checkSite(site) {
  try {
    const targetUrl = `https://${site.domain}${site.port && site.port !== 443 ? ':' + site.port : ''}`;
    const scanData = await scanSSL(targetUrl);

    const scanId = crypto.randomUUID();
    const scanRecord = {
      id: scanId,
      site_id: site.id,
      user_id: site.user_id,
      url: scanData.url,
      domain: scanData.domain,
      port: scanData.port,
      ip_addresses: scanData.ip_addresses || [],
      status: scanData.status,
      grade: scanData.grade || 'A',
      tls_version: scanData.tls_version || null,
      cipher_suite: scanData.cipher_suite || null,
      key_type: scanData.key_type || null,
      key_size: scanData.key_size || null,
      common_name: scanData.common_name || null,
      sans: scanData.sans || [],
      issuer: scanData.issuer || null,
      issuer_org: scanData.issuer_org || null,
      serial_number: scanData.serial_number || null,
      signature_algorithm: scanData.signature_algorithm || null,
      valid_from: scanData.valid_from || null,
      valid_to: scanData.valid_to || null,
      days_remaining: scanData.days_remaining !== undefined ? scanData.days_remaining : null,
      thumbprint_sha1: scanData.thumbprint_sha1 || null,
      thumbprint_sha256: scanData.thumbprint_sha256 || null,
      certificate_chain: scanData.certificate_chain || [],
      error_code: scanData.error_code || null,
      error_message: scanData.error_message || null,
      scanned_at: new Date().toISOString()
    };

    await db.insert('scan_results', scanRecord);

    // Update Monitored Site Status
    await db.update(
      'monitored_sites',
      { id: site.id },
      {
        status: scanData.status,
        days_remaining: scanData.days_remaining || 0,
        issuer: scanData.issuer_org || scanData.issuer || site.issuer,
        tls_version: scanData.tls_version || site.tls_version,
        last_scan_id: scanId,
        last_checked_at: new Date().toISOString()
      }
    );

    // Evaluate alerts
    await evaluateAndTriggerAlerts(scanRecord, site.user_id);

    return scanRecord;
  } catch (err) {
    console.error(`Error monitoring site ${site.domain}:`, err);
    return null;
  }
}

/**
 * Runs a check on all monitored sites
 */
async function checkAllMonitoredSites() {
  if (isRunningSweep) {
    return { status: 'busy', message: 'A monitoring sweep is already running' };
  }

  isRunningSweep = true;
  console.log(`[Cron Monitor] Initiating scheduled SSL check for all monitored sites at ${new Date().toISOString()}`);

  try {
    const sites = await db.findMany('monitored_sites', {});
    const results = [];

    for (const site of sites) {
      const res = await checkSite(site);
      if (res) results.push(res);
    }

    // Log to audit log
    await db.insert('audit_logs', {
      id: crypto.randomUUID(),
      user_name: 'System Scheduler',
      user_role: 'System',
      action: 'MONITORING_SWEEP_EXECUTED',
      resource_type: 'Sites',
      resource_id: 'ALL',
      details: `Completed monitoring check for ${sites.length} sites (${results.filter(r => r.status === 'valid').length} valid, ${results.filter(r => r.status !== 'valid').length} alerts).`,
      ip_address: '127.0.0.1'
    });

    return { status: 'success', checked_count: sites.length, results };
  } catch (err) {
    console.error('[Cron Monitor] Error during sweep:', err);
    return { status: 'error', message: err.message };
  } finally {
    isRunningSweep = false;
  }
}

/**
 * Initializes the background cron schedule
 */
function startMonitoringCron(scheduleExpression = '*/15 * * * *') {
  if (cronJob) {
    cronJob.stop();
  }

  console.log(`[Cron Monitor] Starting background monitor with schedule: ${scheduleExpression}`);
  cronJob = cron.schedule(scheduleExpression, () => {
    checkAllMonitoredSites();
  });
}

module.exports = {
  startMonitoringCron,
  checkAllMonitoredSites,
  checkSite
};
