import site from "../data/site.json";

export const enrollment = site.enrollment;

export type EnrollmentStatus = "open" | "waitlist" | "closed";

export interface EnrollmentCopy {
  open: string;
  waitlist: string;
  closed: string;
}

export function enrollmentCopy(copy: EnrollmentCopy): string {
  const text = copy[enrollment.status as EnrollmentStatus];
  return text
    .replaceAll("{currentYear}", enrollment.currentYear)
    .replaceAll("{nextYear}", enrollment.nextYear);
}
