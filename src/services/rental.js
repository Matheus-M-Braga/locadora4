import axios from './config'
export default {
   list: () => {
     return axios.get("rentals");
   },
   create: (aluguel) => {
     return axios.post("/rentals", aluguel);
   },
   update: (aluguel) => {
     return axios.put(`/rentals`, aluguel);
   },
   delete: (aluguel) => {
     return axios.delete("rentals", { data: aluguel });
   },
 };