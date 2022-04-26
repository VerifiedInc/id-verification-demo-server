declare module '@feathersjs/rest-client/lib/axios' {
    import Base from '@feathersjs/rest-client/lib/base';

    class AxiosClient extends Base {
      request (options: any, params: any): Promise<any>;
    }

    export default AxiosClient;
  }
