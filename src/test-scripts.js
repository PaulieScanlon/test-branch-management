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

const getDaysAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  date.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffTime = now - date;
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

const getLastActiveAt = (endpoints) => {
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

(async () => {
  console.log('Test scripts: ');

  await Promise.all(
    neonIncludedProjectIds.map(async (projectId) => {
      const {
        data: {
          project: { name, id },
        },
      } = await apiClient.getProject(projectId);

      const {
        data: { endpoints },
      } = await apiClient.listProjectEndpoints(projectId);
      //   console.log(endpoints);

      const {
        data: { branches },
      } = await apiClient.listProjectBranches({ projectId: projectId });
      //   console.log(branches);

      console.log(`📌 Project ID: ${id} | 📄 Project Name: ${name}`);
      console.log(' ');
      const branchesWithLastActive = branches
        .map((branch) => {
          const includedEndpoints = endpoints.filter((endpoint) => endpoint.branch_id === branch.id);
          const {
            primary,
            name, //branch_name, Missing
            id, // branch_id,
            created_at,
            updated_at,
            created_by,
          } = branch;

          return {
            primary: primary,
            branch_id: id,
            branch_name: name,
            created_at: formatDatetime(created_at),
            updated_at: formatDatetime(updated_at),
            last_active: getLastActiveAt(includedEndpoints),
            created_by: created_by.name,
          };
        })
        .sort((a, b) => a.created_at.localeCompare(b.created_at));

      branchesWithLastActive.forEach((branch) => {
        const {
          primary,
          branch_id,
          branch_name,
          created_at,
          last_active: { days_ago },
          created_by,
        } = branch;

        const branchIcon = primary === true ? '⭐' : '🌿';

        console.log(`${branchIcon} Branch ID: `, branch_id);
        console.log('📄 Branch name: ', branch_name);
        console.log('⏱️ Created at: ', formatDatetime(created_at));
        console.log('⏰ Last Active: ', `${days_ago} days ago`);
        console.log('👤 Created by: ', created_by);
        console.log(' ');
      });

      console.log('---');
      console.log(' ');
    })
  );
})();
