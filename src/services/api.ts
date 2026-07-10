import { SEOAuditReport, AuditHistoryItem } from '../../shared/types';
import { AIRecommendationResponse } from '../types/recommendation.types';

export async function getAIRecommendations(id: string): Promise<AIRecommendationResponse> {
  const response = await fetch(`/api/recommendations/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Could not retrieve AI recommendations.');
  }
  return response.json();
}

export async function runSEOAudit(url: string, userEmail?: string): Promise<SEOAuditReport> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (userEmail) {
    headers['x-user-email'] = userEmail;
  }
  
  const response = await fetch('/api/audits', {
    method: 'POST',
    headers,
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to analyze website. Please ensure it is accessible.');
  }

  return response.json();
}

export async function getHistoryList(userEmail?: string): Promise<AuditHistoryItem[]> {
  const headers: Record<string, string> = {};
  if (userEmail) {
    headers['x-user-email'] = userEmail;
  }

  const response = await fetch('/api/audits/history', {
    headers
  });
  if (!response.ok) {
    throw new Error('Could not fetch audit history.');
  }
  return response.json();
}

export async function getReportDetails(id: string, userEmail?: string): Promise<SEOAuditReport> {
  const headers: Record<string, string> = {};
  if (userEmail) {
    headers['x-user-email'] = userEmail;
  }

  const response = await fetch(`/api/audits/${id}`, {
    headers
  });
  if (!response.ok) {
    throw new Error('Could not retrieve audit report.');
  }
  return response.json();
}

export async function deleteReport(id: string, userEmail?: string): Promise<void> {
  const headers: Record<string, string> = {};
  if (userEmail) {
    headers['x-user-email'] = userEmail;
  }

  const response = await fetch(`/api/audits/${id}`, {
    method: 'DELETE',
    headers
  });
  if (!response.ok) {
    throw new Error('Could not delete audit report.');
  }
}
