import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { logger } from '../common/logger/winston.config';

@Injectable()
export class ApiService {
  async get(url: string, config: Object = {}): Promise<any> {
    try {
      const response = await axios.get(url, config);

      if (response.status >= 200 && response.status < 300) {
        const responseData = response.data;
        return responseData;
      } else {
        console.error('Failed to fetch products:', response.statusText);
      }
    } catch (error) {
      logger.error('An error occurred:', error);
    }
  }

  async patch(url: string, data: Object = {}): Promise<any> {
    try {
      const response = await axios.patch(url, data);

      if (response.status >= 200 && response.status < 300) {
        const responseData = response.data;
        return responseData;
      } else {
        console.error('Failed to update products:', response.statusText);
      }
    } catch (error) {
      logger.error('An error occurred:', error);
      throw error;
    }
  }
}
