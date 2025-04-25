import { AxiosInstance } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import * as mocks from './mocks.json';

export function mock(axios: AxiosInstance, endpoint: string) {
  const mocksEndpoint = mocks[endpoint];
  if (mocksEndpoint) {
    const mock = new MockAdapter(axios);
    Object.keys(mocksEndpoint).forEach((path) => {
      Object.keys(mocksEndpoint[path]).forEach((method) => {
        const { status, response } = mocksEndpoint[path][method];
        mock[method](path).reply(status, response);
      });
    });
  }
}
