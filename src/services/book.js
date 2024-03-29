import axios from "./config";

export default {
  list: (params) => {
    if (!params) {
      params = {};
    }
    return axios.get("books", {
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
    return axios.get("books/getsummary");
  },
  create: (book) => {
    return axios.post("books", book);
  },
  update: (book) => {
    return axios.put(`books/${book.id}`, book);
  },
  delete: (book) => {
    return axios.delete(`books/${book.id}`, { book });
  },
};
