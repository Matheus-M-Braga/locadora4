import axios from "./config";

export default {
  list: () => {
    return axios.get("/books");
  },
  create: (book) => {
    return axios.post("/books", book);
  },
  update: (book) => {
    return axios.put("/books/", book);
  },
  delete: (book) => {
    return axios.delete('books', { data : book });
  },
};
