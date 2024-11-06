// https://medium.com/@barisberkemalkoc/axios-interceptor-intelligent-db46653b7303
import assert from 'assert';
import Axios, { InternalAxiosRequestConfig } from 'axios';

import { config } from '../constants/configs/expo';
import { sessionTokenStorage } from '../storage';
import { logger } from '../logger';

assert(config.apiURL, 'env variable not set: API_URL');

function refreshToken() {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve('new token');
    }, 1000);
  });
}

function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  const authToken = sessionTokenStorage.get();

  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;

  return config;
}

function authRequestInterceptorError(error: unknown) {
  // Do something with request error
  return Promise.reject(error);
}

function errorResponseInterceptor(error: Error & { response: Response }) {
  const status = error.response ? error.response.status : null;

  if (status === 401) {
    // Handle unauthorized access
    logger.dev('Unauthorized access');
  } else if (status === 404) {
    // Handle not found errors
    logger.dev('Not found');
  } else {
    // Handle other errors
    logger.dev('Other error');
  }

  return Promise.reject(error);
}

async function refreshAuthTokenInterceptor(error: Error & { response: Response; config: InternalAxiosRequestConfig }) {
  if (error.response.status === 401) {
    // Refresh the token
    const newToken = await refreshToken();

    // Store the new token
    sessionTokenStorage.set(newToken);

    // Retry the original request
    return axios(error.config);
  }

  return Promise.reject(error);
}

export const axios = Axios.create({ baseURL: config.apiURL });

axios.interceptors.request.use(authRequestInterceptor, authRequestInterceptorError);
axios.interceptors.response.use((res) => res, errorResponseInterceptor);
axios.interceptors.response.use((res) => res, refreshAuthTokenInterceptor);
