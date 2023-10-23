<template>
  <div>
    <v-container fluid class="pa-4">
      <TableTop
        :search="search"
        @updateSearch="updateSearch"
        @open-modal="openModalCreate"
        :PageTitle="PageTitle"
      />
      <v-layout row wrap class="table">
        <v-data-table
          dark
          :loading="loadingTable"
          :headers="headers"
          :header-props="headerprops"
          :items="rentals"
          :server-items-length="totalItems"
          :items-per-page="pageSize"
          :no-results-text="noDataText"
          :no-data-text="noDataText"
          :footer-props="{
            'items-per-page-text': 'Registros por página',
            'items-per-page-options': [7, 10, 15, this.totalItems],
          }"
          @update:options="handleOptionsUpdate"
          mobile-breakpoint="890"
          class="elevation-1"
        >
          <template v-slot:[`item.returnDate`]="{ item }">
            <td v-if="item.returnDate != null">
              {{ item.returnDate }}
            </td>
            <td v-if="item.returnDate == null" class="text-center">...</td>
          </template>
          <template v-slot:[`item.status`]="{ item }">
            <td>
              <v-chip :class="statusClass(item)" class="black--text">
                {{ item.status }}
              </v-chip>
            </td>
          </template>
          <template v-slot:[`item.acoes`]="{ item }">
            <td>
              <v-icon
                v-if="item.status == 'Pendente'"
                class="mr-2"
                @click="openModalDevol(item)"
              >
                mdi-book
              </v-icon>
              <v-icon
                v-if="item.status == 'Pendente'"
                class=""
                @click="openModalDelete(item)"
              >
                mdi-delete
              </v-icon>
            </td>
          </template>
        </v-data-table>
      </v-layout>
    </v-container>
    <!-- modal create -->
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="500px">
        <v-card dark>
          <v-card-title>
            <span class="text-h5">{{ ModalTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-col>
              <v-col cols="12">
                <v-select
                  v-model="book"
                  :items="books"
                  item-text="name"
                  label="Livro"
                  required
                  :error-messages="BookError"
                  @input="$v.book.$touch()"
                  @blur="$v.book.$touch()"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="user"
                  :items="users"
                  item-text="name"
                  label="Usuário"
                  required
                  :error-messages="UserError"
                  @input="$v.user.$touch()"
                  @blur="$v.user.$touch()"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  disabled
                  v-model="rentalDate"
                  label="Data do Aluguel (Hoje)"
                  required
                  :error-messages="AlugError"
                  @input="$v.rentalDate.$touch()"
                  @blur="$v.rentalDate.$touch()"
                  type="date"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="forecastDate"
                  label="Previsão de Devolução"
                  required
                  :error-messages="DevolError"
                  @input="$v.forecastDate.$touch()"
                  @blur="$v.forecastDate.$touch()"
                  type="date"
                  :min="rentalDate"
                  :max="MaxDate()"
                ></v-text-field>
              </v-col>
            </v-col>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="closeModal">
              Cancelar
            </v-btn>
            <v-btn color="blue darken-1" text @click="confirm"> Salvar </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <!-- modal delete -->
    <v-row justify="center">
      <v-dialog v-model="dialogDelete" persistent max-width="600px">
        <v-card dark>
          <v-card-title>
            <span class="text-h5">Excluir Aluguel</span>
          </v-card-title>
          <v-card-text>
            Tem certeza que deseja excluir o item selecionado?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="closeModalDelete">
              Cancelar
            </v-btn>
            <v-btn color="green darken-1" text @click="confirmDelete(update)">
              Confirmar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
    <!-- modal devol -->
    <v-row justify="center">
      <v-dialog v-model="dialogDevol" persistent max-width="600px">
        <v-card dark>
          <v-card-title>
            <span class="text-h5">Devolver Livro</span>
          </v-card-title>
          <v-card-text>Tem certeza que deseja devolver o livro? </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="closeModalDevol">
              Cancelar
            </v-btn>
            <v-btn color="green darken-1" text @click="confirmDevol(update)">
              Confirmar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import Rental from "@/services/rental";
import Book from "@/services/book";
import User from "@/services/user";
import Swal from "sweetalert2";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import TableTop from "@/components/TableTop";

export default {
  components: {
    TableTop,
  },

  mixins: [validationMixin],
  validations: {
    book: { required },
    user: { required },
    rentalDate: { required },
    forecastDate: { required },
  },
  data() {
    return {
      noDataText: "Nenhum registro encontrado",
      search: "",
      ModalTitle: "",
      PageTitle: "Aluguéis",
      headers: [
        { text: "ID", value: "id" },
        { text: "Livro", align: "start", value: "book.name" },
        { text: "Usuário", value: "user.name" },
        { text: "Data do Aluguel", value: "rentalDate" },
        { text: "Previsão de Devolução", value: "forecastDate" },
        { text: "Data de Devolução", value: "returnDate" },
        { text: "Status", value: "status" },
        { text: "Ações", value: "acoes", sortable: false },
      ],
      headerprops: {
        sortByText: "Ordenar Por",
      },
      rentals: [],
      books: [],
      users: [],
      id: 0,
      book: "",
      user: "",
      rentalDate: "",
      forecastDate: "",
      returnDate: "",
      status: "",
      totalItems: 0,
      pageSize: 0,
      OrderByProperty: "Id",
      OrderByDesc: false,
      page: 1,
      dialog: false,
      dialogDelete: false,
      dialogDevol: false,
      rentalId: null,
      loadingTable: true,
    };
  },
  computed: {
    BookError() {
      const errors = [];
      if (!this.$v.book.$dirty) return errors;
      !this.$v.book.required && errors.push("Informe o livro.");
      return errors;
    },
    UserError() {
      const errors = [];
      if (!this.$v.user.$dirty) return errors;
      !this.$v.user.required && errors.push("Informe o usuário.");
      return errors;
    },
    AlugError() {
      const errors = [];
      if (!this.$v.rentalDate.$dirty) return errors;
      !this.$v.rentalDate.required && errors.push("Informe a data do aluguel.");
      return errors;
    },
    DevolError() {
      const errors = [];
      if (!this.$v.forecastDate.$dirty) return errors;
      !this.$v.forecastDate.required &&
        errors.push("Informe a previsão de devolução.");
      return errors;
    },
  },
  mounted() {
    this.getRentals();
    this.getBooks();
    this.getUsers();
  },
  methods: {
    updateSearch(newSearchValue) {
      const dateRegex = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{1,4}))?$/;

      if (dateRegex.test(newSearchValue)) {
        this.search = this.parseDate(newSearchValue);
        this.getRentals();
      } else {
        this.search = newSearchValue;
        this.getRentals();
      }
    },
    MaxDate() {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 30);
      return futureDate.toISOString().substr(0, 10);
    },
    statusClass(item) {
      if (item.status == "Atrasado") {
        return "red";
      } else if (item.status == "No prazo") {
        return "green";
      } else {
        return "yellow";
      }
    },
    formatDate(dateString) {
      const utcDate = new Date(dateString);
      const localDate = new Date(
        utcDate.getTime() + utcDate.getTimezoneOffset() * 60000
      );
      const options = {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        timeZone: "UTC",
      };
      return localDate.toLocaleDateString("pt-BR", options);
    },
    parseDate(date) {
      if (!date) return null;

      const [day, month, year] = date.split("/");
      let formattedDate = `${month}-${day}`;

      if (year) {
        formattedDate = `${year}-${month}-${day}`;
      }

      return formattedDate;
    },
    getCurrentDate() {
      const brazilTimeZoneOffset = -3 * 60;
      const currentUTCDate = new Date();
      const brazilCurrentDate = new Date(
        currentUTCDate.getTime() + brazilTimeZoneOffset * 60 * 1000
      );
      return brazilCurrentDate.toISOString().substr(0, 10);
    },
    async getRentals() {
      try {
        const response = await Rental.list({
          Page: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.OrderByProperty,
          OrderByDesc: this.OrderByDesc,
          FilterValue: this.search,
        });
        this.rentals = response.data.data;
        this.totalItems = response.data.totalRegisters;

        this.rentals.forEach((rental) => {
          rental.forecastDate = this.formatDate(rental.forecastDate);
          rental.rentalDate = this.formatDate(rental.rentalDate);
          rental.returnDate = rental.returnDate = rental.returnDate
            ? this.formatDate(rental.returnDate)
            : null;
        });
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
        if (error.response.status == 404) {
          this.rentals = [];
        }
      } finally {
        this.loadingTable = false;
        console.log(this.rentals)
      }
    },
    async getBooks() {
      try {
        const response = await Book.listSelect();
        this.books = response.data.data;
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
      }
    },
    async getUsers() {
      try {
        const response = await User.listSelect();
        this.users = response.data.data;
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
      }
    },
    handleOptionsUpdate(options) {
      const sortByMapping = {
        id: "Id",
        "book.name": "Book.Name",
        "user.name": "User.Name",
        rentalDate: "RentalDate",
        forecastDate: "ForecastDate",
        returnDate: "ReturnDate",
        status: "Status",
      };
      console.log(options);
      if (options.sortBy[0] || options.sortDesc[0]) {
        this.OrderByProperty = sortByMapping[options.sortBy[0]];
        this.OrderByDesc = options.sortDesc[0];
      } else {
        this.OrderByProperty = "Status";
        this.OrderByDesc = true;
        this.rentals.sort((a, b) => {
          if (a.status === "Pendente" && b.status !== "Pendente") {
            return -1;
          } else if (a.status !== "Pendente" && b.status === "Pendente") {
            return 1;
          } else {
            return 0;
          }
        });
      }
      this.pageSize = options.itemsPerPage;
      this.page = options.page;
      this.getRentals();
    },
    openModalCreate() {
      this.ModalTitle = "Adicionar Aluguel";
      this.dialog = true;
      this.$v.$reset();

      this.book = "";
      this.user = "";
      this.rentalDate = this.getCurrentDate();
      this.forecastDate = "";
      this.returnDate = "";
    },
    closeModal() {
      this.dialog = false;
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$error) {
        if (this.ModalTitle === "Adicionar Aluguel") {
          const selectedBook = this.books.find(
            (livro) => livro.name === this.book
          );
          const selectedUser = this.users.find(
            (usuario) => usuario.name === this.user
          );

          const createdRental = {
            bookId: selectedBook.id,
            userId: selectedUser.id,
            rentalDate: this.rentalDate,
            forecastDate: this.forecastDate,
          };
          Rental.create(createdRental)
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Aluguel adicionado com êxito!",
                showConfirmButton: false,
                timer: 3500,
              });
              this.closeModal();
              this.getRentals();
            })
            .catch((error) => {
              console.error("Erro ao adicionar o aluguel:", error);
              Swal.fire({
                icon: "error",
                title: "Erro ao adicionar o aluguel: ",
                text: error.response.data.message,
                showConfirmButton: false,
                timer: 3500,
              });
            });
        }
      }
    },
    openModalDelete(rental) {
      this.update = { ...rental };
      this.dialogDelete = true;
    },
    closeModalDelete() {
      this.dialogDelete = false;
    },
    confirmDelete(rental) {
      const selectedBook = this.books.find((book) => book.name === rental.book);
      const selectedUser = this.users.find((user) => user.name === rental.user);
      const deletedRental = {
        id: rental.id,
        book: selectedBook,
        user: selectedUser,
        rentalDate: this.parseDate(rental.rentalDate),
        forecastDate: this.parseDate(rental.forecastDate),
        returnDate: rental.returnDate !== "..." ? rental.returnDate : null,
      };
      Rental.delete(deletedRental)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Aluguel deletado com êxito!",
            showConfirmButton: false,
            timer: 3500,
          });
          this.getRentals();
          this.closeModalDelete();
        })
        .catch((error) => {
          console.error("Erro ao deletar aluguel:", error);
          Swal.fire({
            icon: "error",
            title: "Erro ao deletar aluguel!",
            text: error.response.data.message,
            showConfirmButton: false,
            timer: 3500,
          });
          this.closeModalDelete();
        });
    },
    openModalDevol(rental) {
      this.dialogDevol = true;
      this.update = { ...rental };
    },
    confirmDevol(rental) {
      const selectedBook = this.books.find((book) => book.name === rental.book);
      const selectedUser = this.users.find((user) => user.name === rental.user);
      const returnedRental = {
        id: rental.id,
        book: selectedBook ? { ...selectedBook } : this.book,
        user: selectedUser ? { ...selectedUser } : this.user,
        rentalDate: this.parseDate(rental.rentalDate),
        forecastDate: this.parseDate(rental.forecastDate),
        returnDate: new Date().toISOString().substr(0, 10),
      };
      Rental.update(returnedRental)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Devolução realizada com êxito!",
            showConfirmButton: false,
            timer: 3500,
          });
          this.closeModalDevol();
          this.getRentals();
        })
        .catch((error) => {
          console.error("Erro ao devolver aluguel:", error);
          Swal.fire({
            icon: "error",
            title: "Erro ao realizar devolução!",
            text: error.response.data.message,
            showConfirmButton: false,
            timer: 3500,
          });
        });
    },
    closeModalDevol() {
      this.dialogDevol = false;
    },
  },
};
</script>
