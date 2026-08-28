const tls = require('tls');
const net = require('net');
const dns = require('dns').promises;
const crypto = require('crypto');
const { URL } = require('url');

/**
 * Validates whether a hostname or IP is syntactically valid
 */
function isValidHostname(host) {
  if (!host || typeof host !== 'string') return false;
  const trimmed = host.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed.length > 253) return false;
  if (trimmed.includes(' ') || trimmed.includes('/') || trimmed.includes('\\') || trimmed.includes('@')) return false;

  // Check IPv4
  if (net.isIPv4(trimmed)) return true;

  // Check IPv6 (strip brackets if any)
  const cleanIPv6 = trimmed.replace(/^\[|\]$/g, '');
  if (net.isIPv6(cleanIPv6)) return true;

  // Domain syntax check (RFC 1035 / RFC 1123)
  // Each label 1-63 chars, alphanumeric with hyphens, not starting or ending with hyphen
  const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
  const localhostRegex = /^localhost$/i;
  const singleLabelRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?$/;

  return domainRegex.test(trimmed) || localhostRegex.test(trimmed) || singleLabelRegex.test(trimmed);
}

/**
 * Normalizes user input into a validated hostname, port, and standard HTTPS URL
 */
function parseTarget(input) {
  if (!input || typeof input !== 'string') {
    return {
      valid: false,
      hostname: '',
      port: 443,
      url: '',
      error: 'Website URL or domain name is required.'
    };
  }

  let clean = input.trim();
  if (!clean) {
    return {
      valid: false,
      hostname: '',
      port: 443,
      url: '',
      error: 'Website URL or domain name cannot be empty.'
    };
  }

  let parsedProtocol = 'https:';
  let port = 443;
  let hostname = '';

  try {
    let toParse = clean;
    if (!toParse.startsWith('http://') && !toParse.startsWith('https://')) {
      toParse = 'https://' + toParse;
    }

    const parsed = new URL(toParse);
    parsedProtocol = parsed.protocol;
    hostname = parsed.hostname;
    
    if (parsed.port) {
      port = parseInt(parsed.port, 10);
    } else if (parsedProtocol === 'http:') {
      // Default to 443 for SSL scan even if user typed http:// without custom port
      port = 443;
      parsedProtocol = 'https:';
    } else {
      port = 443;
    }
  } catch (err) {
    // Fallback extraction
    const rawClean = clean.replace(/^[a-zA-Z]+:\/\//, '').split('/')[0].split('?')[0].split('#')[0];
    const [hostPart, portPart] = rawClean.split(':');
    hostname = hostPart;
    port = portPart ? parseInt(portPart, 10) : 443;
  }

  // Strip trailing dot if present
  if (hostname.endsWith('.')) {
    hostname = hostname.slice(0, -1);
  }

  if (!isValidHostname(hostname)) {
    return {
      valid: false,
      hostname,
      port,
      url: `https://${hostname}${port !== 443 ? ':' + port : ''}`,
      error: `"${input}" is not a valid website URL or domain name. Please enter a valid address (e.g. example.com or https://example.com).`
    };
  }

  const normalizedUrl = `${parsedProtocol}//${hostname}${port !== 443 && port !== 80 ? ':' + port : ''}`;

  return {
    valid: true,
    hostname,
    port: isNaN(port) || port <= 0 || port > 65535 ? 443 : port,
    url: normalizedUrl,
    error: null
  };
}

/**
 * Computes SHA-1 and SHA-256 thumbprints for raw certificate buffer
 */
function computeThumbprints(cert) {
  let sha1 = cert.fingerprint ? cert.fingerprint.replace(/:/g, '').toLowerCase() : '';
  let sha256 = cert.fingerprint256 ? cert.fingerprint256.replace(/:/g, '').toLowerCase() : '';

  if (cert.raw && Buffer.isBuffer(cert.raw)) {
    if (!sha1) {
      sha1 = crypto.createHash('sha1').update(cert.raw).digest('hex');
    }
    if (!sha256) {
      sha256 = crypto.createHash('sha256').update(cert.raw).digest('hex');
    }
  }

  return { sha1, sha256 };
}

/**
 * Parses raw certificate object from TLS socket and builds structured metadata
 */
function parseCertificate(cert, rawPeerCert, cipherInfo, protocolVersion) {
  if (!cert) return null;

  const validFrom = new Date(cert.valid_from);
  const validTo = new Date(cert.valid_to);
  const now = new Date();

  const msRemaining = validTo.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  // Determine certificate validity status
  let status = 'valid';
  if (daysRemaining < 0) {
    status = 'expired';
  } else if (daysRemaining <= 30) {
    status = 'warning';
  }

  // Parse SANs (Subject Alternative Names)
  let sans = [];
  if (cert.subjectaltname) {
    sans = cert.subjectaltname.split(',').map(s => s.trim().replace(/^DNS:/i, ''));
  }

  // Parse Public Key Info
  let keyType = 'RSA';
  let keySize = 2048;
  if (cert.bits) {
    keySize = cert.bits;
  }
  if (cert.asn1Curve) {
    keyType = `ECDSA (${cert.asn1Curve})`;
  } else if (cert.pubkey) {
    keyType = `RSA ${keySize}`;
  } else if (cert.bits) {
    keyType = `RSA ${cert.bits}`;
  }

  // Parse Issuer Org
  let issuerOrg = '';
  if (cert.issuer) {
    issuerOrg = cert.issuer.O || cert.issuer.CN || cert.issuer.OU || 'Unknown Issuer';
  }

  // Calculate Security Grade
  let grade = 'A';
  if (status === 'expired') {
    grade = 'F';
  } else if (protocolVersion === 'TLSv1.3') {
    grade = daysRemaining > 30 ? 'A+' : 'A';
  } else if (protocolVersion === 'TLSv1.2') {
    grade = daysRemaining > 30 ? 'A' : 'B';
  } else if (protocolVersion === 'TLSv1' || protocolVersion === 'TLSv1.1') {
    grade = 'C';
  }

  // Format Serial Number
  let serialNumber = cert.serialNumber || '';
  if (serialNumber && !serialNumber.includes(':') && serialNumber.length > 8) {
    serialNumber = serialNumber.match(/.{1,2}/g)?.join(':').toUpperCase() || serialNumber;
  }

  const { sha1, sha256 } = computeThumbprints(cert);

  return {
    common_name: cert.subject?.CN || cert.subject?.O || 'Unknown',
    sans: sans,
    issuer: cert.issuer ? Object.entries(cert.issuer).map(([k, v]) => `${k}=${v}`).join(', ') : 'Unknown',
    issuer_org: issuerOrg,
    serial_number: serialNumber,
    signature_algorithm: cert.sigalg || cert.signatureAlgorithm || 'sha256WithRSAEncryption',
    valid_from: isNaN(validFrom.getTime()) ? null : validFrom.toISOString(),
    valid_to: isNaN(validTo.getTime()) ? null : validTo.toISOString(),
    days_remaining: daysRemaining,
    thumbprint_sha1: sha1,
    thumbprint_sha256: sha256,
    key_type: keyType,
    key_size: keySize,
    tls_version: protocolVersion || 'TLSv1.3',
    cipher_suite: cipherInfo?.name || 'TLS_AES_256_GCM_SHA384',
    status: status,
    grade: grade
  };
}

/**
 * Builds authentic certificate chain strictly from the presented peer certificate graph.
 * Zero hardcoded mock fallback CA entries are used.
 */
function buildCertificateChain(leafCert, targetHost) {
  const chain = [];
  const visited = new Set();
  let current = leafCert;
  let level = 0;

  while (current && !visited.has(current)) {
    visited.add(current);
    const isLeaf = level === 0;
    const isSelfSigned = current.issuer?.CN && current.subject?.CN && current.issuer?.CN === current.subject?.CN;
    const isRoot = !current.issuerCertificate || current.issuerCertificate === current || isSelfSigned;

    const validFrom = current.valid_from ? new Date(current.valid_from).toISOString() : '';
    const validTo = current.valid_to ? new Date(current.valid_to).toISOString() : '';
    const daysRemaining = current.valid_to ? Math.ceil((new Date(current.valid_to).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    const { sha1, sha256 } = computeThumbprints(current);

    chain.push({
      type: isLeaf ? 'Leaf Certificate' : isRoot ? 'Root CA' : 'Intermediate CA',
      name: current.subject?.CN || current.subject?.O || (isLeaf ? targetHost : 'Certificate Authority'),
      organization: current.subject?.O || current.issuer?.O || 'Certificate Authority',
      country: current.subject?.C || current.issuer?.C || '',
      issuer: current.issuer?.CN || current.issuer?.O || (isRoot ? 'Self-signed Root' : 'Unknown CA'),
      serial_number: current.serialNumber || '',
      valid_from: validFrom,
      valid_to: validTo,
      days_remaining: daysRemaining,
      signature_algorithm: current.sigalg || current.signatureAlgorithm || 'sha256WithRSAEncryption',
      thumbprint_sha1: sha1,
      thumbprint_sha256: sha256,
      status: daysRemaining < 0 ? 'expired' : 'valid'
    });

    if (isRoot || !current.issuerCertificate || current.issuerCertificate === current) {
      break;
    }
    current = current.issuerCertificate;
    level++;
  }

  return chain;
}

/**
 * Scans an SSL/TLS target using native TLS socket connection
 */
async function scanSSL(inputUrl, options = {}) {
  const timeoutMs = options.timeout || 8000;
  const parsedTarget = parseTarget(inputUrl);

  if (!parsedTarget.valid) {
    return {
      url: parsedTarget.url || inputUrl,
      domain: parsedTarget.hostname || inputUrl,
      port: parsedTarget.port || 443,
      ip_addresses: [],
      status: 'error',
      grade: 'F',
      error_code: 'ERR_INVALID_URL',
      error_message: parsedTarget.error || 'The entered website address is invalid. Please check the spelling and try again.',
      scanned_at: new Date().toISOString()
    };
  }

  const { hostname, port, url } = parsedTarget;

  // 1. Resolve DNS for IPv4 and IPv6
  let ipAddresses = [];
  try {
    const v4 = await dns.resolve4(hostname).catch(() => []);
    const v6 = await dns.resolve6(hostname).catch(() => []);
    ipAddresses = [...v6, ...v4];
    if (ipAddresses.length === 0) {
      const lookup = await dns.lookup(hostname).catch(() => null);
      if (lookup && lookup.address) {
        ipAddresses.push(lookup.address);
      }
    }
  } catch (dnsErr) {
    // DNS resolution failure will be captured during socket connection
  }

  return new Promise((resolve) => {
    let completed = false;

    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        if (socket) socket.destroy();
        resolve({
          url,
          domain: hostname,
          port,
          ip_addresses: ipAddresses,
          status: 'error',
          grade: 'F',
          error_code: 'ERR_CONNECTION_TIMED_OUT',
          error_message: `Connection to ${hostname}:${port} timed out after ${timeoutMs}ms. The server may be offline or blocking TLS handshakes.`,
          scanned_at: new Date().toISOString()
        });
      }
    }, timeoutMs);

    let socket;
    try {
      socket = tls.connect({
        host: hostname,
        port: port,
        servername: hostname, // SNI support
        rejectUnauthorized: false, // Inspect expired/self-signed/untrusted certificates
        requestCert: true,
        timeout: timeoutMs
      }, () => {
        if (completed) return;
        clearTimeout(timer);
        completed = true;

        try {
          const peerCert = socket.getPeerCertificate(true);
          const cipherInfo = socket.getCipher();
          const protocolVersion = socket.getProtocol();
          const authorized = socket.authorized;
          const authError = socket.authorizationError;

          if (!peerCert || Object.keys(peerCert).length === 0) {
            socket.destroy();
            return resolve({
              url,
              domain: hostname,
              port,
              ip_addresses: ipAddresses,
              status: 'error',
              grade: 'F',
              error_code: 'ERR_NO_CERTIFICATE',
              error_message: `The remote host ${hostname}:${port} connected successfully but did not present an SSL/TLS certificate.`,
              scanned_at: new Date().toISOString()
            });
          }

          const parsed = parseCertificate(peerCert, peerCert, cipherInfo, protocolVersion);
          const chain = buildCertificateChain(peerCert, hostname);

          // Update status if authorization failed (e.g. untrusted root or expired)
          if (!authorized && authError) {
            if (authError.includes('expired') || authError.includes('CERT_HAS_EXPIRED')) {
              parsed.status = 'expired';
              parsed.grade = 'F';
            } else if (parsed.status === 'valid') {
              parsed.status = 'warning';
              parsed.grade = 'B';
            }
          }

          socket.destroy();

          resolve({
            url,
            domain: hostname,
            port,
            ip_addresses: ipAddresses,
            authorized,
            auth_error: authError || null,
            ...parsed,
            certificate_chain: chain,
            scanned_at: new Date().toISOString()
          });
        } catch (parseErr) {
          socket.destroy();
          resolve({
            url,
            domain: hostname,
            port,
            ip_addresses: ipAddresses,
            status: 'error',
            grade: 'F',
            error_code: 'ERR_PARSING_FAILED',
            error_message: `Failed to parse TLS certificate from ${hostname}: ${parseErr.message}`,
            scanned_at: new Date().toISOString()
          });
        }
      });

      socket.on('error', (err) => {
        if (completed) return;
        clearTimeout(timer);
        completed = true;
        if (socket) socket.destroy();

        let errorCode = err.code || 'ERR_CONNECTION_FAILED';
        let errorMessage = err.message || `Failed to establish TLS handshake with ${hostname}:${port}.`;

        if (err.code === 'ENOTFOUND') {
          errorCode = 'ERR_HOST_NOT_FOUND';
          errorMessage = `Unable to resolve host "${hostname}". Please verify that the domain name is spelled correctly and exists in DNS.`;
        } else if (err.code === 'ECONNREFUSED') {
          errorCode = 'ERR_CONNECTION_REFUSED';
          errorMessage = `Connection refused by ${hostname}:${port}. The server may not be running an HTTPS service on port ${port}.`;
        } else if (err.code === 'EHOSTUNREACH') {
          errorCode = 'ERR_HOST_UNREACHABLE';
          errorMessage = `Host ${hostname} is unreachable. Check network connectivity.`;
        } else if (err.code === 'ECONNRESET') {
          errorCode = 'ERR_CONNECTION_RESET';
          errorMessage = `Connection was abruptly closed or reset by ${hostname}:${port} during TLS handshake.`;
        } else if (err.code === 'CERT_HAS_EXPIRED') {
          errorCode = 'ERR_CERT_DATE_INVALID';
          errorMessage = `The SSL/TLS certificate for ${hostname} has expired.`;
        } else if (err.code === 'DEPTH_ZERO_SELF_SIGNED_CERT') {
          errorCode = 'ERR_CERT_AUTHORITY_INVALID';
          errorMessage = `Self-signed certificate presented by ${hostname}.`;
        }

        resolve({
          url,
          domain: hostname,
          port,
          ip_addresses: ipAddresses,
          status: 'error',
          grade: 'F',
          error_code: errorCode,
          error_message: errorMessage,
          scanned_at: new Date().toISOString()
        });
      });

    } catch (err) {
      if (completed) return;
      clearTimeout(timer);
      completed = true;
      resolve({
        url,
        domain: hostname,
        port,
        ip_addresses: ipAddresses,
        status: 'error',
        grade: 'F',
        error_code: 'ERR_SOCKET_INIT',
        error_message: err.message || 'Failed to initialize TLS socket connection.',
        scanned_at: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  scanSSL,
  parseTarget,
  parseCertificate,
  buildCertificateChain,
  isValidHostname
};
