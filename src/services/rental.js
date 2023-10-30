import axios from "./config";

export default {
  list: (params) => {
    if (!params) {
      params = {};
    }
    return axios.get("rentals", {
      params: {
        PageNumber: params.PageNumber,
        PageSize: params.PageSize,
        OrderByProperty: params.OrderByProperty,
        OrderByDesc: params.OrderByDesc,
        FilterValue: params.FilterValue,
      },
    });
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
