import axios from "axios";
import { Service } from "../service";

const projectAxiosService = axios.create({
  baseURL: Service.projectsUrl,
  timeout: 50000,
  headers: {
    "Content-Type": "application/json",
  },
});

// singleton instance
export default projectAxiosService;
