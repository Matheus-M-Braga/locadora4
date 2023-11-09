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
          :items="users"
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
                      label="Nome"
                      :counter="50"
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
                  <v-col cols="12">
                    <v-text-field
                      v-model="address"
                      :counter="50"
                      label="Endereço"
                      required
                      :rules="stringRules"
                    ></v-text-field>
                  </v-col>
                  <v-col cols="12">
                    <v-text-field
                      v-model="email"
                      :counter="50"
                      label="Email"
                      type="email"
                      required
                      :rules="emailRules"
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
              <v-btn color="blue darken-1" text @click="confirm">
                Salvar
              </v-btn>
            </v-card-actions>
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
import User from "@/services/user";
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
      PageTitle: "Usuários",
      EntityName: "Usuário",
      headers: [
        { text: "ID", value: "id" },
        { text: "Nome", value: "name" },
        { text: "Cidade", value: "city" },
        { text: "Endereço", value: "address" },
        { text: "Email", value: "email" },
        { text: "Ações", value: "acoes", sortable: false },
      ],
      headerprops: {
        sortByText: "Ordenar Por",
      },
      users: [],
      id: 0,
      name: "",
      address: "",
      city: "",
      email: "",
      totalItems: 0,
      pageSize: 0,
      OrderByProperty: "Id",
      OrderByDesc: false,
      page: 1,
      dialog: false,
      dialogDelete: false,
      userId: null,
      emailExists: false,
      loadingTable: true,
      stringRules: [
        (v) => !!v || "Preencha este campo",
        (v) => (v && v.length >= 3) || "Mínimo 3 caracteres",
        (v) => (v && v.length <= 50) || "Máximo 50 caracteres",
      ],
      emailRules: [
        (v) => !!v || "Preencha este campo",
        (v) => (v && v.length >= 3) || "Mínimo 3 caracteres",
        (v) => (v && v.length <= 50) || "Máximo 50 caracteres",
        (v) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || "Informe um email válido",
      ],
    };
  },
  mounted() {
    this.getUsers();
  },
  methods: {
    updateSearch(newSearchValue) {
      this.search = newSearchValue;
      this.page = 1;
      this.getUsers();
    },
    async getUsers() {
      try {
        const response = await User.list({
          PageNumber: this.page,
          PageSize: this.pageSize,
          OrderByProperty: this.OrderByProperty,
          OrderByDesc: this.OrderByDesc,
          FilterValue: this.search,
        });
        this.users = response.data.data;
        this.totalItems = response.data.totalRegisters;
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
        if (error.response.status == 404) {
          this.users = [];
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
        address: "Address",
        email: "Email",
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
      this.getUsers();
    },
    openModalCreate() {
      this.ModalTitle = "Adicionar Usuário";
      this.dialog = true;
      this.$refs.form.resetValidation();

      this.name = "";
      this.address = "";
      this.city = "";
      this.email = "";
    },
    openModalEdit(user) {
      this.ModalTitle = "Editar Usuário";
      this.dialog = true;

      this.userId = user.id;
      this.name = user.name;
      this.address = user.address;
      this.city = user.city;
      this.email = user.email;

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
        if (this.ModalTitle === "Adicionar Usuário") {
          const createdUser = {
            name: this.name,
            address: this.address,
            city: this.city,
            email: this.email,
          };
          User.create(createdUser)
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Usuário adicionado com êxito!",
                showConfirmButton: false,
                timer: 3500,
              });
              this.getUsers();
              this.closeModal();
            })
            .catch((error) => {
              console.error("Erro ao adicionar o usuario:", error);
              Swal.fire({
                icon: "error",
                title: "Erro ao adicionar usuário.",
                text: error.response.data.message,
                showConfirmButton: false,
                timer: 3500,
              });
            });
        } else {
          const updatedUser = {
            id: this.userId,
            name: this.name,
            address: this.address,
            city: this.city,
            email: this.email,
          };
          User.update(updatedUser)
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Usuário atualizado com êxito!",
                showConfirmButton: false,
                timer: 3500,
              });
              this.getUsers();
              this.closeModal();
            })
            .catch((error) => {
              console.error("Erro ao atualizar usuário:", error);
              Swal.fire({
                icon: "success",
                title: "Erro ao atualizar usuário.",
                text: error.response.data.message,
                showConfirmButton: false,
                timer: 3500,
              });
              this.closeModal();
            });
        }
      }
    },
    openModalDelete(user) {
      this.userId = user.id;
      this.dialogDelete = true;
    },
    closeModalDelete() {
      this.dialogDelete = false;
    },
    confirmDelete() {
      const deletedUser = {
        id: this.userId,
      };
      User.delete(deletedUser)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Usuário deletado com êxito!",
            showConfirmButton: false,
            timer: 3500,
          });
          this.getUsers();
          this.closeModalDelete();
          this.page = 1;
        })
        .catch((error) => {
          console.error("Erro ao deletar a usuário:", error);
          Swal.fire({
            icon: "error",
            title: "Erro ao deletar usuário.",
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
