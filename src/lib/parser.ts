export function parseTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return data[key] || match;
  });
}

export function parseJsonTemplate(template: string, data: Record<string, any>): any {
  const parsedTemplate = parseTemplate(template, data);
  return JSON.parse(parsedTemplate);
}
