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
          mobile-breakpoint="890"
          :items="books"
          :items-per-page="7"
          class="elevation-1"
          item-key="id"
          :search="search"
          :custom-filter="filter"
          :no-results-text="noDataText"
          :footer-props="{
            'items-per-page-text': 'Registros por página',
            'items-per-page-options': [7, 10, 15, this.books.length],
          }"
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
                  :items="listPublishers"
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
import Publisher from "@/services/publi";
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
      listPublishers: [],
      name: "",
      author: "",
      publisher: "",
      release: 0,
      quantity: 0,
      rented: 0,
      dialog: false,
      dialogDelete: false,
      bookId: null,
      nameExists: false,
      loadingTable: false,
    };
  },
  computed: {
    // validacao
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
      !this.$v.release.required &&
        errors.push("Informe o ano de Lançamento.");
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
    this.listBooks();
  },
  methods: {
    updateSearch(newSearchValue) {
      this.search = newSearchValue;
    },
    // search
    filter(value, search) {
      return (
        value != null &&
        search != null &&
        (typeof value === "string" || typeof value === "number") &&
        value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
      );
    },
    // Listar
    async listBooks() {
      this.loadingTable = true;
      try {
        const [booksResponse, publishersResponse] = await Promise.all([
          Book.list(),
          Publisher.list(),
        ]);
        const data = booksResponse.data;
        const publishers_data = publishersResponse.data;

        this.listPublishers = publishers_data.data.map((publisher) => ({
          id: publisher.id,
          name: publisher.name,
        }));

        this.books = data.data.map((book) => ({
          id: book.id,
          name: book.name,
          author: book.author,
          publisher: book.publisher,
          release: book.release,
          quantity: book.quantity,
          rented: book.rented,
        }));
        // Ordem por id
        this.books.sort((a, b) => {
          if (a.id > b.id) {
            return 1;
          } else if (a.id < b.id) {
            return -1;
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
    CheckNames() {
      return this.books.some((book) => book.name == this.name);
    },
    validateName() {
      this.nameExists = this.CheckNames(this.name);
      if (this.nameExists) {
        this.$v.name.$touch();
      }
    },
    // Abrir o modal para adicionar
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
    // Abrir o modal para editar
    openModalEdit(book) {
      this.ModalTitle = "Editar livro";
      this.dialog = true;
      this.$v.$reset();

      const selectedPubli = this.listPublishers.find(
        (publisher) => publisher.name === book.publisher.name
      );
      this.bookId = book.id;
      this.name = book.name;
      this.author = book.author;
      this.publisher = selectedPubli;
      this.release = book.release;
      this.quantity = book.quantity;
      this.rented = book.rented;
    },
    // Fechar modal
    closeModal() {
      this.dialog = false;
    },
    // confirm
    confirm() {
      if (!this.nameExists) {
        this.$v.$touch();
        if (!this.$v.$error) {
          // Identifica qual modal foi ativado (Add)
          if (this.ModalTitle === "Adicionar Livro") {
            const selectedPubli = this.listPublishers.find(
              (publisher) => publisher.name === this.publisher
            );
            const newbook = {
              name: this.name,
              author: this.author,
              publisher: selectedPubli,
              release: this.release,
              quantity: this.quantity,
              rented: "0",
            };
            Book.create(newbook)
              .then((response) => {
                this.books.push({ id: response.data.id, ...newbook });
                Swal.fire({
                  icon: "success",
                  title: "Livro adicionado com êxito!",
                  showConfirmButton: false,
                  timer: 3500,
                });
                this.closeModal();
                this.listBooks();
              })
              .catch((error) => {
                console.error("Erro ao adicionar o livro:", error);
                Swal.fire({
                  icon: "error",
                  title: "Erro ao adicionar o livro.",
                  text: error.response.data.error,
                  showConfirmButton: false,
                  timer: 3500,
                });
              });
          }
          // Caso contrário, edita
          else {
            const selectedPubli = this.listPublishers.find(
              (publisher) => publisher.name === this.publisher
            );
            const editedbook = {
              id: this.bookId,
              name: this.name,
              author: this.author,
              publisher: selectedPubli ? { ...selectedPubli } : this.publisher,
              release: this.release,
              quantity: this.quantity,
              rented: this.rented,
            };
            Book.update(editedbook)
              .then(() => {
                this.books = this.books.map((book) => {
                  if (this.bookId === editedbook.id) {
                    return editedbook;
                  } else {
                    return book;
                  }
                });
                Swal.fire({
                  icon: "success",
                  title: "Livro atualizado com êxito!",
                  showConfirmButton: false,
                  timer: 3500,
                });
                this.closeModal();
                this.listBooks();
              })
              .catch((error) => {
                console.error("Erro ao atualizar livro:", error);
                Swal.fire({
                  icon: "error",
                  title: "Erro ao atualizar o livro.",
                  text: error.response.data.error,
                  showConfirmButton: false,
                  timer: 3500,
                });
              });
          }
        }
      }
    },
    // Excluir
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
      const deletedbook = {
        id: this.bookId,
        name: this.name,
        author: this.author,
        publisher: this.publisher,
        release: this.release,
      };
      Book.delete(deletedbook)
        .then((response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Livro deletado com êxito!",
              showConfirmButton: false,
              timer: 3500,
            });
            this.listBooks();
            this.closeModalDelete();
          }
        })
        .catch((e) => {
          console.error("Erro ao deletar o livro:", e);
          Swal.fire({
            icon: "error",
            title: "Erro ao deletar o livro.",
            text: e.response.data.error,
            showConfirmButton: false,
            timer: 3500,
          });
          this.closeModalDelete();
        });
    },
  },
};
</script>
