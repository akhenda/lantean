/**
 * Uses https://restcountries.com
 *
 * Base URL: https://restcountries.com/v3.1
 */

import { Country } from './types';

import { client } from '../../config';

const ENDPOINT = '/region';

export async function getCountries() {
  const { data } = await client.get<Country[]>(`${ENDPOINT}/africa`);

  return data;
}
