<template>
  <div>
    <v-container fluid class="pa-4">
      <TableTop
        :search="search"
        @updateSearch="updateSearch"
        @open-modal="openModalCreate"
        :PageTitle="PageTitle"
      />
      <v-row wrap class="table">
        <v-data-table
          dark
          :loading="loadingTable"
          :headers="headers"
          :header-props="headerprops"
          :items="books"
          :server-items-length="totalItems"
          :items-per-page="pageSize"
          :page="page"
          :search="search"
          :no-results-text="noDataText"
          :no-data-text="noDataText"
          :footer-props="{
            'items-per-page-text': 'Registros por página',
            'items-per-page-options': [7, 10, 15, this.totalItems],
          }"
          @update:options="handleOptionsUpdate"
          mobile-breakpoint="890"
          class="elevation-1"
          item-key="id"
        >
          <template v-slot:[`item.acoes`]="{ item }">
            <td>
              <v-icon class="mr-2" @click="openModalEdit(item)">
                mdi-pencil
              </v-icon>
              <v-icon class="mr-2" @click="openModalDelete(item)">
                mdi-delete
              </v-icon>
            </td>
          </template>
        </v-data-table>
      </v-row>
    </v-container>
    <!-- modal -->
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="500px">
        <v-card dark>
          <v-card-title>
            <span class="text-h5">{{ ModalTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="name"
                  label="Nome"
                  required
                  :error-messages="NameError"
                  @input="validateName()"
                  @blur="$v.name.$touch()"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="author"
                  label="Autor"
                  required
                  :error-messages="AuthorError"
                  @input="$v.author.$touch()"
                  @blur="$v.author.$touch()"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-select
                  v-model="publisher"
                  :items="publishers"
                  item-text="name"
                  label="Editora"
                  required
                  :error-messages="PublisherError"
                  @input="$v.publisher.$touch()"
                  @blur="$v.publisher.$touch()"
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="release"
                  label="Lançamento"
                  required
                  :error-messages="DateError"
                  @input="$v.release.$touch()"
                  @blur="$v.release.$touch()"
                  type="number"
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="quantity"
                  label="Estoque"
                  required
                  :error-messages="AmountError"
                  @input="$v.quantity.$touch()"
                  @blur="$v.quantity.$touch()"
                  type="number"
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
            <span class="text-h5">Excluir Livro</span>
          </v-card-title>
          <v-card-text>
            Tem certeza que deseja excluir o livro selecionado?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red darken-1" text @click="closeModalDelete">
              Cancelar
            </v-btn>
            <v-btn color="green darken-1" text @click="confirmDelete">
              Confirmar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </div>
</template>

<script>
import Book from "@/services/book";
import Publisher from "@/services/publisher";
import Swal from "sweetalert2";
import { validationMixin } from "vuelidate";
import { required, maxLength } from "vuelidate/lib/validators";
import TableTop from "@/components/TableTop.vue";

export default {
  components: {
    TableTop,
  },
  mixins: [validationMixin],
  validations: {
    name: { required },
    author: { required },
    publisher: { required },
    release: { required, maxLength: maxLength(4) },
    quantity: { required, maxLength: maxLength(4) },
  },
  data() {
    return {
      noDataText: "Nenhum registro encontrado",
      search: "",
      ModalTitle: "",
      PageTitle: "Livros",
      headers: [
        { text: "ID", value: "id" },
        { text: "Nome", value: "name" },
        { text: "Autor", value: "author" },
        { text: "Editora", value: "publisher.name" },
        { text: "Lançamento", value: "release" },
        { text: "Estoque", value: "quantity" },
        { text: "Alugados", value: "rented" },
        { text: "Ações", value: "acoes", sortable: false },
      ],
      headerprops: {
        sortByText: "Ordenar Por",
      },
      books: [],
      publishers: [],
      id: 0,
      name: "",
      author: "",
      publisher: {},
      release: 0,
      quantity: 0,
      rented: 0,
      totalItems: 0,
      pageSize: 0,
      OrderByProperty: "Id",
      OrderByDesc: false,
      page: 1,
      dialog: false,
      dialogDelete: false,
      bookId: null,
      nameExists: false,
      loadingTable: true,
    };
  },
  computed: {
    NameError() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push("Informe o nome.");
      if (this.nameExists) {
        errors.push("Livro já cadastrado!");
      }
      return errors;
    },
    AuthorError() {
      const errors = [];
      if (!this.$v.author.$dirty) return errors;
      !this.$v.author.required && errors.push("Informe o autor.");
      return errors;
    },
    PublisherError() {
      const errors = [];
      if (!this.$v.publisher.$dirty) return errors;
      !this.$v.publisher.required && errors.push("Informe a editora.");
      return errors;
    },
    DateError() {
      const errors = [];
      if (!this.$v.release.$dirty) return errors;
      !this.$v.release.maxLength && errors.push("O limite é de 4 dígitos.");
      !this.$v.release.required && errors.push("Informe o ano de Lançamento.");
      return errors;
    },
    AmountError() {
      const errors = [];
      if (!this.$v.quantity.$dirty) return errors;
      !this.$v.quantity.maxLength && errors.push("O limite é de 4 dígitos.");
      !this.$v.quantity.required && errors.push("Informe a quantidade.");
      return errors;
    },
  },
  mounted() {
    this.getBooks();
    this.getPublishers();
  },
  methods: {
    updateSearch(newSearchValue) {
      this.search = newSearchValue;
      this.getBooks();
    },
    CheckNames() {
      return this.books.some((book) => book.name == this.name);
    },
    validateName() {
      this.nameExists = this.CheckNames(this.name);
      if (this.nameExists) {
        this.$v.name.$touch();
      }
    },
    async getBooks() {
      try {
        const response = await Book.list({
          Page: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.OrderByProperty,
          OrderByDesc: this.OrderByDesc,
          FilterValue: this.search,
        });
        this.books = response.data.data;
        this.totalItems = response.data.totalRegisters;
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
        if (error.response.status == 404) {
          this.books = [];
        }
      } finally {
        this.loadingTable = false;
      }
    },
    async getPublishers() {
      try {
        const response = await Publisher.listSelect();
        this.publishers = response.data.data;
      } catch (error) {
        console.error("Erro ao buscar editoras:", error);
      }
    },
    handleOptionsUpdate(options) {
      const sortByMapping = {
        id: "Id",
        name: "Name",
        author: "Author",
        "publisher.name": "Publisher.Name",
        release: "Release",
        quantity: "Quantity",
        rented: "Rented",
      };
      if (options.sortBy[0] || options.sortDesc[0]) {
        this.OrderByProperty = sortByMapping[options.sortBy[0]];
        this.OrderByDesc = options.sortDesc[0];
      } else {
        this.OrderByProperty = "Id";
        this.OrderByDesc = false;
      }
      this.pageSize = options.itemsPerPage;
      this.page = options.page;
      this.getBooks();
    },
    openModalCreate() {
      this.ModalTitle = "Adicionar Livro";
      this.dialog = true;
      this.$v.$reset();

      this.name = "";
      this.author = "";
      this.publisher = "";
      this.release = "";
      this.quantity = "";
    },
    openModalEdit(book) {
      this.ModalTitle = "Editar livro";
      this.dialog = true;
      this.$v.$reset();

      const selectedPublisher = this.publishers.find(
        (publisher) => publisher.id === book.publisher.id
      );
      this.bookId = book.id;
      this.name = book.name;
      this.author = book.author;
      this.publisher = selectedPublisher;
      this.release = book.release;
      this.quantity = book.quantity;
      this.rented = book.rented;
    },
    closeModal() {
      this.dialog = false;
    },
    confirm() {
      if (!this.nameExists) {
        this.$v.$touch();
        if (!this.$v.$error) {
          if (this.ModalTitle === "Adicionar Livro") {
            const selectedPublisher = this.publishers.find(
              (publisher) => publisher.name === this.publisher
            );
            const createdBook = {
              name: this.name,
              author: this.author,
              publisherId: selectedPublisher.id,
              release: this.release,
              quantity: this.quantity,
              rented: "0",
            };
            Book.create(createdBook)
              .then(() => {
                Swal.fire({
                  icon: "success",
                  title: "Livro adicionado com êxito!",
                  showConfirmButton: false,
                  timer: 3500,
                });
                this.closeModal();
                this.getBooks();
              })
              .catch((error) => {
                console.error("Erro ao adicionar o livro:", error);
                Swal.fire({
                  icon: "error",
                  title: "Erro ao adicionar o livro.",
                  text: error.response.data.message,
                  showConfirmButton: false,
                  timer: 3500,
                });
              });
          } else {
            const selectedPublisher = this.publishers.find(
              (publisher) => publisher.name === this.publisher
            );
            const updatedBook = {
              id: this.bookId,
              name: this.name,
              author: this.author,
              publisherId: selectedPublisher.id,
              release: this.release,
              quantity: this.quantity,
              rented: this.rented,
            };
            Book.update(updatedBook)
              .then(() => {
                Swal.fire({
                  icon: "success",
                  title: "Livro atualizado com êxito!",
                  showConfirmButton: false,
                  timer: 3500,
                });
                this.closeModal();
                this.getBooks();
              })
              .catch((error) => {
                console.error("Erro ao atualizar livro:", error);
                Swal.fire({
                  icon: "error",
                  title: "Erro ao atualizar o livro.",
                  text: error.response.data.message,
                  showConfirmButton: false,
                  timer: 3500,
                });
              });
          }
        }
      }
    },
    openModalDelete(book) {
      this.bookId = book.id;
      this.name = book.name;
      this.author = book.author;
      this.publisher = book.publisher;
      this.release = book.release;
      this.quantity = book.quantity;
      this.dialogDelete = true;
    },
    closeModalDelete() {
      this.dialogDelete = false;
    },
    confirmDelete() {
      const deletedBook = {
        id: this.bookId,
        name: this.name,
        author: this.author,
        publisher: this.publisher,
        release: this.release,
      };
      Book.delete(deletedBook)
        .then((response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Livro deletado com êxito!",
              showConfirmButton: false,
              timer: 3500,
            });
            this.closeModalDelete();
            this.getBooks();
          }
        })
        .catch((error) => {
          console.error("Erro ao deletar o livro:", error);
          Swal.fire({
            icon: "error",
            title: "Erro ao deletar o livro.",
            text: error.response.data.message,
            showConfirmButton: false,
            timer: 3500,
          });
          this.closeModalDelete();
        });
    },
  },
};
</script>
