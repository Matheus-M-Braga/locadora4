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
            'items-per-page-options': [7, 15, 25, 50, this.totalItems],
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
              <v-form ref="form" @sumbit.prevent="confirm">
                <v-col cols="12">
                  <v-text-field
                    v-model="name"
                    :counter="50"
                    label="Nome"
                    required
                    :rules="stringRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="author"
                    :counter="50"
                    label="Autor"
                    required
                    :rules="stringRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-autocomplete
                    v-model="publisher"
                    :items="publishers"
                    item-value="id"
                    item-text="name"
                    label="Editora"
                    required
                    :rules="publisherRules"
                  ></v-autocomplete>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="release"
                    :counter="4"
                    :step="1"
                    label="Lançamento"
                    required
                    type="number"
                    :rules="releaseRules"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="quantity"
                    :counter="4"
                    :step="1"
                    label="Estoque"
                    required
                    type="number"
                    :rules="quantityRules"
                  ></v-text-field>
                </v-col>
              </v-form>
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
import TableTop from "@/components/TableTop.vue";

export default {
  components: {
    TableTop,
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
      publisher: null,
      release: null,
      quantity: null,
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
      stringRules: [
        (v) => !!v || "Preencha este campo",
        (v) => (v && v.length >= 3) || "Mínimo 3 caracteres",
        (v) => (v && v.length <= 50) || "Máximo 50 caracteres",
      ],
      publisherRules: [(v) => !!v || "Preencha este campo"],
      releaseRules: [
        (v) => !!v || "Preencha este campo",
        (v) => (v && v.length <= 4) || "Máximo 4 caracteres",
        (v) =>
          (v && v <= new Date().getFullYear()) ||
          `Não é possível ser posterior a ${new Date().getFullYear()}`,
      ],
      quantityRules: [
        (v) => !!v || "Preencha este campo",
        (v) => v >= 0 || "Estoque deve ser maior que 0",
        (v) => (v && v.length <= 4) || "Máximo 4 caracteres",
      ],
    };
  },
  mounted() {
    this.getBooks();
    this.getPublishers();
  },
  methods: {
    updateSearch(newSearchValue) {
      this.search = newSearchValue;
      this.page = 1;
      this.getBooks();
    },
    async getBooks() {
      try {
        const response = await Book.list({
          PageNumber: this.page,
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
      this.$refs.form.resetValidation();

      this.name = "";
      this.author = "";
      this.publisher = null;
      this.release = "";
      this.quantity = "";
    },
    openModalEdit(book) {
      this.ModalTitle = "Editar livro";
      this.dialog = true;
      this.$refs.form.resetValidation();

      this.bookId = book.id;
      this.name = book.name;
      this.author = book.author;
      this.publisher = book.publisherId;
      this.release = book.release;
      this.quantity = book.quantity;
      this.rented = book.rented;
    },
    closeModal() {
      this.dialog = false;
    },
    async confirm() {
      if (this.$refs.form && typeof this.$refs.form.validate === "function") {
        const isValid = await this.$refs.form.validate();
        if (!isValid) {
          return;
        }
        if (this.ModalTitle === "Adicionar Livro") {
          const createdBook = {
            name: this.name,
            author: this.author,
            publisherId: this.publisher,
            release: this.release,
            quantity: this.quantity,
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
              this.getPublishers();
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
          const updatedBook = {
            id: this.bookId,
            name: this.name,
            author: this.author,
            publisherId: this.publisher,
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
              this.getPublishers();
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
    },
    openModalDelete(book) {
      this.bookId = book.id;
      this.dialogDelete = true;
    },
    closeModalDelete() {
      this.dialogDelete = false;
    },
    confirmDelete() {
      const deletedBook = {
        id: this.bookId,
      };
      Book.delete(deletedBook)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Livro deletado com êxito!",
            showConfirmButton: false,
            timer: 3500,
          });
          this.closeModalDelete();
          this.getBooks();
          this.getPublishers();
          this.page = 1;
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
