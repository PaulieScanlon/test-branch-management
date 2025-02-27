import { createApiClient } from '@neondatabase/api-client';
import 'dotenv/config';

import { formatDatetime } from '../../src/utils/format-datetime.mjs';
import { getLastActiveAt } from '../../src/utils/get-last-active-at.mjs';
import { hasChildBranch } from '../../src/utils/has-child-branch.mjs';

const apiClient = createApiClient({
  apiKey: process.env.NEON_API_KEY,
});

const neonIncludedProjectIds = ['polished-water-58114712', 'autumn-bush-97691534'];
const threshold = 0;

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
          console.log('---');
          console.log(' ');
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

                console.log(' ');
                if (!primary) {
                  console.log('👥 Parent ID:', parent_id);
                }
                console.log(`${branchIcon} Branch ID: `, branch_id);
                console.log('🗒️ Branch name: ', branch_name);

                if (!primary) {
                  if (has_child_branch.has_child) {
                    console.log('   ↳ 🌿 Branch ID:', has_child_branch.child_branch_id);
                    console.log('   ↳ 🗒️ Branch name:', has_child_branch.child_branch_name);
                  }
                }
                console.log('⏱️ Created at: ', formatDatetime(created_at));
                console.log('⏰ Last active: ', `${days_ago} days ago`);
                console.log('👤 Created by: ', created_by);

                if (days_ago >= threshold && !primary) {
                  console.log('⚠️ THIS BRANCH IS STALE');
                }
              } catch (error) {
                console.error(`Error processing branch: `, error);
              }
            })
          );
        } catch (error) {
          console.error(`Error processing project: `, error);
        }
      })
    );
  } catch (error) {
    console.error('Error in script:', error);
  }
})();
