import { create } from 'apisauce';

import { axios } from './axios';

export const client = create({ axiosInstance: axios });
