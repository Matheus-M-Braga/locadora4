<template>
  <v-card elevation="4" class="col-6 charts">
    <v-progress-circular
      v-if="rentals.length === 0"
      class="center-progress mt-12"
      color="blue lighten-3"
      indeterminate
      :size="150"
    ></v-progress-circular>
    <canvas
      ref="myPieChart"
      width="450"
      height="200"
      class="chartPie"
      :style="{ display: rentals.length > 0 ? 'block' : 'none' }"
    ></canvas>
  </v-card>
</template>

<script>
import Chart from "chart.js";
import Rental from "@/services/rental";

export default {
  data() {
    return {
      rentals: [],
      total: 0,
      registers: [],
      loadingChart: true,
    };
  },
  mounted() {
    this.listStatus();
  },
  methods: {
    async listStatus() {
      try {
        const data = await Rental.list();
        this.total = data.data.totalRegisters;
        if (this.total > 0) {
          const result = await Rental.list({ PageSize: this.total });
          this.registers = result.data;
        }
        const status = {
          "No prazo": 0,
          Atrasado: 0,
          Pendente: 0,
        };
        this.registers.data.forEach((rental) => {
          const rentalStatus = rental.status;
          if (rentalStatus === "Atrasado") {
            status["Atrasado"]++;
          } else if (rentalStatus === "No prazo") {
            status["No prazo"]++;
          } else if (rentalStatus === "Pendente") {
            status["Pendente"]++;
          }
        });
        const statusCountArray = Object.entries(status);
        this.rentals = statusCountArray;
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        this.loadingChart = false;
        this.updatePieChart();
      }
    },
    updatePieChart() {
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
          maintainAspectRatio: false,
        },
      });
    },
  },
};
</script>
