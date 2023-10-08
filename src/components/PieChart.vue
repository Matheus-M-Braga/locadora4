<template>
  <v-card elevation="4" class="col-6" :loading="loadingChart">
    <canvas ref="myPieChart" width="450" height="200" class="chartPie"></canvas>
  </v-card>
</template>

<script>
import Chart from "chart.js";
import Rental from "@/services/rental";

export default {
  data() {
    return {
      rentals: [],
      loadingChart: false
    };
  },
  mounted() {
    this.listStatus();
  },
  watch: {
    rentals: {
      handler() {
        this.updatePieChart();
      },
      deep: true,
    },
  },
  methods: {
    parseDate(date) {
      const [dd, mm, yyyy] = date.split("/");

      return `${yyyy}-${mm}-${dd}`;
    },
    async listStatus() {
      this.loadingChart = true
      try {
        const rentals = await Rental.list().finally(() => {

        });
        const status = {
          "No prazo": 0,
          Atrasado: 0,
          Pendente: 0,
        }; 
        const result = rentals.data;
        result.data.forEach((rental) => {
          if (rental.returnDate != null) {
            const devolucaoDate = this.parseDate(rental.returnDate);
            const previsaoDate = this.parseDate(rental.forecastDate);
            if (devolucaoDate > previsaoDate) {
              status["Atrasado"]++;
            } else {
              status["No prazo"]++;
            }
          } else {
            status["Pendente"]++;
          }
        });
        const statusCountArray = Object.entries(status);
        this.rentals = statusCountArray;
        this.updatePieChart();
        this.loadingChart = false
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } 
    },
    updatePieChart() {
      if (!this.rentals) return;
      const labels = this.rentals.map((item) => item[0]);
      const data = this.rentals.map((item) => item[1]);
      const ctx = this.$refs.myPieChart.getContext("2d");
      new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              data: data,
              fill: false,
              backgroundColor: [
                "rgb(2, 149, 90)",
                "rgb(168, 45, 54)",
                "rgb(235, 204, 0)",
              ],
              borderColor: [
                "rgb(2, 149, 90)",
                "rgb(168, 45, 54)",
                "rgb(235, 204, 0)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          indexAxis: "x",
          title: {
            display: true,
            text: "Status de Aluguéis",
            fontSize: 25,
            fontFamily: "Roboto",
          },
          maintainAspectRatio: false
        },
      });
    },
  },
};
</script>
