import axios from 'axios';
import { Alert } from 'react-native';
import { BASE_URL } from '../api/apiBaseUrl';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});


api.interceptors.request.use(
  config => {
    console.log(
      `${config.method?.toUpperCase()} ${config.url}`,
    );

    return config;
  },
  error => Promise.reject(error),
);


// Response Interceptor
api.interceptors.response.use(
  response => response,

  error => {
    const status = error?.response?.status;

    switch (status) {
      case 200:
      case 201:
        break;

      case 400:
        Alert.alert('Error', 'Bad Request');
        break;

      case 401:
        Alert.alert(
          'Error',
          'Session Expired',
        );
        break;

      case 403:
        Alert.alert(
          'Error',
          'Access Denied',
        );
        break;

      case 404:
        Alert.alert(
          'Error',
          'Data Not Found',
        );
        break;

      case 422:
        Alert.alert(
          'Error',
          error?.response?.data?.message ||
            'Validation Error',
        );
        break;

      case 500:
        Alert.alert(
          'Error',
          'Server Error',
        );
        break;

      default:
        Alert.alert(
          'Error',
          error?.message ||
            'Something Went Wrong',
        );
    }

    return Promise.reject(error);
  },
);

export default api;