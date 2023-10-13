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
import User from "@/services/users";
import Book from "@/services/book";
import Publi from "@/services/publi";
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
      { id: 2, title: "Livros disponíveis", icon: "mdi-book-check", value: "" },
      {
        id: 3,
        title: "Livros alugados",
        icon: "mdi-book-open-variant",
        value: "",
      },
      {
        id: 4,
        title: "Total de Aluguéis",
        icon: "mdi-book-account",
        value: "",
      },
      { id: 5, title: "Usuários cadastrados", icon: "mdi-account", value: "" },
      { id: 6, title: "Editoras cadastradas", icon: "mdi-pencil", value: "" },
    ],
    loadingCard: false,
    books: [],
    availableBooks: 0,
    rented: 0,
    users: 0,
    publis: 0,
    totalUsers: 0,
    totalBooks: 0,
    totalPublishers: 0,
    totalRentals: 0,
    Listusers: [],
    Listpublis: [],
    total: 0,
    rentals: [],
    lastRented: "",
  }),
  mounted() {
    this.getBooks();
    this.getRentals();
    this.getUsersAndPublishers();
  },
  components: {
    LineChart,
    PieChart,
  },
  methods: {
    async updateCardValues() {
      this.cards[0].value = this.lastRented;
      this.cards[1].value = this.availableBooks;
      this.cards[2].value = this.rented;
      this.cards[3].value = this.totalRentals;
      this.cards[4].value = this.Listusers.length;
      this.cards[5].value = this.publis;
    },
    async getBooks() {
      await Book.listDash()
        .then((response) => {
          this.books = response.data.data;
          this.getAvailableBooks();
        })
        .catch((error) => {
          console.error("Erro na busca de livros", error);
        });
    },
    async getRentals() {
      this.loadingCard = true;
      await Rental.listDash()
        .then((response) => {
          this.rentals = response.data.data;
          this.totalRentals = this.rentals.length;
          this.lastRent();
          this.getPendingRentals();
        })
        .catch((error) => {
          console.error("Erro na busca de aluguéis", error);
        })
        .finally(() => {
          this.loadingCard = false;
        });
    },
    async getUsersAndPublishers() {
      try {
        const usersResponse = await User.listSelect();
        this.Listusers = usersResponse.data.data;
        this.users = this.Listusers.length;

        const publisResponse = await Publi.listSelect();
        this.Listpublis = publisResponse.data.data;
        this.publis = this.Listpublis.length;

        this.updateCardValues();
      } catch (error) {
        console.error("Erro ao buscar usuários e editoras", error);
      }
    },
    async getAvailableBooks() {
      this.availableBooks = await this.books.reduce((total, book) => total + book.quantity, 0);
    },
    async getPendingRentals() {
      const filtereds = this.rentals.filter((rental) => !rental.returnDate);
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
