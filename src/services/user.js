import axios from "./config";

export default {
  list: (params) => {
    if (!params) {
      params = {};
    }
    return axios.get("users", {
      params: {
        PageNumber: params.PageNumber,
        PageSize: params.PageSize,
        OrderByProperty: params.OrderByProperty,
        OrderByDesc: params.OrderByDesc,
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
