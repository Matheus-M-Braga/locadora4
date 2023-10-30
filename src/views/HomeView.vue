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
        title: "Total de Aluguéis",
        icon: "mdi-book-account",
        value: "",
      },
      {
        id: 2,
        title: "Livros disponíveis",
        icon: "mdi-book-check",
        value: "",
      },
      {
        id: 3,
        title: "Livros Cadastrados",
        icon: "mdi-book-open-variant",
        value: "",
      },
      { id: 4, title: "Usuários cadastrados", icon: "mdi-account", value: "" },
      { id: 5, title: "Editoras cadastradas", icon: "mdi-pencil", value: "" },
    ],
    loadingCard: true,
    books: [],
    totalBooks: 0,
    availableBooks: 0,
    rentals: [],
    totalRentals: 0,
    lastRented: "",
    totalUsers: 0,
    totalPublishers: 0,
  }),
  async mounted() {
    try {
      await this.getBooks();
      await this.getRentals();
      await this.getUsers();
      await this.getPublishers();
      await this.getAvailableBooks();
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
      this.cards[1].value = this.totalRentals;
      this.cards[2].value = this.availableBooks;
      this.cards[3].value = this.totalBooks;
      this.cards[4].value = this.totalUsers;
      this.cards[5].value = this.totalPublishers;
    },
    async getBooks() {
      try {
        const response = await Book.list();
        this.totalBooks = response.data.totalRegisters;
        if (this.totalBooks > 0) {
          const data = await Book.list({ PageSize: this.totalBooks });
          this.books = data.data.data;
        }
      } catch (error) {
        console.error("Erro ao buscar livros: ", error);
      }
    },
    async getRentals() {
      try {
        const response = await Rental.list();
        this.totalRentals = response.data.totalRegisters;
        if (this.totalRentals > 0) {
          const data = await Rental.list({ PageSize: this.totalRentals });
          this.rentals = data.data.data;
        }
      } catch (error) {
        console.error("Erro ao buscar aluguéis: ", error);
      }
    },
    async getUsers() {
      try {
        const response = await User.list();
        this.totalUsers = response.data.totalRegisters;
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    },
    async getPublishers() {
      try {
        const response = await Publisher.list();
        this.totalPublishers = response.data.totalRegisters;
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
    async lastRent() {
      if (this.rentals.length > 0) {
        const last = await this.rentals.reduce((prev, current) => {
          return prev.id < current.id ? current : prev;
        });
        this.lastRented = last.book.name;
      } else {
        this.lastRented = "Sem dados";
      }
    },
  },
};
</script>
