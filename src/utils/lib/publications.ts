import axios from 'axios';

const axiosService = axios.create({
  baseURL: 'http://biblio1.iita.org/rest/',
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// singleton instance
export default axiosService;
