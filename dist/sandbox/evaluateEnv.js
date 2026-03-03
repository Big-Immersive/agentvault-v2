import { checkAccess } from '../profiles/profiles.js';
import { SYSTEM_VARS } from '../config/defaults.js';
/** Evaluate access decisions for all env vars against a profile (pure function) */
export function evaluateEnv(allVars, profile) {
    const decisions = [];
    for (const key of Object.keys(allVars)) {
        if (SYSTEM_VARS.includes(key)) {
            decisions.push({ varName: key, access: 'system' });
        }
        else {
            decisions.push({ varName: key, access: checkAccess(profile, key) });
        }
    }
    return decisions;
}
//# sourceMappingURL=evaluateEnv.js.map