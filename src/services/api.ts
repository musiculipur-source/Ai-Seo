import { SEOAuditReport, AuditHistoryItem } from '../../shared/types';

export async function runSEOAudit(url: string): Promise<SEOAuditReport> {
  const response = await fetch('/api/audits', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to analyze website. Please ensure it is accessible.');
  }

  return response.json();
}

export async function getHistoryList(): Promise<AuditHistoryItem[]> {
  const response = await fetch('/api/audits/history');
  if (!response.ok) {
    throw new Error('Could not fetch audit history.');
  }
  return response.json();
}

export async function getReportDetails(id: string): Promise<SEOAuditReport> {
  const response = await fetch(`/api/audits/${id}`);
  if (!response.ok) {
    throw new Error('Could not retrieve audit report.');
  }
  return response.json();
}

export async function deleteReport(id: string): Promise<void> {
  const response = await fetch(`/api/audits/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Could not delete audit report.');
  }
}
