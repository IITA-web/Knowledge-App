import axios from 'axios';

const axiosService = axios.create({
  baseURL: 'https://www.iita.org/wp-json/wp/v2/news-item/',
  timeout: 50000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// singleton instance
export default axiosService;
