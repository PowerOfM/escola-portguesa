import site from "../data/site.json";

export const enrollment = site.enrollment;

export interface EnrollmentCopy {
  open: string;
  closed: string;
}

export function enrollmentCopy(copy: EnrollmentCopy): string {
  const text = enrollment.open ? copy.open : copy.closed;
  return text
    .replaceAll("{currentYear}", enrollment.currentYear)
    .replaceAll("{nextYear}", enrollment.nextYear);
}
