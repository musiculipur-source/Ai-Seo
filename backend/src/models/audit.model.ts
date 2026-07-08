export interface AuditRequest {
  url: string;
}

export class AuditModel {
  static createInitial(url: string) {
    return {
      url,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
  }
}
