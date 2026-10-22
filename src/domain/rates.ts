// 52 weeks x 35 hours
export const HOURS_PER_YEAR = 1820

export function hourlyRate(annualSalary: number): number {
  return annualSalary / HOURS_PER_YEAR
}
