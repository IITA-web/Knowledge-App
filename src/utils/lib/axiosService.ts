import axios from "axios";
import { Service } from "../service";

const axiosService = axios.create({
  baseURL: Service.newsUrl,
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
});

// singleton instance
export default axiosService;
