# Delete Stale Branches

This repository contains a GitHub Action and a JavaScript script to automatically delete stale branches in Neon projects.

## Overview

- **GitHub Action (`delete-stale-branches.yml`)**: Runs nightly at midnight ET and can also be triggered manually.
- **JavaScript Script (`delete-stale-branches.mjs`)**: Uses the [Neon API](https://api-docs.neon.tech/reference/getting-started-with-neon-api) to list branches for specified project IDs and deletes stale ones based on a defined threshold.

## Configuration

### `delete-stale-branches.yml`

- This GitHub Action executes automatically every night at **midnight ET**.
- It can also be manually triggered via the GitHub Actions UI.

### `delete-stale-branches.mjs`

- The script retrieves branches from a list of project IDs using the **Neon API**.
- Stale branches exceeding the defined threshold are deleted.
- Modify the `threshold` variable at the top of the script to adjust the retention period.

## Getting Started

### Requirements

You'll need a [Neon API key](https://api-docs.neon.tech/reference/createapikey) and the **project IDs** you want to monitor.

1. **Local Testing:**

   - Create a `.env` file and add your Neon API key:
     ```sh
     NEON_API_KEY=your-api-key-here
     ```
   - Add your project IDs to `neonIncludedProjectIds=[]` in `.github/action-scripts/delete-stale-branches.mjs`.

2. **GitHub Repository Secrets:**
   - Add the **Neon API key** as a secret in your GitHub repository under `NEON_API_KEY`.

## Local Testing

To test the script locally, run:

```sh
node .github/action-scripts/delete-stale-branches.mjs
```

Which would produce an output similar to the below.

### Output

```
📌 Project ID: autumn-bush-97691534 | 📄 Project Name: branch-management-test

⭐ Branch ID: br-small-voice-a4bzb0mo
📄 Branch name: main
⏱️ Created at: Feb 14, 2025 @4:45:51 PM
⏰ Last active: 5 days ago
👤 Created by: Paul

🌿 Branch ID: br-tight-dust-a4a6ga33
↳ ⚠️ BRANCH DELETED: jira-abc-update-data
⏱️ Created at: Feb 14, 2025 @4:46:23 PM
⏰ Last active: 5 days ago
👤 Created by: Paul

🌿 Branch ID: br-morning-block-a40lmkw5
📄 Branch name: jira-abc-update-data--child-branch
⏱️ Created at: Feb 17, 2025 @1:01:37 PM
⏰ Last active: 2 days ago
👤 Created by: Paul
```

## Running via GitHub Actions

This action supports **manual execution** via `workflow_dispatch`:

1. Navigate to the **Actions** tab in your GitHub repository.
2. Select the **List Stale Branches** workflow.
3. Click **Run workflow**.

The action logs will show output similar to the example above.
