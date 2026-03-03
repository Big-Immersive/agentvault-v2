import fs from 'node:fs';
import path from 'node:path';
import { resolvePaths } from '../config/paths.js';
import { getPassphrase, readEncryptedFile } from '../vault/encryption.js';
/** Load license descriptor for a purchased bank */
export function loadLicense(projectDir, bankName) {
    const bankDir = path.join(resolvePaths(projectDir).purchasedBanks, bankName);
    const fp = path.join(bankDir, 'license.json');
    if (!fs.existsSync(fp))
        throw new Error(`License not found for bank: ${bankName}`);
    return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}
/** Save license descriptor (e.g. after decrementing access count) */
function saveLicense(projectDir, bankName, license) {
    const bankDir = path.join(resolvePaths(projectDir).purchasedBanks, bankName);
    fs.mkdirSync(bankDir, { recursive: true });
    fs.writeFileSync(path.join(bankDir, 'license.json'), JSON.stringify(license, null, 2));
}
/** Load bank descriptor */
export function loadBankDescriptor(projectDir, bankName) {
    const bankDir = path.join(resolvePaths(projectDir).purchasedBanks, bankName);
    const fp = path.join(bankDir, 'descriptor.json');
    if (!fs.existsSync(fp))
        throw new Error(`Bank descriptor not found: ${bankName}`);
    return JSON.parse(fs.readFileSync(fp, 'utf-8'));
}
/** Load encrypted bank entries */
export function loadBankEntries(projectDir, bankName) {
    const bankDir = path.join(resolvePaths(projectDir).purchasedBanks, bankName);
    const fp = path.join(bankDir, 'bank.encrypted');
    if (!fs.existsSync(fp))
        throw new Error(`Bank data not found: ${bankName}`);
    const passphrase = getPassphrase(projectDir);
    return readEncryptedFile(fp, passphrase, []);
}
/** Check if a license is currently valid */
export function checkLicense(license) {
    const now = Date.now();
    switch (license.accessType) {
        case 'unlimited':
            return { valid: true };
        case 'time_locked': {
            if (!license.expiresAt)
                return { valid: true };
            if (now > new Date(license.expiresAt).getTime()) {
                return { valid: false, reason: 'License expired' };
            }
            return { valid: true };
        }
        case 'access_limited': {
            if (license.remainingAccesses !== undefined && license.remainingAccesses <= 0) {
                return { valid: false, reason: 'Access limit reached' };
            }
            return { valid: true };
        }
        case 'time_and_access': {
            if (license.expiresAt && now > new Date(license.expiresAt).getTime()) {
                return { valid: false, reason: 'License expired' };
            }
            if (license.remainingAccesses !== undefined && license.remainingAccesses <= 0) {
                return { valid: false, reason: 'Access limit reached' };
            }
            return { valid: true };
        }
        case 'subscription': {
            if (license.expiresAt && now > new Date(license.expiresAt).getTime()) {
                return { valid: false, reason: 'Subscription expired' };
            }
            return { valid: true };
        }
        default:
            return { valid: false, reason: `Unknown access type: ${license.accessType}` };
    }
}
/** Consume one access from the license (for access-limited types) */
export function consumeAccess(projectDir, bankName) {
    const license = loadLicense(projectDir, bankName);
    if (license.remainingAccesses !== undefined) {
        license.remainingAccesses--;
        saveLicense(projectDir, bankName, license);
    }
}
/** List all purchased bank names */
export function listPurchasedBanks(projectDir) {
    const dir = resolvePaths(projectDir).purchasedBanks;
    if (!fs.existsSync(dir))
        return [];
    return fs.readdirSync(dir).filter(f => {
        const bankDir = path.join(dir, f);
        return fs.statSync(bankDir).isDirectory() && fs.existsSync(path.join(bankDir, 'license.json'));
    });
}
//# sourceMappingURL=license.js.map