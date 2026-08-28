const test = require('node:test');
const assert = require('node:assert');
const { parseTarget, parseCertificate, buildCertificateChain, scanSSL } = require('../services/sslScanner');

test('Target Parser - should handle clean domain, protocol, and custom port', () => {
  const t1 = parseTarget('google.com');
  assert.strictEqual(t1.hostname, 'google.com');
  assert.strictEqual(t1.port, 443);

  const t2 = parseTarget('https://api.github.com:8443/v1/user');
  assert.strictEqual(t2.hostname, 'api.github.com');
  assert.strictEqual(t2.port, 8443);

  const t3 = parseTarget('http://test.internal:8080');
  assert.strictEqual(t3.hostname, 'test.internal');
  assert.strictEqual(t3.port, 8080);
});

test('Certificate Parser - should evaluate valid certificates with correct days remaining', () => {
  const mockPeerCert = {
    subject: { CN: 'test.example.com', O: 'Example Inc', C: 'US' },
    issuer: { CN: 'DigiCert Global CA', O: 'DigiCert Inc', C: 'US' },
    valid_from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toUTCString(),
    valid_to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toUTCString(),
    subjectaltname: 'DNS:test.example.com, DNS:*.example.com',
    serialNumber: '0A1B2C3D4E5F6A7B',
    sigalg: 'sha256WithRSAEncryption',
    bits: 2048,
    fingerprint: 'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD',
    fingerprint256: 'AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99'
  };

  const parsed = parseCertificate(mockPeerCert, mockPeerCert, { name: 'TLS_AES_256_GCM_SHA384' }, 'TLSv1.3');

  assert.strictEqual(parsed.common_name, 'test.example.com');
  assert.strictEqual(parsed.status, 'valid');
  assert.strictEqual(parsed.grade, 'A+');
  assert.strictEqual(parsed.days_remaining, 60);
  assert.deepStrictEqual(parsed.sans, ['test.example.com', '*.example.com']);
  assert.strictEqual(parsed.key_type, 'RSA 2048');
});

test('Certificate Parser - should detect expired certificates and assign Grade F', () => {
  const mockExpiredCert = {
    subject: { CN: 'expired.example.com' },
    issuer: { CN: 'Test CA', O: 'Test CA Corp' },
    valid_from: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toUTCString(),
    valid_to: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toUTCString(),
    subjectaltname: 'DNS:expired.example.com',
    bits: 2048
  };

  const parsed = parseCertificate(mockExpiredCert, mockExpiredCert, { name: 'TLS_AES_128_GCM_SHA256' }, 'TLSv1.3');

  assert.strictEqual(parsed.status, 'expired');
  assert.strictEqual(parsed.grade, 'F');
  assert.ok(parsed.days_remaining < 0);
});

test('Certificate Parser - should flag warning status when certificate expires within 30 days', () => {
  const mockExpiringSoon = {
    subject: { CN: 'expiring.example.com' },
    issuer: { CN: 'Test CA', O: 'Test CA Corp' },
    valid_from: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toUTCString(),
    valid_to: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toUTCString(),
    subjectaltname: 'DNS:expiring.example.com',
    bits: 2048
  };

  const parsed = parseCertificate(mockExpiringSoon, mockExpiringSoon, { name: 'TLS_AES_128_GCM_SHA256' }, 'TLSv1.3');

  assert.strictEqual(parsed.status, 'warning');
  assert.ok(parsed.days_remaining <= 30);
});

test('Certificate Chain Builder - should build hierarchy structure with Leaf, Intermediate, and Root', () => {
  const mockLeaf = {
    subject: { CN: 'api.corp.internal', O: 'Corp Inc', C: 'US' },
    issuer: { CN: 'Intermediate CA G2', O: 'Corp CA Org', C: 'US' },
    valid_to: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toUTCString(),
    serialNumber: '1122334455',
    issuerCertificate: {
      subject: { CN: 'Intermediate CA G2', O: 'Corp CA Org', C: 'US' },
      issuer: { CN: 'Root CA Primary', O: 'Corp CA Org', C: 'US' },
      valid_to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString(),
      serialNumber: '9988776655',
      issuerCertificate: {
        subject: { CN: 'Root CA Primary', O: 'Corp CA Org', C: 'US' },
        issuer: { CN: 'Root CA Primary', O: 'Corp CA Org', C: 'US' },
        valid_to: new Date(Date.now() + 3650 * 24 * 60 * 60 * 1000).toUTCString(),
        serialNumber: '0000000001'
      }
    }
  };

  const chain = buildCertificateChain(mockLeaf, 'api.corp.internal');

  assert.strictEqual(chain.length, 3);
  assert.strictEqual(chain[0].type, 'Leaf Certificate');
  assert.strictEqual(chain[1].type, 'Intermediate CA');
  assert.strictEqual(chain[2].type, 'Root CA');
});

test('Target Parser - should validate domain syntax and reject invalid inputs', () => {
  const v1 = parseTarget('google.com');
  assert.strictEqual(v1.valid, true);
  assert.strictEqual(v1.hostname, 'google.com');
  assert.strictEqual(v1.port, 443);

  const v2 = parseTarget('https://api.github.com:8443/v1/user');
  assert.strictEqual(v2.valid, true);
  assert.strictEqual(v2.hostname, 'api.github.com');
  assert.strictEqual(v2.port, 8443);

  const v3 = parseTarget('http://1.1.1.1');
  assert.strictEqual(v3.valid, true);
  assert.strictEqual(v3.hostname, '1.1.1.1');
  assert.strictEqual(v3.port, 443);

  const inv1 = parseTarget('invalid website with spaces');
  assert.strictEqual(inv1.valid, false);
  assert.ok(inv1.error);

  const inv2 = parseTarget('');
  assert.strictEqual(inv2.valid, false);

  const inv3 = parseTarget('https://');
  assert.strictEqual(inv3.valid, false);
});

test('Live Scan Error Handling - should return structured error object on malformed URL', async () => {
  const result = await scanSSL('bad url with space');
  assert.strictEqual(result.status, 'error');
  assert.strictEqual(result.grade, 'F');
  assert.strictEqual(result.error_code, 'ERR_INVALID_URL');
  assert.ok(result.error_message.includes('not a valid website URL'));
});

test('Live Scan Error Handling - should return structured error object on non-existent domain', async () => {
  const result = await scanSSL('invalid-nonexistent-domain-xyz-987654321.test', { timeout: 2000 });
  assert.strictEqual(result.status, 'error');
  assert.strictEqual(result.grade, 'F');
  assert.ok(result.error_code);
  assert.ok(result.error_message);
});
