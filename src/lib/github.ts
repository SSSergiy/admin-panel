import { Octokit } from '@octokit/rest';

// Инициализация GitHub клиента
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = process.env.GITHUB_REPO_OWNER!;
const REPO_NAME = process.env.GITHUB_REPO_NAME!;

// Функция для запуска GitHub Actions workflow
export async function triggerBuild(clientId?: string) {
  try {
    console.log(`Triggering build${clientId ? ` for client: ${clientId}` : ' for all clients'}`);
    
    const response = await octokit.rest.actions.createWorkflowDispatch({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      workflow_id: 'build-and-deploy.yml',
      ref: 'dev',
      inputs: clientId ? { clientId } : {}
    });

    return { success: true, response };
  } catch (error) {
    console.error('Error triggering build:', error);
    throw new Error('Failed to trigger build');
  }
}

// Функция для получения статуса последнего workflow
export async function getWorkflowStatus() {
  try {
    const response = await octokit.rest.actions.listWorkflowRuns({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      workflow_id: 'build-and-deploy.yml',
      per_page: 1,
    });

    const run = response.data.workflow_runs[0];
    return {
      status: run?.status,
      conclusion: run?.conclusion,
      created_at: run?.created_at,
      updated_at: run?.updated_at,
    };
  } catch (error) {
    console.error('Error getting workflow status:', error);
    throw new Error('Failed to get workflow status');
  }
}
