import axios from "./config";

export default {
  list: (params) => {
    if (!params) {
      params = {};
    }
    return axios.get("publishers", {
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
    return axios.get("publishers/getsummary");
  },
  create: (publisher) => {
    return axios.post("publishers", publisher);
  },
  update: (publisher) => {
    return axios.put(`publishers/${publisher.id}`, publisher);
  },
  delete: (publisher) => {
    return axios.delete(`publishers/${publisher.id}`, { publisher });
  },
};
