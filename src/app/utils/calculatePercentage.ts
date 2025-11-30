export const calculatePercentage = (past: number, current: number) => {
  if (past === 0) return past * 100;
  const percent = (current / past) * 100;
  //const percent = ((thisMonth - lastMonth) / lastMonth) * 100;
  return Number(percent.toFixed(0));
};
