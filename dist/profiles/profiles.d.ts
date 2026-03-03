import type { Profile } from '../types/index.js';
/** Load a profile by name from the profiles directory */
export declare function loadProfile(projectDir: string, name: string): Profile;
/** Save a profile to the profiles directory */
export declare function saveProfile(projectDir: string, profile: Profile): void;
/** List all profile names */
export declare function listProfiles(projectDir: string): string[];
/** Delete a profile by name */
export declare function deleteProfile(projectDir: string, name: string): boolean;
/** Evaluate access for a variable against a profile. Last matching rule wins. */
export declare function checkAccess(profile: Profile, varName: string): 'allow' | 'deny' | 'redact';
//# sourceMappingURL=profiles.d.ts.map