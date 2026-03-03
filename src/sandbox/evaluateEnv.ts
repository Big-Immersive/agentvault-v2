import { checkAccess } from '../profiles/profiles.js';
import { SYSTEM_VARS } from '../config/defaults.js';
import type { Profile, AccessDecision } from '../types/index.js';

/** Evaluate access decisions for all env vars against a profile (pure function) */
export function evaluateEnv(
  allVars: Record<string, string>,
  profile: Profile
): AccessDecision[] {
  const decisions: AccessDecision[] = [];
  for (const key of Object.keys(allVars)) {
    if (SYSTEM_VARS.includes(key)) {
      decisions.push({ varName: key, access: 'system' });
    } else {
      decisions.push({ varName: key, access: checkAccess(profile, key) });
    }
  }
  return decisions;
}
