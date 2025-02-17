import { createApiClient } from '@neondatabase/api-client';
import 'dotenv/config';

const apiClient = createApiClient({
  apiKey: process.env.NEON_API_KEY,
});

const neonProjectIds = ['polished-water-58114712', 'autumn-bush-97691534', 'little-salad-54029192'];

(async () => {
  console.log('List Projects - temp');
  const response = await apiClient.listProjects({});
  console.log(response);
})();
