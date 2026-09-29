/** Same rules the API enforces at registration, reset and change-password. */
export function passwordProblem(pw: string): string | null {
  if (pw.length < 8) return 'Use at least 8 characters.';
  if (pw.length > 72) return 'Use at most 72 characters.';
  if (!/[A-Z]/.test(pw)) return 'Add an uppercase letter.';
  if (!/[a-z]/.test(pw)) return 'Add a lowercase letter.';
  if (!/[0-9]/.test(pw)) return 'Add a number.';
  return null;
}
export const EMAIL_RE = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]{2,}$/;
