import { URL } from 'url';

export class Validator {
  /**
   * Validates if a string is a well-formed absolute HTTP/HTTPS URL.
   */
  static isValidUrl(urlStr: string): boolean {
    if (!urlStr || typeof urlStr !== 'string') {
      return false;
    }
    try {
      const parsed = new URL(urlStr);
      return ['http:', 'https:'].includes(parsed.protocol) && !!parsed.hostname;
    } catch {
      return false;
    }
  }

  /**
   * Standardizes the URL by ensuring it has a protocol.
   * Defaults to 'https://' if no protocol is supplied.
   */
  static sanitizeAndNormalizeUrl(urlStr: string): string {
    let trimmed = urlStr.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = 'https://' + trimmed;
    }
    try {
      const parsed = new URL(trimmed);
      return parsed.toString();
    } catch {
      return trimmed;
    }
  }

  /**
   * Helper to extract the hostname/domain from a URL.
   */
  static getDomain(urlStr: string): string {
    try {
      const parsed = new URL(this.sanitizeAndNormalizeUrl(urlStr));
      return parsed.hostname;
    } catch {
      return '';
    }
  }
}
