import axios from "./config";

export default {
  list: (params) => {
    if (!params) {
      params = {};
    }
    return axios.get("rentals", {
      params: {
        Page: params.Page,
        PageSize: params.PageSize,
        OrderByProperty: params.OrderByProperty,
        OrderByDesc: params.OrderByDesc,
        FilterValue: params.FilterValue,
      },
    });
  },
  listCount: () => {
    return axios.get("rentals/count");
  },
  create: (rental) => {
    return axios.post("rentals", rental);
  },
  update: (rental) => {
    return axios.put(`rentals/${rental.id}`, rental);
  },
  delete: (rental) => {
    return axios.delete(`rentals/${rental.id}`, { rental });
  },
};
