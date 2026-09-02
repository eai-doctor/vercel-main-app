import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const files = fs.readdirSync(src, { recursive: true }).filter(p => /\.(js|jsx)$/.test(p));
const all = files.map(p => fs.readFileSync(path.join(src, p), 'utf8')).join('\n');

test('clinician app has no Patient page dependency', () => {
  assert.equal(fs.existsSync(path.join(src, 'pages/patient')), false);
  assert.doesNotMatch(all, /@\/pages\/patient/);
});

test('clinician owns patient lookup API and routes', () => {
  const api = fs.readFileSync(path.join(src, 'api/patientApi.js'), 'utf8');
  assert.match(api, /patient\/list/);
  assert.match(api, /patient\/get/);
  assert.match(all, /path: "\/patients"/);
  assert.match(all, /path: "\/consultation"/);
});

test('FHIR conversion is independent of Patient pages', () => {
  const fhir = fs.readFileSync(path.join(src, 'utils/fhir.js'), 'utf8');
  assert.match(fhir, /@\/utils\/healthRecords/);
  assert.doesNotMatch(fhir, /pages\/patient/);
});

test('clinician app is independently installable', () => {
  const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const lockfile = JSON.parse(fs.readFileSync(path.join(root, 'package-lock.json'), 'utf8'));
  assert.equal(packageJson.name, 'main-clinic');
  assert.equal(lockfile.packages[''].name, 'main-clinic');
});

test('fresh login token is available to external redirects', () => {
  const auth = fs.readFileSync(path.join(src, 'context/AuthContext.jsx'), 'utf8');
  assert.match(auth, /return \{ \.\.\.userData, access_token: tokenData \}/);
});

test('clinician landing and admin dashboard actions are wired', () => {
  const landing = fs.readFileSync(path.join(src, 'pages/public/clinic-join/index.jsx'), 'utf8');
  const dashboard = fs.readFileSync(path.join(src, 'pages/admin/dashboard/index.jsx'), 'utf8');
  const dashboardContent = fs.readFileSync(path.join(src, 'pages/admin/dashboard/dashboard-content.jsx'), 'utf8');
  const doctorRegister = fs.readFileSync(path.join(src, 'pages/admin/dashboard/doctor-register.jsx'), 'utf8');

  assert.match(landing, /window\.location\.assign\("\/clinic-join\?mode=login"\)/);
  assert.match(dashboard, /<DashboardContent setActive=\{setActive\} \/>/);
  assert.match(dashboardContent, /function DashboardContent\(\{ setActive \}\)/);
  assert.match(doctorRegister, /const \{ data \} = await authDoctorRegister\(form\)/);
});
