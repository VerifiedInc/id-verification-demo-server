import { Paginated } from '@feathersjs/feathers';
import FeathersAxiosClient from '@feathersjs/rest-client/lib/axios';
import { AxiosResponse } from 'axios';

/**
 * A re-usable class to facilitate interfacing with external services / APIs.
 */
export class AxiosClient extends FeathersAxiosClient {
  async request<T = unknown> (options: any, params: any): Promise<AxiosResponse<T | T[] | Paginated<T>>> {
    const config = Object.assign({
      url: options.url,
      method: options.method,
      data: options.body,
      headers: Object.assign({
        Accept: 'application/json'
      }, this.options.headers, options.headers)
    }, params.connection);

    try {
      return await this.connection.request(config);
    } catch (e: any) {
      const response = e.response || e;
      throw response instanceof Error ? response : (response.data || response);
    }
  }
}
