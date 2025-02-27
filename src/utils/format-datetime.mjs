export const formatDatetime = (dateString) => {
  const date = new Date(dateString);

  const dateStamp = date.toLocaleString('en-US', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeStamp = date.toLocaleTimeString();

  return `${dateStamp} @${timeStamp}`;
};
