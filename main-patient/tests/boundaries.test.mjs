import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const files = fs.readdirSync(src, { recursive: true }).filter(p => /\.(js|jsx)$/.test(p));
const all = files.map(p => fs.readFileSync(path.join(src, p), 'utf8')).join('\n');

test('patient app has no Clinician or Admin page dependency', () => {
  assert.equal(fs.existsSync(path.join(src, 'pages/clinician')), false);
  assert.equal(fs.existsSync(path.join(src, 'pages/admin')), false);
  assert.doesNotMatch(all, /@\/pages\/(clinician|admin)/);
});

test('patient app does not include clinician patient lookup API', () => {
  assert.equal(fs.existsSync(path.join(src, 'api/patientApi.js')), false);
  assert.doesNotMatch(all, /@\/api\/patientApi/);
});

test('patient routes and login are local to this app', () => {
  assert.match(all, /path="\/login"/);
  for (const route of ['health-consultation', 'medical-profile', 'medical-report-analysis']) assert.match(all, new RegExp(`path: "\\/${route}"`));
});

test('patient app is independently installable', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const lockfile = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  assert.equal(packageJson.name, 'main-patient');
  assert.equal(lockfile.packages[''].name, 'main-patient');
});

test('fresh login token is available to external redirects', () => {
  const auth = fs.readFileSync(path.join(src, 'context/AuthContext.jsx'), 'utf8');
  assert.match(auth, /return \{ \.\.\.userData, access_token: tokenData \}/);
});
