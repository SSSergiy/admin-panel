import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Получаем последний статус деплоя из GitHub Actions
    const response = await fetch('https://api.github.com/repos/SSSergiy/website-code/actions/runs?per_page=1', {
      headers: {
        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Failed to fetch deploy status' 
      });
    }

    const data = await response.json();
    const latestRun = data.workflow_runs[0];

    if (!latestRun) {
      return NextResponse.json({ 
        status: 'unknown', 
        message: 'No recent deployments found' 
      });
    }

    // Определяем статус
    let status = 'unknown';
    if (latestRun.status === 'completed') {
      status = latestRun.conclusion === 'success' ? 'success' : 'error';
    } else if (latestRun.status === 'in_progress') {
      status = 'building';
    } else if (latestRun.status === 'queued') {
      status = 'queued';
    }

    return NextResponse.json({
      status,
      runId: latestRun.id,
      createdAt: latestRun.created_at,
      updatedAt: latestRun.updated_at,
      conclusion: latestRun.conclusion,
      message: getStatusMessage(status, latestRun.conclusion)
    });

  } catch (error) {
    console.error('Error fetching deploy status:', error);
    return NextResponse.json({ 
      status: 'error', 
      message: 'Failed to fetch deploy status' 
    });
  }
}

function getStatusMessage(status: string, conclusion: string | null): string {
  switch (status) {
    case 'success':
      return '✅ Сайт успешно обновлен!';
    case 'building':
      return '🔨 Сайт строится...';
    case 'queued':
      return '⏳ Ожидание в очереди...';
    case 'error':
      return `❌ Ошибка деплоя: ${conclusion}`;
    default:
      return '❓ Неизвестный статус';
  }
}
