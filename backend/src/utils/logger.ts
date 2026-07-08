export class Logger {
  private static getTimestamp(): string {
    return new Date().toISOString();
  }

  static info(message: string, context?: any): void {
    const ctxString = context ? ` | ${JSON.stringify(context)}` : '';
    console.log(`[${this.getTimestamp()}] [INFO] ${message}${ctxString}`);
  }

  static warn(message: string, context?: any): void {
    const ctxString = context ? ` | ${JSON.stringify(context)}` : '';
    console.warn(`\x1b[33m[${this.getTimestamp()}] [WARN] ${message}${ctxString}\x1b[0m`);
  }

  static error(message: string, error?: any): void {
    let errString = '';
    if (error) {
      if (error instanceof Error) {
        errString = ` | ${error.message}\n${error.stack || ''}`;
      } else {
        errString = ` | ${JSON.stringify(error)}`;
      }
    }
    console.error(`\x1b[31m[${this.getTimestamp()}] [ERROR] ${message}${errString}\x1b[0m`);
  }

  static debug(message: string, context?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      const ctxString = context ? ` | ${JSON.stringify(context)}` : '';
      console.log(`[${this.getTimestamp()}] [DEBUG] ${message}${ctxString}`);
    }
  }
}
