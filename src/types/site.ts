// Общие типы для админ-панели

export interface Section {
  id: string;
  type: string;
  values: Record<string, any>;
  enabled?: boolean;
}

export interface Page {
  id: string;
  title: string;
  slug: string;
  sections: Section[];
}

export interface AdminConfig {
  sectionTypes: {
    [key: string]: {
      name: string;
      description: string;
      schema: {
        type: string;
        properties: Record<string, any>;
      };
    };
  };
}

export interface MediaFile {
  Key: string;
  LastModified: string;
  Size: number;
  url: string | null;
  type: 'file' | 'folder';
}

export interface DeployStatus {
  status: 'success' | 'building' | 'queued' | 'error' | 'unknown';
  runId: number;
  createdAt: string;
  updatedAt: string;
  conclusion: string | null;
  message: string;
}

export interface FieldConfig {
  name: string;
  type: string;
  title: string;
  description?: string;
  required?: boolean;
  default?: any;
  options?: string[];
  validation?: any;
}

export interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  onUpload: (file: File) => Promise<string>;
}

