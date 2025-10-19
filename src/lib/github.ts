import { Octokit } from '@octokit/rest';

// Инициализация GitHub клиента
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REPO_OWNER = process.env.GITHUB_REPO_OWNER!; // SSSergiy

// Маппинг userId → repoName
// Добавляй сюда каждого нового клиента вручную
const CLIENT_REPOS: Record<string, string> = {
  'user_34EvUVHa2Fv9rbrXKRzHCbR7791': 'website-code', // Первый клиент
  'user_34HuRacqhtVx3xG1KmC8UyFT8OV': 'client-website-template', // Второй клиент (client-001)
  // 'user_XYZ789': 'client-photo-studio', // Третий клиент
};

// Функция для запуска GitHub Actions workflow
export async function triggerBuild(userId: string) {
  try {
    // Получаем название репо для клиента
    const repoName = CLIENT_REPOS[userId];
    
    if (!repoName) {
      console.error(`No repository configured for userId: ${userId}`);
      throw new Error('Client repository not configured. Contact support.');
    }

    console.log(`Triggering build for client: ${userId} → repo: ${repoName}`);
    
    const response = await octokit.rest.actions.createWorkflowDispatch({
      owner: REPO_OWNER,
      repo: repoName,
      workflow_id: 'build-and-deploy.yml',
      ref: 'dev',
    });

    return { success: true, response };
  } catch (error) {
    console.error('Error triggering build:', error);
    throw new Error('Failed to trigger build');
  }
}

// Функция для получения статуса последнего workflow
export async function getWorkflowStatus(userId: string) {
  try {
    const repoName = CLIENT_REPOS[userId];
    
    if (!repoName) {
      throw new Error('Client repository not configured');
    }

    const response = await octokit.rest.actions.listWorkflowRuns({
      owner: REPO_OWNER,
      repo: repoName,
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
