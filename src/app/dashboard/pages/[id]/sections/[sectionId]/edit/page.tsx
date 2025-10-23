'use client';

import { JsonFormRenderer } from '@/components/JsonFormRenderer';
import { useUser } from '@clerk/nextjs';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Section {
  id: string;
  type: string;
  enabled: boolean;
  [key: string]: any;
}

interface Page {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
}

interface AdminConfig {
  sections: Record<string, {
    schema: any;
    uischema: any;
  }>;
}

export default function EditSectionPage() {
  const { user } = useUser();
  const params = useParams();
  const router = useRouter();
  const pageId = params.id as string;
  const sectionId = params.sectionId as string;

  const [page, setPage] = useState<Page | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [adminConfig, setAdminConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, [pageId, sectionId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Загружаем страницу
      const pageResponse = await fetch('/api/files/get?file=pages.json');
      if (pageResponse.ok) {
        const pageData = await pageResponse.json();
        const pages = pageData.data || [];
        const currentPage = pages.find((p: Page) => p.id === pageId);
        if (currentPage) {
          setPage(currentPage);
          const currentSection = currentPage.sections.find((s: Section) => s.id === sectionId);
          if (currentSection) {
            setSection(currentSection);
          }
        }
      }

      // Загружаем конфигурацию админки
      const configResponse = await fetch('/api/files/get?file=admin.config.json');
      if (configResponse.ok) {
        const configData = await configResponse.json();
        setAdminConfig(configData.data);
      }

    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!page || !section || !adminConfig) return;

    try {
      setSaving(true);

      // Обновляем секцию в странице
      const updatedPage = {
        ...page,
        sections: page.sections.map(s => 
          s.id === sectionId ? section : s
        )
      };

      // Сохраняем обновленную страницу
      const response = await fetch('/api/files/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: 'pages.json',
          data: [updatedPage, ...(await getOtherPages())]
        })
      });

      if (response.ok) {
        router.push(`/dashboard/pages/${pageId}/sections`);
      } else {
        console.error('Ошибка сохранения');
      }

    } catch (error) {
      console.error('Ошибка сохранения:', error);
    } finally {
      setSaving(false);
    }
  };

  const getOtherPages = async () => {
    try {
      const response = await fetch('/api/files/get?file=pages.json');
      if (response.ok) {
        const data = await response.json();
        return (data.data || []).filter((p: Page) => p.id !== pageId);
      }
    } catch (error) {
      console.error('Ошибка загрузки других страниц:', error);
    }
    return [];
  };

  const handleSectionChange = (newData: any) => {
    setSection({ ...section, ...newData });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (!page || !section || !adminConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Секция не найдена</div>
      </div>
    );
  }

  const sectionConfig = adminConfig.sections[section.type];
  if (!sectionConfig) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Конфигурация для типа "{section.type}" не найдена</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/pages/${pageId}/sections`}
                className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Назад к секциям</span>
              </Link>
              <div className="h-6 w-px bg-white/20"></div>
              <h1 className="text-xl font-semibold text-white">
                Редактирование секции: {section.type}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => window.open(`/${page.slug}`, '_blank')}
                className="button-secondary flex items-center space-x-2"
              >
                <Eye className="w-4 h-4" />
                <span>Просмотр</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="gradient-button flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Сохранение...' : 'Сохранить'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <JsonFormRenderer
          schema={sectionConfig.schema}
          uischema={sectionConfig.uischema}
          data={section}
          onChange={handleSectionChange}
        />
      </div>
    </div>
  );
}