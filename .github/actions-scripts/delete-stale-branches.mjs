import { createApiClient } from '@neondatabase/api-client';
import 'dotenv/config';

const apiClient = createApiClient({
  apiKey: process.env.NEON_API_KEY,
});

const neonIncludedProjectIds = ['polished-water-58114712', 'autumn-bush-97691534', 'little-salad-54029192'];
const threshold = 0;

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

const hasChildBranch = (branch_id, branches) => {
  const childBranch = branches.find((branch) => branch.parent_id === branch_id);
  return {
    has_child: !!childBranch,
    child_branch_id: childBranch ? childBranch.id : null,
  };
};

(async () => {
  try {
    await Promise.all(
      neonIncludedProjectIds.map(async (projectId) => {
        try {
          const {
            data: {
              project: { name },
            },
          } = await apiClient.getProject(projectId);

          const {
            data: { endpoints },
          } = await apiClient.listProjectEndpoints(projectId);

          const {
            data: { branches },
          } = await apiClient.listProjectBranches({ projectId });
          console.log(`🚀 Project ID: ${projectId} | 📛 Project Name: ${name}`);
          console.log(' ');

          const branchesWithLastActive = branches
            .map((branch) => {
              const includedEndpoints = endpoints.filter((endpoint) => endpoint.branch_id === branch.id);

              const { primary, parent_id, name, id, created_at, updated_at, created_by } = branch;

              return {
                primary,
                parent_id,
                branch_id: id,
                branch_name: name,
                created_at,
                updated_at,
                last_active: getLastActiveAt(includedEndpoints),

                has_child_branch: hasChildBranch(id, branches),
                created_by: created_by?.name || 'Unknown',
              };
            })
            .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

          await Promise.all(
            branchesWithLastActive.map(async (branch) => {
              try {
                const {
                  primary,
                  parent_id,
                  branch_id,
                  branch_name,
                  created_at,
                  last_active: { days_ago },
                  has_child_branch,
                  created_by,
                } = branch;

                const branchIcon = primary ? '⭐' : '🌿';

                console.log(`${branchIcon} Branch ID: `, branch_id);
                console.log('🗒️ Branch name: ', branch_name);

                if (!primary) {
                  console.log('👥 Parent ID:', parent_id);
                  if (has_child_branch.has_child) {
                    console.log('   ↳ 👶 Child branch ID:', has_child_branch.child_branch_id);
                  }
                }

                if (days_ago >= threshold && !primary) {
                  console.log('   ↳ 🚨 BRANCH DELETED: ', branch_name);
                  if (has_child_branch.has_child) {
                    await apiClient.deleteProjectBranch(projectId, has_child_branch.child_branch_id);
                  }
                  await apiClient.deleteProjectBranch(projectId, branch_id);
                }

                console.log('⏱️ Created at: ', formatDatetime(created_at));
                console.log('⏰ Last active: ', `${days_ago} days ago`);
                console.log('👤 Created by: ', created_by);
                console.log(' ');
              } catch (error) {
                console.error(`Error processing branch: `, error);
              }
            })
          );
          console.log('---');
          console.log(' ');
        } catch (error) {
          console.error(`Error processing project: `, error);
        }
      })
    );
  } catch (error) {
    console.error('Error in script:', error);
  }
})();
