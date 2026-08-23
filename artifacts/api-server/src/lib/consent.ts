/**
 * Consent policy — the required consents and the current document version, plus
 * the pure rule for which consents a submission still needs to record. Kept
 * free of DB/HTTP concerns so it can be unit-tested directly.
 */

// The two consents a patient must accept before their first visit. Bump the
// version whenever the underlying policy text changes so the signed record
// always points at exactly what the patient saw — and so a patient who signed
// an older version is captured again for the new one.
export const CONSENT_TYPES = {
  hipaa: "HIPAA_NOTICE",
  telehealth: "TELEHEALTH_CONSENT",
} as const;

export const CONSENT_DOCUMENT_VERSION = "2025-01";

export const REQUIRED_CONSENT_TYPES: string[] = Object.values(CONSENT_TYPES);

/**
 * Given the consent types a patient has already signed *for the current
 * document version*, return the required consents still missing — i.e. the ones
 * to insert. A patient who signed every current-version consent gets an empty
 * list; if the version has moved on, previously-signed types reappear here.
 */
export function consentTypesToInsert(alreadySignedCurrentVersion: Iterable<string>): string[] {
  const already = new Set(alreadySignedCurrentVersion);
  return REQUIRED_CONSENT_TYPES.filter((type) => !already.has(type));
}
