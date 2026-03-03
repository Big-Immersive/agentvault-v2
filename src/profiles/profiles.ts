import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { resolvePaths } from '../config/paths.js';
import { matchRule } from './matchRule.js';
import type { Profile } from '../types/index.js';

/** Load a profile by name from the profiles directory */
export function loadProfile(projectDir: string, name: string): Profile {
  const fp = path.join(resolvePaths(projectDir).profiles, `${name}.yml`);
  if (!fs.existsSync(fp)) throw new Error(`Profile not found: ${name}`);
  const raw = fs.readFileSync(fp, 'utf-8');
  return yaml.load(raw) as Profile;
}

/** Save a profile to the profiles directory */
export function saveProfile(projectDir: string, profile: Profile): void {
  const dir = resolvePaths(projectDir).profiles;
  fs.mkdirSync(dir, { recursive: true });
  const fp = path.join(dir, `${profile.name}.yml`);
  fs.writeFileSync(fp, yaml.dump(profile, { lineWidth: -1 }));
}

/** List all profile names */
export function listProfiles(projectDir: string): string[] {
  const dir = resolvePaths(projectDir).profiles;
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.yml'))
    .map(f => f.replace('.yml', ''));
}

/** Delete a profile by name */
export function deleteProfile(projectDir: string, name: string): boolean {
  const fp = path.join(resolvePaths(projectDir).profiles, `${name}.yml`);
  if (!fs.existsSync(fp)) return false;
  fs.unlinkSync(fp);
  return true;
}

/** Evaluate access for a variable against a profile. Last matching rule wins. */
export function checkAccess(profile: Profile, varName: string): 'allow' | 'deny' | 'redact' {
  let result: 'allow' | 'deny' | 'redact' = 'deny';
  for (const rule of profile.rules) {
    if (matchRule(varName, rule.pattern)) {
      result = rule.access;
    }
  }
  return result;
}
