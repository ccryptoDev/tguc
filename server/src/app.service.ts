import { Injectable } from '@nestjs/common';
import { Request } from 'express';

/**
 * Global functions
 */
@Injectable()
export class AppService {
  getIPAddress(req: Request): string {
    let ip: string;

    if (req.headers['x-forwarded-for']) {
      ip = req.headers['x-forwarded-for'] as string;
    } else if (req.headers['x-real-ip']) {
      ip = req.headers['x-real-ip'] as string;
    } else if (req.socket && req.socket.remoteAddress) {
      ip = req.socket.remoteAddress;
    } else {
      ip = '127.0.0.1';
    }

    return ip.replace('::ffff:', '').replace(/^::1$/, '127.0.0.1');
  }

  errorHandler(statusCode: number, message: string, requestId: string) {
    return {
      statusCode,
      message,
      requestId,
    };
  }
}
