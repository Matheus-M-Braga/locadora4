<template>
  <v-card elevation="4" class="col-6 d-flex" :loading="loadingChart">
    <canvas ref="myChart" width="450" height="200" class="chartBar"></canvas>
  </v-card>
</template>

<script>
import Chart from "chart.js";
import Rental from "@/services/rental";

export default {
  data() {
    return {
      rentals: [],
      mostrented: [],
      loadingChart: false,
    };
  },
  mounted() {
    this.listRentals();
  },
  watch: {
    rentals: {
      handler() {
        this.updateBarChart();
      },
      deep: true,
    },
  },
  methods: {
    async listRentals(){
      this.loadingChart = true
      try {
        this.rentals = await Rental.list().finally(() => {
          this.loadingChart = false
          
        })
        const result = this.rentals.data;
        // Mais alugados
        const RentalCount = {}
        result.data.forEach((rental) => {
          const bookname = rental.book.name;
          if(RentalCount[bookname]){
            RentalCount[bookname]++;
          }
          else {
            RentalCount[bookname] = 1;
          }
        });
        this.mostrented = Object.keys(RentalCount)
          .sort((a, b) => RentalCount[b] - RentalCount[a])
          .map((bookname) => ({ bookname, quantity: RentalCount[bookname] }));
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
      } 
    },
    // Função pra reduzir as labels do gráfico de barra
    truncateLabel(label) {
      const maxLength = 13;
      if (label.length > maxLength) {
        return label.substring(0, maxLength) + "...";
      }
      return label;
    },
    updateBarChart() {
      const ctx = this.$refs.myChart.getContext("2d");
      const topFour = this.mostrented.slice(0, 4);
      const labels = topFour.map((item) => this.truncateLabel(item.bookname));
      const data = topFour.map((item) => item.quantity);
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "",
              data: data,
              backgroundColor: [
                "rgb(168, 71, 82)",
                "rgb(51, 126, 204)",
                "rgb(255, 204, 0)",
                "rgb(51, 204, 204)",
                "rgb(123, 104, 238)",
              ],
              borderWidth: 0,
            },
          ],
        },
        options: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Livros mais alugados",
            fontSize: 25,
            fontFamily: "Roboto",
          },
          maintainAspectRatio: false,
        },
      });
    },
  },
};
</script>
