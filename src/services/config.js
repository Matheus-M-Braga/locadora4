import axios from "axios";

const api = axios.create({
  baseURL: "https://locadoraapp-f5dyh7dthmgzajg5.brazilsouth-01.azurewebsites.net/api/",
});

export default api;
