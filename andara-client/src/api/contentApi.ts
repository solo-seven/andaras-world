import apiClient from './client';

export interface ContentImportRequest {
  items: unknown[];
  importedBy?: string;
  changeSummary?: string;
}

export interface ContentImportResponse {
  success: boolean;
  importedCount: number;
  importedIds: string[];
  warnings: string[];
  dryRun: boolean;
  errors?: string[];
}

export interface ContentExportResponse {
  success: boolean;
  exportedCount: number;
  outputDirectory: string;
  manifestPath: string;
  errors: string[];
}

/**
 * Import content into the database.
 */
export async function importContent(
  contentType: string,
  items: unknown[],
  dryRun: boolean = false,
  importedBy: string = 'admin',
  changeSummary: string = ''
): Promise<ContentImportResponse> {
  const response = await apiClient.post<ContentImportResponse>(
    `/admin/content/import?type=${contentType}&dryRun=${dryRun}`,
    {
      items,
      importedBy,
      changeSummary,
    }
  );
  return response.data;
}

/**
 * Export content from the database.
 */
export async function exportContent(
  contentType: string,
  outputDir: string = './content-export',
  exportedBy: string = 'admin',
  environment: string = 'dev'
): Promise<ContentExportResponse> {
  const response = await apiClient.get<ContentExportResponse>(
    `/admin/content/export?type=${contentType}&outputDir=${encodeURIComponent(outputDir)}&exportedBy=${encodeURIComponent(exportedBy)}&environment=${encodeURIComponent(environment)}`
  );
  return response.data;
}

/**
 * Get list of content items (placeholder for future implementation).
 */
export async function listContent(_contentType: string): Promise<unknown[]> {
  // TODO: Implement when list endpoint is available
  return [];
}
