import axios from 'axios';

const axiosService = axios.create({
  baseURL: 'https://www.slideshare.net/api/2/',
  timeout: 50000,
  headers: {
    'Content-Type': 'application/text'
  }
});

// singleton instance
export default axiosService;
