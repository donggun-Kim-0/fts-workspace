/** 사업자등록번호 10자리 (하이픈 제거 후 검증) */
export function normalizeBusinessRegNo(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function isValidBusinessRegNo(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const digits = normalizeBusinessRegNo(raw);
  if (digits.length !== 10) return false;
  if (!/^\d{10}$/.test(digits)) return false;

  const check = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += Number.parseInt(digits[i], 10) * check[i];
  }
  sum += Math.floor((Number.parseInt(digits[8], 10) * 5) / 10);
  const remainder = (10 - (sum % 10)) % 10;
  return remainder === Number.parseInt(digits[9], 10);
}
