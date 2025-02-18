import { createApiClient } from '@neondatabase/api-client';
import 'dotenv/config';

const apiClient = createApiClient({
  apiKey: process.env.NEON_API_KEY,
});

const neonIncludedProjectIds = ['polished-water-58114712', 'autumn-bush-97691534', 'little-salad-54029192'];

const formatDatetime = (dateString) => {
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

(async () => {
  console.log('List Branches');
  const {
    data: { projects },
  } = await apiClient.listProjects();

  projects.forEach(async (project) => {
    const { id, name } = project;

    const {
      data: { endpoints },
    } = await apiClient.listProjectEndpoints(id);

    endpoints.forEach((branch) => {
      if (neonIncludedProjectIds.includes(branch.project_id)) {
        const {
          // primary, // Missing
          //branch_name, Missing
          branch_id,
          created_at,
          last_active,
          // created_by, Missing
        } = branch;

        let primary = false; // Temporary

        const branchIcon = primary === 'true' ? '⭐' : '🌿';

        console.log(`📌 Project ID: ${id} | 📄 Project Name: ${name}`);
        console.log(`${branchIcon} Branch ID: `, branch_id);
        console.log('📄 Branch name: ', '?');
        console.log('⏱️ Created at: ', formatDatetime(created_at));
        console.log('⏰ Last Active: ', formatDatetime(last_active));
        console.log('👤 Created by: ', '?');
        console.log(' ');
        console.log('---');
      }
    });
  });
})();
