import axios from "./config";

export default {
  list: () => {
    return axios.get("users");
  },
  create: (user) => {
    return axios.post("users", user);
  },
  update: (user) => {
    return axios.put("users/", user);
  },
  delete: (user) => {
    return axios.delete("users", { data: user });
  },
};
