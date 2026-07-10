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
    ownerEmail: report.ownerEmail,
  };
  
  // Prepend to history, filter out duplicates of same URL if we want or just keep chronological
  const updatedHistory = [newItem, ...history.filter(item => item.id !== report.id)].slice(0, 50);
  await fs.writeFile(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2), 'utf-8');
}

export async function getReportById(id: string, userEmail?: string): Promise<SEOAuditReport | null> {
  await ensureDir();
  try {
    const reportPath = path.join(REPORTS_DIR, `${id}.json`);
    const content = await fs.readFile(reportPath, 'utf-8');
    const report = JSON.parse(content) as SEOAuditReport;
    
    // Ownership validation for isolation
    if (userEmail && report.ownerEmail && report.ownerEmail.toLowerCase() !== userEmail.toLowerCase()) {
      return null;
    }
    return report;
  } catch {
    return null;
  }
}

export async function getHistory(userEmail?: string): Promise<AuditHistoryItem[]> {
  await ensureDir();
  try {
    const content = await fs.readFile(HISTORY_FILE, 'utf-8');
    const list = JSON.parse(content) as AuditHistoryItem[];
    if (userEmail) {
      return list.filter(item => item.ownerEmail && item.ownerEmail.toLowerCase() === userEmail.toLowerCase());
    }
    return list;
  } catch {
    return [];
  }
}

export async function deleteReportFromDb(id: string, userEmail?: string): Promise<void> {
  await ensureDir();
  try {
    const reportPath = path.join(REPORTS_DIR, `${id}.json`);
    if (userEmail) {
      const report = await getReportById(id, userEmail);
      if (!report) {
        return; // Unauthorized or not found
      }
    }
    await fs.unlink(reportPath);
  } catch {
    // Ignore if file doesn't exist
  }

  try {
    const history = await getHistory(); // Get raw complete history
    const updatedHistory = history.filter(item => item.id !== id);
    await fs.writeFile(HISTORY_FILE, JSON.stringify(updatedHistory, null, 2), 'utf-8');
  } catch {
    // Ignore
  }
}

// User Record Interface
export interface UserRecord {
  email: string;
  name: string;
  phone?: string;
  password?: string;
  plan: 'basic' | 'standard' | 'premium';
  lastAuditTimestamp?: string;
  credits: number;
  company?: string;
  avatarUrl?: string;
  joinedAt?: string;
  claimedFreePlan?: boolean;
  pendingUpgrade?: {
    plan: 'basic' | 'standard' | 'premium';
    txid?: string;
    paymentMethod?: string;
    cardholderName?: string;
    cardNumber?: string;
    paypalEmail?: string;
    requestedAt: string;
  } | null;
}

// Admin Settings Interface
export interface AdminSettings {
  binanceEnabled: boolean;
  cardEnabled: boolean;
  paypalEnabled: boolean;
  binanceAddress?: string;
  binanceNetwork?: string;
  paypalEmail?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
}

const USERS_FILE = path.join(process.cwd(), 'reports', 'users.json');
const SETTINGS_FILE = path.join(process.cwd(), 'reports', 'admin_settings.json');

// Users Operations
export async function getUsers(): Promise<UserRecord[]> {
  await ensureDir();
  try {
    const content = await fs.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(content) as UserRecord[];
  } catch {
    return [];
  }
}

export async function saveUser(user: UserRecord): Promise<void> {
  await ensureDir();
  const users = await getUsers();
  const existingIndex = users.findIndex(u => u.email.toLowerCase() === user.email.toLowerCase());
  
  if (existingIndex > -1) {
    users[existingIndex] = { ...users[existingIndex], ...user };
  } else {
    users.push({
      ...user,
      joinedAt: user.joinedAt || new Date().toISOString()
    });
  }
  
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  if (!email) return null;
  const users = await getUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  return found || null;
}

// Admin Settings Operations
export async function getAdminSettings(): Promise<AdminSettings> {
  await ensureDir();
  try {
    const content = await fs.readFile(SETTINGS_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    return {
      binanceEnabled: parsed.binanceEnabled !== false,
      cardEnabled: !!parsed.cardEnabled,
      paypalEnabled: !!parsed.paypalEnabled,
      binanceAddress: parsed.binanceAddress || '',
      binanceNetwork: parsed.binanceNetwork || '',
      paypalEmail: parsed.paypalEmail || '',
      bankName: parsed.bankName || '',
      bankBranch: parsed.bankBranch || '',
      bankAccountHolder: parsed.bankAccountHolder || '',
      bankAccountNumber: parsed.bankAccountNumber || ''
    };
  } catch {
    // Default settings
    return {
      binanceEnabled: true,
      cardEnabled: false,
      paypalEnabled: false,
      binanceAddress: '',
      binanceNetwork: '',
      paypalEmail: '',
      bankName: '',
      bankBranch: '',
      bankAccountHolder: '',
      bankAccountNumber: ''
    };
  }
}

export async function saveAdminSettings(settings: AdminSettings): Promise<void> {
  await ensureDir();
  await fs.writeFile(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
}

