import axios from "./config";

export default {
  list: (params) => {
    return axios.get("publishers", {
      params: {
        Page: params.Page,
        PageSize: params.PageSize,
        OrderBy: params.OrderBy,
        FilterValue: params.FilterValue
      },
    });
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
