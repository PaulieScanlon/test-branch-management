export const getDaysAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = now - date;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};
