import axios from "./config";

export default {
  list: (params) => {
    return axios.get("users", {
      params: {
        Page: params.Page,
        PageSize: params.PageSize,
        OrderBy: params.OrderBy,
        FilterValue: params.FilterValue,
      },
    });
  },
  listSelect: () => {
    return axios.get("users/getallselect");
  },
  create: (user) => {
    return axios.post("users", user);
  },
  update: (user) => {
    return axios.put(`users/${user.id}`, user);
  },
  delete: (user) => {
    return axios.delete(`users/${user.id}`, { user });
  },
};
