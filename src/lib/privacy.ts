export const MINIMUM_SAMPLE_SIZE = 5;

export interface DailyAggregate {
  date: string;
  averageScore: number | null;
  participationCount: number;
  isBlurred: boolean;
}

export interface AggregateResult {
  averageScore: number | null;
  participationRate: number | null;
  totalEmployees: number;
  participatingEmployees: number;
  isBlurred: boolean;
  dailyData: DailyAggregate[];
}

export function computeAggregates(
  dailyRows: Array<{ date: string; avg_score: number; count: number }>,
  totalEmployees: number,
  periodDays = 30
): AggregateResult {
  const blurredDays = dailyRows.map((row) => ({
    date: row.date,
    averageScore:
      row.count >= MINIMUM_SAMPLE_SIZE ? Number(row.avg_score.toFixed(2)) : null,
    participationCount: row.count,
    isBlurred: row.count < MINIMUM_SAMPLE_SIZE,
  }));

  const visibleDays = blurredDays.filter((d) => !d.isBlurred);
  const totalParticipating = dailyRows.reduce((acc, r) => {
    // unique users across all days — approximation; exact count in API
    return acc + r.count;
  }, 0);

  const avgScore =
    visibleDays.length > 0
      ? visibleDays.reduce((sum, d) => sum + (d.averageScore ?? 0), 0) /
        visibleDays.length
      : null;

  const overallBlurred = totalParticipating < MINIMUM_SAMPLE_SIZE;

  return {
    averageScore: overallBlurred ? null : Number((avgScore ?? 0).toFixed(2)),
    participationRate:
      overallBlurred || totalEmployees === 0
        ? null
        : Math.round((totalParticipating / (totalEmployees * periodDays)) * 100 * periodDays) / periodDays,
    totalEmployees,
    participatingEmployees: totalParticipating,
    isBlurred: overallBlurred,
    dailyData: blurredDays,
  };
}
