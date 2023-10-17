<template>
  <v-container fluid class="pa-4">
    <v-layout row justify-center>
      <v-flex v-for="card in cards" :key="card.id" sm6 xs12 md6 lg4>
        <v-card class="ma-2" elevation="4" dark :loading="loadingCard">
          <v-card-title>
            <v-icon left large>{{ card.icon }}</v-icon>
            {{ card.title }}
          </v-card-title>
          <v-card-text class="text-subtitle-1">
            {{ card.value }}
          </v-card-text>
        </v-card>
      </v-flex>
    </v-layout>
    <v-layout row wrap justify-space-around class="mt-6">
      <LineChart />
      <PieChart />
    </v-layout>
  </v-container>
</template>

<script>
import LineChart from "@/components/LineChart";
import PieChart from "@/components/PieChart";
import User from "@/services/user";
import Book from "@/services/book";
import Publisher from "@/services/publisher";
import Rental from "@/services/rental";
export default {
  data: () => ({
    cards: [
      {
        id: 0,
        title: "Último livro alugado",
        icon: "mdi-book-sync",
        value: "",
      },
      {
        id: 1,
        title: "Aluguéis Ativos",
        icon: "mdi-book-open-variant",
        value: "",
      },
      {
        id: 2,
        title: "Total de Aluguéis",
        icon: "mdi-book-account",
        value: "",
      },
      {
        id: 3,
        title: "Livros disponíveis",
        icon: "mdi-book-check",
        value: "",
      },
      { id: 4, title: "Usuários cadastrados", icon: "mdi-account", value: "" },
      { id: 5, title: "Editoras cadastradas", icon: "mdi-pencil", value: "" },
    ],
    loadingCard: true,
    books: [],
    availableBooks: 0,
    rented: 0,
    users: 0,
    publishers: 0,
    totalUsers: 0,
    totalBooks: 0,
    totalPublishers: 0,
    totalRentals: 0,
    Listusers: [],
    Listpublishers: [],
    total: 0,
    rentals: [],
    lastRented: "",
  }),
  async mounted() {
    try {
      await this.getBooks();
      await this.getRentals();
      await this.getUsers();
      await this.getPublishers();
      await this.getAvailableBooks();
      await this.getPendingRentals();
      await this.lastRent();

      this.updateCardValues();
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      this.loadingCard = false;
    }
  },
  components: {
    LineChart,
    PieChart,
  },
  methods: {
    updateCardValues() {
      this.cards[0].value = this.lastRented;
      this.cards[1].value = this.rented;
      this.cards[2].value = this.totalRentals;
      this.cards[3].value = this.availableBooks;
      this.cards[4].value = this.users;
      this.cards[5].value = this.publishers;
    },
    async getBooks() {
      try {
        const response = await Book.listDash();
        this.books = response.data.data;
      } catch (error) {
        console.error("Erro ao buscar livros: ", error);
      }
    },
    async getRentals() {
      try {
        const response = await Rental.listDash();
        this.rentals = response.data.data;
        this.totalRentals = this.rentals.length;
      } catch (error) {
        console.error("Erro ao buscar aluguéis: ", error);
      }
    },
    async getUsers() {
      try {
        const response = await User.listSelect();
        this.Listusers = response.data.data;
        this.users = this.Listusers.length;
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    },
    async getPublishers() {
      try {
        const response = await Publisher.listSelect();
        this.Listpublishers = response.data.data;
        this.publishers = this.Listpublishers.length;
      } catch (error) {
        console.error("Erro ao buscar editora: ", error);
      }
    },
    async getAvailableBooks() {
      this.availableBooks = await this.books.reduce(
        (total, book) => total + book.quantity,
        0
      );
    },
    async getPendingRentals() {
      const filtereds = this.rentals.filter(
        (rental) => rental.status == "Pendente"
      );
      this.rented = filtereds.length;
    },
    async lastRent() {
      const last = await this.rentals.reduce((prev, current) => {
        return prev.id < current.id ? current : prev;
      });
      this.lastRented = last.book.name;
    },
  },
};
</script>
