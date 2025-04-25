import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios';
import { mock } from '../../mocks/mocker';

export type BaseGatewayOptions = Omit<AxiosRequestConfig, 'baseURL'>;

export class BaseGateway {
  private readonly requester: AxiosInstance;

  constructor(baseURL: string, props?: BaseGatewayOptions) {
    this.requester = axios.create({
      baseURL,
      ...props,
    });

    mock(this.requester, baseURL);
  }

  protected handleError(error: any): Promise<boolean> {
    return Promise.resolve(false);
  }

  protected request<T>(
    url: string,
    method: Method,
    data?: any,
    headers?: any
  ): Promise<T | void> {
    return this.requester
      .request<T>({
        method,
        url,
        data,
        headers,
      })
      .then((response) => response.data)
      .catch((error) => {
        if (!this.handleError(error.toJSON())) {
          throw error;
        }
      });
  }
}
