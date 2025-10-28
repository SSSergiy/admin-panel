'use client';

interface MediaBreadcrumbsProps {
  currentPath: string;
}

export default function MediaBreadcrumbs({ currentPath }: MediaBreadcrumbsProps) {
  return (
    <div className="mb-6">
      <nav className="flex items-center space-x-2 text-sm text-gray-400">
        <span>📁</span>
        <span>/</span>
        {currentPath.split('/').filter(Boolean).map((part, index, array) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="text-white">{part}</span>
            {index < array.length - 1 && <span>/</span>}
          </div>
        ))}
      </nav>
    </div>
  );
}

