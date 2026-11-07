
import api from './api';
import { getApiErrorMessage } from './api-error';

export async function testApiConnection() {
  try {
    const response = await api.get('/products');

    console.log('API connected:', response.data);

    return response.data;
  } catch (error) {
    console.error(
      'API connection failed:',
      getApiErrorMessage(error),
    );

    throw error;
  }
}
