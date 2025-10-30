export async function triggerGitHubBuild(userId: string) {
  try {
    console.log('🚀 Starting GitHub trigger process...');
    console.log('🔧 User ID:', userId);
    console.log('🔧 GitHub Token exists:', !!process.env.GITHUB_TOKEN);
    
    // Загружаем настройки GitHub из content.json
    // На серверной стороне используем внутренний вызов R2
    const { getJsonFile } = await import('@/lib/r2');
    const contentData = await getJsonFile(userId, 'content.json');
    console.log('📡 Content.json loaded successfully');
    
    if (!contentData) {
      console.error('❌ Failed to load content.json');
      return false;
    }
    const githubConfig = contentData.github;
    
    if (!githubConfig) {
      console.error('❌ GitHub config not found in content.json');
      return false;
    }
    
    const { owner, repo, branch = 'main' } = githubConfig;
    console.log(`🔧 Triggering GitHub Actions for ${owner}/${repo} (${branch})`);
    
    // Триггерим GitHub Actions
    console.log(`🔧 Making request to: https://api.github.com/repos/${owner}/${repo}/dispatches`);
    console.log(`🔧 Token length: ${process.env.GITHUB_TOKEN?.length || 0}`);
    
    const githubResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'content-updated',
        client_payload: {
          userId,
          timestamp: new Date().toISOString(),
          reason: 'content.json updated',
          branch: branch
        }
      })
    });
    
    console.log(`🔧 GitHub API response status: ${githubResponse.status}`);
    console.log(`🔧 GitHub API response headers:`, Object.fromEntries(githubResponse.headers.entries()));
    
    if (githubResponse.ok) {
      console.log(`✅ GitHub Actions triggered for ${owner}/${repo}`);
      return true;
    } else {
      const errorText = await githubResponse.text();
      console.error('❌ Failed to trigger GitHub Actions:', errorText);
      console.error('❌ Response status:', githubResponse.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error triggering GitHub Actions:', error);
    return false;
  }
}
