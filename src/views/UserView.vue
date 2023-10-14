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
          :custom-filter="filter"
          :no-results-text="noDataText"
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
        <v-form ref form>
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
                    @input="$v.name.$touch()"
                    @blur="$v.name.$touch()"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="city"
                    label="Cidade"
                    required
                    :error-messages="CityError"
                    @input="$v.city.$touch()"
                    @blur="$v.city.$touch()"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="address"
                    label="Endereço"
                    required
                    :error-messages="AddressError"
                    @input="$v.address.$touch()"
                    @blur="$v.address.$touch()"
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="email"
                    :counter="50"
                    label="Email"
                    type="email"
                    required
                    :error-messages="EmailError"
                    @input="validateEmail()"
                    @blur="$v.email.$touch()"
                  ></v-text-field>
                </v-col>
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
    <!-- modal delete -->
    <v-row justify="center">
      <v-dialog v-model="dialogDelete" persistent max-width="600px">
        <v-card dark>
          <v-card-title>
            <span class="text-h5">Excluir Usuário</span>
          </v-card-title>
          <v-card-text>
            Tem certeza que deseja excluir o usuário selecionado?
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
import User from "@/services/user";
import Swal from "sweetalert2";
import { validationMixin } from "vuelidate";
import { required, maxLength, email } from "vuelidate/lib/validators";
import TableTop from "@/components/TableTop";

export default {
  components: {
    TableTop,
  },

  mixins: [validationMixin],
  validations: {
    name: { required },
    address: { required },
    city: { required },
    email: { required, email, maxLength: maxLength(50) },
  },
  data() {
    return {
      noDataText: "Nenhum registro encontrado",
      search: "",
      ModalTitle: "",
      PageTitle: "Usuários",
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
      OrderBy: "Id",
      OrderByDesc: false,
      page: 1,
      dialog: false,
      dialogDelete: false,
      userId: null,
      emailExists: false,
      loadingTable: false,
    };
  },
  computed: {
    // validacao
    NameError() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.required && errors.push("Informe o nome.");
      return errors;
    },
    AddressError() {
      const errors = [];
      if (!this.$v.address.$dirty) return errors;
      !this.$v.address.required && errors.push("Informe o endereco.");
      return errors;
    },
    CityError() {
      const errors = [];
      if (!this.$v.city.$dirty) return errors;
      !this.$v.city.required && errors.push("Informe a cidade.");
      return errors;
    },
    EmailError() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      !this.$v.email.maxLength && errors.psuh("O limite é de 50 caracteres.");
      !this.$v.email.email && errors.push("Informe um e-mail válido.");
      !this.$v.email.required && errors.push("Informe o e-mail.");
      if (this.emailExists) {
        errors.push("Este e-mail já existe no sistema.");
      }
      return errors;
    },
  },
  mounted() {
    this.getUsers();
  },
  methods: {
    updateSearch(newSearchValue) {
      this.search = newSearchValue;
      this.getUsers();
    },
    filter(value, search) {
      return (
        value != null &&
        search != null &&
        (typeof value === "string" || typeof value === "number") &&
        value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
      );
    },
    CheckEmails() {
      return this.users.some((user) => user.email == this.email);
    },
    validateEmail() {
      this.emailExists = this.CheckEmails(this.email);
      if (this.emailExists) {
        this.$v.email.$touch();
      }
    },
    async getUsers() {
      this.loadingTable = true;
      try {
        const [usersResponse] = await Promise.all([
          User.list({
            Page: this.page,
            PageSize: this.pageSize,
            OrderBy: this.OrderBy,
            OrderByDesc: this.OrderByDesc,
            FilterValue: this.search,
          }),
        ]);
        const data = usersResponse.data;
        this.users = data.data.map((user) => ({
          id: user.id,
          name: user.name,
          city: user.city,
          address: user.address,
          email: user.email,
        }));
        this.totalItems = data.totalRegisters;
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
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
        email: "Email"
      };
      if (options.sortBy[0] || options.sortDesc[0]) {
        this.OrderBy = sortByMapping[options.sortBy[0].toLowerCase()];
        this.OrderByDesc = options.sortDesc[0];
      } else {
        this.OrderBy = "Id";
        this.OrderByDesc = false;
      }
      this.pageSize = options.itemsPerPage;
      this.page = options.page;
      this.getUsers();  
    },
    openModalCreate() {
      this.ModalTitle = "Adicionar Usuário";
      this.dialog = true;
      this.$v.$reset();

      this.name = "";
      this.address = "";
      this.city = "";
      this.email = "";
    },
    openModalEdit(user) {
      this.ModalTitle = "Editar Usuário";
      this.dialog = true;
      this.$v.$reset();

      this.userId = user.id;
      this.name = user.name;
      this.address = user.address;
      this.city = user.city;
      this.email = user.email;
    },
    closeModal() {
      this.dialog = false;
    },
    confirm() {
      if (!this.emailExists) {
        this.$v.$touch();
        if (!this.$v.$error) {
          if (this.ModalTitle === "Adicionar Usuário") {
            const newuser = {
              name: this.name,
              address: this.address,
              city: this.city,
              email: this.email,
            };
            User.create(newuser)
              .then((response) => {
                this.users.push({ id: response.data.id, ...newuser });
                Swal.fire({
                  icon: "success",
                  title: "Usuário adicionado com êxito!",
                  showConfirmButton: false,
                  timer: 3500,
                });
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
          }
          else {
            const editeduser = {
              id: this.userId,
              name: this.name,
              address: this.address,
              city: this.city,
              email: this.email,
            };
            User.update(editeduser)
              .then(() => {
                this.users = this.users.map((user) => {
                  if (user.id === editeduser.id) {
                    return editeduser;
                  } else {
                    return user;
                  }
                });
                this.dialogEdit = false;
                Swal.fire({
                  icon: "success",
                  title: "Usuário atualizado com êxito!",
                  showConfirmButton: false,
                  timer: 3500,
                });
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
      }
    },
    openModalDelete(user) {
      this.userId = user.id;
      this.name = user.name;
      this.address = user.address;
      this.city = user.city;
      this.email = user.email;
      this.dialogDelete = true;
    },
    closeModalDelete() {
      this.dialogDelete = false;
    },
    confirmDelete() {
      const deleteduser = {
        id: this.userId,
        name: this.name,
        address: this.address,
        city: this.city,
        email: this.email,
      };
      User.delete(deleteduser)
        .then((response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Usuário deletado com êxito!",
              showConfirmButton: false,
              timer: 3500,
            });
            this.getUsers();
            this.closeModalDelete();
          } else {
            Swal.fire({
              icon: "error",
              title: "Erro ao deletar usuário.",
              showConfirmButton: false,
              timer: 3500,
            });
          }
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
