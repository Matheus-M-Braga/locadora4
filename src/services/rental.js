import axios from "./config";

export default {
  list: (params) => {
    return axios.get("rentals", {
      params: {
        FilterValue: params.FilterValue,
        Page: params.Page,
        PageSize: params.PageSize,
        OrderBy: params.OrderBy,
      },
    });
  },
  listDash: () => {
    return axios.get("rentals/dash");
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
