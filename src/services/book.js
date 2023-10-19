import axios from "./config";

export default {
  list: (params) => {
    return axios.get("books", {
      params: {
        Page: params.Page,
        PageSize: params.PageSize,
        OrderByProperty: params.OrderByProperty,
        OrderByDesc: params.OrderByDesc,
        FilterValue: params.FilterValue,
      },
    });
  },
  listSelect: () => {
    return axios.get("books/getallselect");
  },
  listDash: () => {
    return axios.get("books/dash");
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
