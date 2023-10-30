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
      total: 0,
      mostrented: [],
      loadingChart: true,
    };
  },
  mounted() {
    this.getRentals();
  },
  methods: {
    async getRentals() {
      try {
        const result = await Rental.list();
        this.total = result.data.totalRegisters;
        if (this.total > 0) {
          const data = await Rental.list({ PageSize: this.total });
          this.rentals = data.data;
        }

        const RentalCount = {};
        this.rentals.data.forEach((rental) => {
          const bookname = rental.book.name;
          if (RentalCount[bookname]) {
            RentalCount[bookname]++;
          } else {
            RentalCount[bookname] = 1;
          }
        });
        this.mostrented = Object.keys(RentalCount)
          .sort((a, b) => RentalCount[b] - RentalCount[a])
          .map((bookname) => ({ bookname, quantity: RentalCount[bookname] }));
      } catch (error) {
        console.error(error);
      } finally {
        this.loadingChart = false;
        this.updateBarChart();
      }
    },
    truncateLabel(label) {
      const maxLength = 13;
      if (label.length > maxLength) {
        return label.substring(0, maxLength) + "...";
      }
      return label;
    },
    async updateBarChart() {
      const ctx = this.$refs.myChart.getContext("2d");
      const topFour = this.mostrented.slice(0, 3);

      var labels = topFour.map((item) => this.truncateLabel(item.bookname));
      var data = topFour.map((item) => this.truncateLabel(item.quantity));

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
          scales: {
            yAxes: [
              {
                ticks: {
                  display: false,
                },
                gridLines: {
                  display: false,
                },
              },
            ],
            xAxes: [
              {
                gridLines: {
                  display: false,
                },
              },
            ],
          },
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
