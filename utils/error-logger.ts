import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface ErrorLog {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  context?: any;
  userAgent?: string;
  platform: string;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private readonly MAX_LOGS = 100;
  private readonly STORAGE_KEY = 'error_logs';

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  async logError(error: Error | string, context?: any, level: 'error' | 'warning' | 'info' = 'error') {
    try {
      const errorLog: ErrorLog = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        level,
        message: typeof error === 'string' ? error : error.message,
        stack: typeof error === 'object' ? error.stack : undefined,
        context,
        userAgent: Platform.OS === 'web' ? navigator.userAgent : undefined,
        platform: Platform.OS,
      };

      // Console log for development
      if (__DEV__) {
        console.log(`[${level.toUpperCase()}]`, errorLog.message, errorLog.context);
        if (errorLog.stack) {
          console.log('Stack:', errorLog.stack);
        }
      }

      // Store in AsyncStorage
      await this.storeLog(errorLog);

      // Send to backend if available
      if (Platform.OS === 'web' || !__DEV__) {
        this.sendToBackend(errorLog).catch(() => {
          // Silently fail if backend is not available
        });
      }
    } catch (e) {
      console.error('Failed to log error:', e);
    }
  }

  private async storeLog(errorLog: ErrorLog) {
    try {
      const existingLogs = await this.getLogs();
      const updatedLogs = [errorLog, ...existingLogs].slice(0, this.MAX_LOGS);
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedLogs));
    } catch (e) {
      console.error('Failed to store error log:', e);
    }
  }

  async getLogs(): Promise<ErrorLog[]> {
    try {
      const logs = await AsyncStorage.getItem(this.STORAGE_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
      console.error('Failed to retrieve error logs:', e);
      return [];
    }
  }

  async clearLogs() {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear error logs:', e);
    }
  }

  private async sendToBackend(errorLog: ErrorLog) {
    // This would send to your backend error logging service
    // For now, we'll just prepare the structure
    const payload = {
      ...errorLog,
      app_version: '1.0.0',
      environment: __DEV__ ? 'development' : 'production',
    };

    // TODO: Replace with actual backend endpoint
    // await fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(payload),
    // });
  }

  // Convenience methods
  error(message: string | Error, context?: any) {
    return this.logError(message, context, 'error');
  }

  warn(message: string | Error, context?: any) {
    return this.logError(message, context, 'warning');
  }

  warning(message: string | Error, context?: any) {
    return this.logError(message, context, 'warning');
  }

  info(message: string | Error, context?: any) {
    return this.logError(message, context, 'info');
  }
}

export const errorLogger = ErrorLogger.getInstance();

// Global error handler
if (Platform.OS !== 'web') {
  const originalConsoleError = console.error;
  console.error = (...args) => {
    originalConsoleError(...args);
    errorLogger.error(args.join(' '), { source: 'console.error' });
  };
}

// React error boundary helper
export const logReactError = (error: Error, errorInfo: any) => {
  errorLogger.error(error, {
    componentStack: errorInfo.componentStack,
    source: 'react_error_boundary',
  });
};