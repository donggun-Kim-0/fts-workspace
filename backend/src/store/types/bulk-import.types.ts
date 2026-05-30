export type BulkImportRowError = {
  row: number;
  field?: string;
  code: 'REQUIRED' | 'FORMAT' | 'DUPLICATE' | 'UNKNOWN';
  message: string;
};

export type BulkImportReport = {
  total: number;
  successCount: number;
  failureCount: number;
  createdIds: string[];
  errors: BulkImportRowError[];
};
