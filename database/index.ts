import fs from 'fs/promises';
import path from 'path';
import { SEOAuditReport, AuditHistoryItem } from '../shared/types';

const REPORTS_DIR = path.join(process.cwd(), 'reports');
const HISTORY_FILE = path.join(process.cwd(), 'reports', 'history.json');

// Ensure reports directory exists
async function ensureDir() {
  try {
    await fs.mkdir(REPORTS_DIR, { recursive: true });
  } catch (err) {
    // Already exists or can't create
  }
}

export async function saveReport(report: SEOAuditReport): Promise<void> {
  await ensureDir();
  
  // Save full report
  const reportPath = path.join(REPORTS_DIR, `${report.id}.json`);
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  // Update history
  const history = await getHistory();
  const newItem: AuditHistoryItem = {
    id: report.id,
    url: report.url,
    timestamp: report.timestamp,
    overallScore: report.overallScore,
  };
  
  // Prepend to history, filter out duplicates of same URL if we want or just keep chronological
  const updatedHistory = [newItem, ...history.filter(item => item.id !== report.id)].slice(0, 50);
  await fs.writeFile(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2), 'utf-8');
}

export async function getReportById(id: string): Promise<SEOAuditReport | null> {
  await ensureDir();
  try {
    const reportPath = path.join(REPORTS_DIR, `${id}.json`);
    const content = await fs.readFile(reportPath, 'utf-8');
    return JSON.parse(content) as SEOAuditReport;
  } catch {
    return null;
  }
}

export async function getHistory(): Promise<AuditHistoryItem[]> {
  await ensureDir();
  try {
    const content = await fs.readFile(HISTORY_FILE, 'utf-8');
    return JSON.parse(content) as AuditHistoryItem[];
  } catch {
    return [];
  }
}

export async function deleteReportFromDb(id: string): Promise<void> {
  await ensureDir();
  try {
    const reportPath = path.join(REPORTS_DIR, `${id}.json`);
    await fs.unlink(reportPath);
  } catch {
    // Ignore if file doesn't exist
  }

  try {
    const history = await getHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    await fs.writeFile(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2), 'utf-8');
  } catch {
    // Ignore
  }
}
