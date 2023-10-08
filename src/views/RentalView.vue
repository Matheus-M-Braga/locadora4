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
          :items="filteredRentals"
          :items-per-page="7"
          mobile-breakpoint="890"
          class="elevation-1"
          :no-results-text="'Nenhum registro encontrado'"
          :header-props="headerprops"
          :footer-props="{
            'items-per-page-text': 'Registros por página',
            'items-per-page-options': [7, 10, 15, this.rentals.length],
          }"
        >
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
                  :items="listBooks"
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
                  :items="listUsers"
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
import User from "@/services/users";
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
        { text: "Livro", align: "start", value: "book" },
        { text: "Usuário", value: "user" },
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
      listBooks: [],
      listUsers: [],
      book: "",
      user: "",
      rentalDate: "",
      forecastDate: "",
      returnDate: "",
      status: "",
      dialog: false,
      dialogDelete: false,
      dialogDevol: false,
      rentalId: null,
      loadingTable: false,
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
    filteredRentals() {
      const searchValue = this.search.toLowerCase();
      return this.rentals.filter((rental) => {
        for (const prop in rental) {
          const propValue = rental[prop].toString().toLowerCase();
          if (propValue.includes(searchValue)) {
            return true;
          }
        }
        return false;
      });
    },
  },
  mounted() {
    this.listAlugs();
  },
  methods: {
    updateSearch(newSearchValue) {
      this.search = newSearchValue;
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
      return `${year}-${month}-${day}`;
    },
    getDate() {
      const brazilTimeZoneOffset = -3 * 60;
      const currentUTCDate = new Date();
      const brazilCurrentDate = new Date(
        currentUTCDate.getTime() + brazilTimeZoneOffset * 60 * 1000
      );
      return brazilCurrentDate.toISOString().substr(0, 10);
    },
    async listAlugs() {
      this.loadingTable = true;
      try {
        const [booksResponse, rentalsResponse, usersResponse] =
          await Promise.all([Book.list(), Rental.list(), User.list()]);
        const data = rentalsResponse.data;
        const dataBook = booksResponse.data;
        const dataUser = usersResponse.data;

        this.listBooks = dataBook.data.map((livro) => ({
          id: livro.id,
          name: livro.name,
        }));

        this.listUsers = dataUser.data.map((usuario) => ({
          id: usuario.id,
          name: usuario.name,
        }));

        this.rentals = data.data.map((rental) => {
          const devolucaoDate = rental.returnDate;
          const previsaoDate = rental.forecastDate;
          let statusInfo;
          if (devolucaoDate !== null) {
            if (devolucaoDate > previsaoDate) {
              statusInfo = "Atrasado";
            } else {
              statusInfo = "No prazo";
            }
          } else {
            statusInfo = "Pendente";
          }
          return {
            id: rental.id,
            book: rental.book.name,
            user: rental.user.name,
            rentalDate: this.formatDate(rental.rentalDate),
            forecastDate: this.formatDate(rental.forecastDate),
            returnDate: rental.returnDate
              ? this.formatDate(rental.returnDate)
              : "...",
            status: statusInfo,
          };
        });
        // Pendentes primeiro
        this.rentals.sort((a, b) => {
          if (a.status === "Pendente" && b.status !== "Pendente") {
            return -1;
          } else if (a.status !== "Pendente" && b.status === "Pendente") {
            return 1;
          } else {
            return 0;
          }
        });
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
      } finally {
        this.loadingTable = false;
      }
    },
    openModalCreate() {
      this.ModalTitle = "Adicionar Aluguel";
      this.dialog = true;
      this.$v.$reset();

      this.book = "";
      this.user = "";
      this.rentalDate = this.getDate();
      this.forecastDate = "";
      this.returnDate = "";
    },
    closeModal() {
      this.dialog = false;
    },
    confirm() {
      this.$v.$touch();
      if (!this.$v.$error) {
        // Identifica qual modal foi ativado (Add)
        if (this.ModalTitle === "Adicionar Aluguel") {
          const selectedBook = this.listBooks.find(
            (livro) => livro.name === this.book
          );
          const selectedUser = this.listUsers.find(
            (usuario) => usuario.name === this.user
          );

          const novoAlug = {
            book: selectedBook,
            user: selectedUser,
            rentalDate: this.rentalDate,
            forecastDate: this.forecastDate,
          };
          Rental.create(novoAlug)
            .then((response) => {
              this.rentals.push({ id: response.data.id, ...novoAlug });
              Swal.fire({
                icon: "success",
                title: "Aluguel adicionado com êxito!",
                showConfirmButton: false,
                timer: 3500,
              });
              this.closeModal();
              this.listAlugs();
            })
            .catch((error) => {
              console.error("Erro ao adicionar o aluguel:", error);
              Swal.fire({
                icon: "error",
                title: "Erro ao adicionar o aluguel: ",
                text: error.response.data.error,
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
      const selectedBook = this.listBooks.find(
        (book) => book.name === rental.book
      );
      const selectedUser = this.listUsers.find(
        (user) => user.name === rental.user
      );
      const deleteAlug = {
        id: rental.id,
        book: selectedBook,
        user: selectedUser,
        rentalDate: this.parseDate(rental.rentalDate),
        forecastDate: this.parseDate(rental.forecastDate),
        returnDate: rental.returnDate !== "..." ? rental.returnDate : null,
      };
      console.log(deleteAlug);
      Rental.delete(deleteAlug)
        .then((response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Aluguel deletado com êxito!",
              showConfirmButton: false,
              timer: 3500,
            });
            this.listAlugs();
            this.closeModalDelete();
          } else {
            Swal.fire({
              icon: "error",
              title: "Erro ao deletar aluguel!",
              showConfirmButton: false,
              timer: 3500,
            });
          }
        })
        .catch((e) => {
          console.error("Erro ao deletar aluguel:", e);
          Swal.fire({
            icon: "error",
            title: "Erro ao deletar aluguel!",
            text: e.response.data.error,
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
      const selectedBook = this.listBooks.find(
        (book) => book.name === rental.book
      );
      const selectedUser = this.listUsers.find(
        (user) => user.name === rental.user
      );
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
          this.rentals = this.rentals.map((rental) => {
            if (this.selectedALugId === returnedRental.id) {
              return returnedRental;
            } else {
              return rental;
            }
          });
          Swal.fire({
            icon: "success",
            title: "Devolução realizada com êxito!",
            showConfirmButton: false,
            timer: 3500,
          });
          this.closeModalDevol();
          this.listAlugs();
        })
        .catch((error) => {
          console.error("Erro ao devolver aluguel:", error);
          Swal.fire({
            icon: "error",
            title: "Erro ao realizar devolução!",
            text: error.response.data.error,
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
