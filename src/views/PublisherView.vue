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
          :loading-text="'Carregando dados...'"
          :headers="headers"
          :header-props="headerprops"
          :items="publishers"
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
    <!-- Modal -->
    <v-row justify="center">
      <v-dialog v-model="dialog" persistent max-width="600px">
        <v-form ref form>
          <v-card dark>
            <v-card-title>
              <span class="text-h5">{{ ModalTitle }}</span>
            </v-card-title>
            <v-card-text>
              <v-col>
                <v-form ref="form" @submit.prevent="confirm">
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
                      v-model="city"
                      :counter="50"
                      label="Cidade"
                      required
                      :rules="stringRules"
                    ></v-text-field>
                  </v-col>
                </v-form>
              </v-col>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="closeModal">
                  Cancelar
                </v-btn>
                <v-btn color="green darken-1" text @click="confirm">
                  Salvar
                </v-btn>
              </v-card-actions>
            </v-card-text>
          </v-card>
        </v-form>
      </v-dialog>
    </v-row>
    <ModalDelete
      :dialogDelete="dialogDelete"
      @close-modal-delete="closeModalDelete"
      @confirm-delete="confirmDelete"
      :EntityName="EntityName"
    />
  </div>
</template>

<script>
import Publisher from "@/services/publisher";
import Swal from "sweetalert2";
import TableTop from "@/components/TableTop";
import ModalDelete from "@/components/ModalDelete";

export default {
  components: {
    TableTop,
    ModalDelete,
  },

  data() {
    return {
      noDataText: "Nenhum registro encontrado",
      search: "",
      ModalTitle: "",
      PageTitle: "Editoras",
      EntityName: "Editora",
      headers: [
        { text: "ID", value: "id" },
        { text: "Nome", value: "name" },
        { text: "Cidade", value: "city" },
        { text: "Ações", value: "acoes", sortable: false },
      ],
      headerprops: {
        sortByText: "Ordenar Por",
      },
      publishers: [],
      id: 0,
      name: "",
      city: "",
      totalItems: 0,
      pageSize: 0,
      OrderByProperty: "Id",
      OrderByDesc: false,
      page: 1,
      dialog: false,
      dialogDelete: false,
      publisherId: null,
      nameExists: false,
      loadingTable: true,
      stringRules: [
        (v) => !!v || "Preencha este campo",
        (v) => (v && v.length >= 3) || "Mínimo 3 caracteres",
        (v) => (v && v.length <= 50) || "Máximo 50 caracteres",
      ],
    };
  },
  mounted() {
    this.getPublishers();
  },
  methods: {
    updateSearch(newSearchValue) {
      this.search = newSearchValue;
      this.page = 1;
      this.getPublishers();
    },
    async getPublishers() {
      try {
        const response = await Publisher.list({
          PageNumber: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.OrderByProperty,
          OrderByDesc: this.OrderByDesc,
          FilterValue: this.search,
        });
        this.publishers = response.data.data;
        this.totalItems = response.data.totalRegisters;
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
        if (error.response.status == 404) {
          this.publishers = [];
        }
      } finally {
        this.loadingTable = false;
      }
    },
    handleOptionsUpdate(options) {
      const sortByMapping = {
        id: "Id",
        name: "Name",
        city: "City",
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
      this.getPublishers();
    },
    openModalCreate() {
      this.ModalTitle = "Adicionar Editora";
      this.dialog = true;
      this.$refs.form.resetValidation();

      this.name = "";
      this.city = "";
    },
    openModalEdit(publisher) {
      this.ModalTitle = "Editar Editora";
      this.dialog = true;

      this.publisherId = publisher.id;
      this.name = publisher.name;
      this.city = publisher.city;
      
      this.$refs.form.resetValidation();
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
        if (this.ModalTitle === "Adicionar Editora") {
          const createdPublisher = {
            name: this.name,
            city: this.city,
          };
          Publisher.create(createdPublisher)
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Editora adicionada com êxito!",
                showConfirmButton: false,
                timer: 3500,
              });
              this.closeModal();
              this.getPublishers();
            })
            .catch((error) => {
              console.error("Erro ao adicionar editora:", error);
              Swal.fire({
                icon: "error",
                title: "Erro ao adicionar editora.",
                text: error.response.data.message,
                showConfirmButton: false,
                timer: 3500,
              });
            });
        } else {
          const updatedPublisher = {
            id: this.publisherId,
            name: this.name,
            city: this.city,
          };
          Publisher.update(updatedPublisher)
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Editora atualizada com êxito!",
                showConfirmButton: false,
                timer: 3500,
              });
              this.closeModal();
              this.getPublishers();
            })
            .catch((error) => {
              console.error("Erro ao atualizar editora:", error);
              Swal.fire({
                icon: "error",
                title: "Erro ao atualizar editora.",
                text: error.response.data.message,
                showConfirmButton: false,
                timer: 3500,
              });
            });
        }
      }
    },
    openModalDelete(publisher) {
      this.publisherId = publisher.id;
      this.dialogDelete = true;
    },
    closeModalDelete() {
      this.dialogDelete = false;
    },
    confirmDelete() {
      const deletedPublisher = {
        id: this.publisherId,
      };
      Publisher.delete(deletedPublisher)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Editora deletada com êxito!",
            showConfirmButton: false,
            timer: 3500,
          });
          this.getPublishers();
          this.page = 1;
        })
        .catch((error) => {
          console.error("Erro ao deletar a editora:", error);
          Swal.fire({
            icon: "error",
            title: "Erro ao deletar editora.",
            text: error.response.data.message,
            showConfirmButton: false,
            timer: 3500,
          });
          this.closeModalDelete();
        });
      this.dialogDelete = false;
    },
  },
};
</script>
