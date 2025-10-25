'use client';

import { useEffect, useState } from 'react';

interface DeployStatus {
  status: 'success' | 'building' | 'queued' | 'error' | 'unknown';
  runId: number;
  createdAt: string;
  updatedAt: string;
  conclusion: string | null;
  message: string;
}

export default function DeployStatus() {
  const [deployStatus, setDeployStatus] = useState<DeployStatus | null>(null);
  const [siteUrl, setSiteUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchSiteUrl = async () => {
    try {
      const response = await fetch('/api/files/get?file=content.json');
      if (response.ok) {
        const contentData = await response.json();
        if (contentData?.site?.url) {
          setSiteUrl(contentData.site.url);
        }
      }
    } catch (error) {
      console.error('Error fetching site URL:', error);
    }
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/deploy/status');
      const data = await response.json();
      setDeployStatus(data);
    } catch (error) {
      console.error('Error fetching deploy status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchSiteUrl();
    
    // Обновляем статус каждые 5 секунд если деплой в процессе
    const interval = setInterval(() => {
      if (deployStatus?.status === 'building' || deployStatus?.status === 'queued') {
        fetchStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [deployStatus?.status]);

  if (loading) {
    return (
      <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Загрузка статуса деплоя...</span>
        </div>
      </div>
    );
  }

  if (!deployStatus) {
    return (
      <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-red-600">❌ Не удалось загрузить статус деплоя</span>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'building':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'queued':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'building':
        return '🔨';
      case 'queued':
        return '⏳';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  return (
    <div className={`border rounded-lg p-4 mb-6 ${getStatusColor(deployStatus.status)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{getStatusIcon(deployStatus.status)}</span>
          <div>
            <div className="font-medium">{deployStatus.message}</div>
            <div className="text-sm opacity-75">
              Обновлено: {new Date(deployStatus.updatedAt).toLocaleString('ru-RU')}
            </div>
          </div>
        </div>
        
         <div className="flex space-x-2">
           {deployStatus.status === 'success' && siteUrl && (
             <a
               href={siteUrl}
               target="_blank"
               rel="noopener noreferrer"
               className="text-sm underline hover:no-underline"
             >
               Открыть сайт
             </a>
           )}
           
           <button
             onClick={fetchStatus}
             className="text-sm underline hover:no-underline"
           >
             Обновить
           </button>
         </div>
      </div>
    </div>
  );
}
