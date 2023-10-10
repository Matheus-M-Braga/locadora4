import axios from "./config";

export default {
  list: (params) => {
    return axios.get("rentals", {
      params: {
        Page: params.Page,
        PageSize: params.PageSize,
        OrderBy: params.OrderBy,
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
