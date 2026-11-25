/** Vacation request lifecycle. Pending (1) is the admin approval queue. */
export enum VacationStatus {
  PENDING = 1,
  APPROVED = 2,
  REJECTED = 3,
}

export const VACATION_DECISION_STATUSES: readonly VacationStatus[] = [
  VacationStatus.APPROVED,
  VacationStatus.REJECTED,
];
