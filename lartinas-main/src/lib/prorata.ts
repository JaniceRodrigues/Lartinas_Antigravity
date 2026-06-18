// Cálculo proporcional de aluguel (entrada/saída fora do ciclo).
// Baseia-se em dias do mês de referência.
export function calcProrata(monthlyValue: number, startDate: string, endDate: string): { days: number; daysInMonth: number; amount: number } {
  const start = new Date(startDate + "T00:00:00");
  const end = new Date(endDate + "T00:00:00");
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return { days: 0, daysInMonth: 30, amount: 0 };
  const daysInMonth = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
  const days = Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  const amount = +(monthlyValue * (days / daysInMonth)).toFixed(2);
  return { days, daysInMonth, amount };
}
