'use client';

import {
	clearCustomFieldMappings,
	getCustomFieldMappings,
	removeFieldMapping,
	setFieldMapping
} from '@/lib/field-mapping';
import { useEffect, useState } from 'react';

interface FieldMappingEditorProps {
  onMappingChange?: () => void;
}

export default function FieldMappingEditor({ onMappingChange }: FieldMappingEditorProps) {
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldKey, setNewFieldKey] = useState('');

  useEffect(() => {
    setMappings(getCustomFieldMappings());
  }, []);

  const handleAddMapping = () => {
    if (newFieldLabel && newFieldKey) {
      setFieldMapping(newFieldLabel, newFieldKey);
      setMappings(getCustomFieldMappings());
      setNewFieldLabel('');
      setNewFieldKey('');
      onMappingChange?.();
    }
  };

  const handleRemoveMapping = (fieldLabel: string) => {
    removeFieldMapping(fieldLabel);
    setMappings(getCustomFieldMappings());
    onMappingChange?.();
  };

  const handleClearAll = () => {
    clearCustomFieldMappings();
    setMappings({});
    onMappingChange?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Управление маппингом полей</h3>
        <button
          onClick={handleClearAll}
          className="px-3 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
        >
          Очистить все
        </button>
      </div>

      {/* Добавление нового маппинга */}
      <div className="p-4 bg-gray-800/30 rounded-xl">
        <h4 className="text-sm font-medium text-white mb-3">Добавить маппинг поля</h4>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Название поля (например: Мое поле)"
            value={newFieldLabel}
            onChange={(e) => setNewFieldLabel(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Ключ (например: myField)"
            value={newFieldKey}
            onChange={(e) => setNewFieldKey(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleAddMapping}
            className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
          >
            Добавить
          </button>
        </div>
      </div>

      {/* Список существующих маппингов */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white">Текущие маппинги:</h4>
        {Object.keys(mappings).length === 0 ? (
          <p className="text-gray-400 text-sm">Нет пользовательских маппингов</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(mappings).map(([label, key]) => (
              <div key={label} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex-1">
                  <span className="text-white font-medium">&quot;{label}&quot;</span>
                  <span className="text-gray-400 mx-2">→</span>
                  <span className="text-blue-400 font-mono">&quot;{key}&quot;</span>
                </div>
                <button
                  onClick={() => handleRemoveMapping(label)}
                  className="px-2 py-1 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition-colors"
                >
                  Удалить
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="text-xs text-gray-400">
        <p>• Маппинги позволяют связать названия полей с ключами в данных</p>
        <p>• Если маппинг не задан, используется автоматическое преобразование в camelCase</p>
        <p>• Изменения применяются сразу и сохраняются в сессии</p>
      </div>
    </div>
  );
}
