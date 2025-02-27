import { formatDatetime } from './format-datetime.mjs';
import { getDaysAgo } from './get-days-ago.mjs';

export const getLastActiveAt = (endpoints) => {
  if (endpoints.some((endpoint) => endpoint.current_state === 'active')) {
    return {
      date: formatDatetime(new Date()),
      days_ago: 0,
    };
  }

  const lastActive = endpoints.reduce((latest, endpoint) => {
    if (endpoint.last_active) {
      const date = new Date(endpoint.last_active);
      return date > latest ? date : latest;
    }
    return latest;
  }, new Date('2000-01-01T00:00:00Z'));

  return {
    date: formatDatetime(lastActive),
    days_ago: getDaysAgo(lastActive),
  };
};
