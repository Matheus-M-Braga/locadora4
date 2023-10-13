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
          :items="publishers"
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
                    v-model="city"
                    label="Cidade"
                    required
                    :error-messages="CityError"
                    @input="$v.city.$touch()"
                    @blur="$v.city.$touch()"
                  ></v-text-field>
                </v-col>
              </v-col>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red darken-1" text @click="closeModal">
                  Cancelar
                </v-btn>
                <v-btn color="blue darken-1" text @click="confirm">
                  Salvar
                </v-btn>
              </v-card-actions>
            </v-card-text>
          </v-card>
        </v-form>
      </v-dialog>
    </v-row>
    <!-- Modal delete -->
    <v-row justify="center">
      <v-dialog v-model="dialogDelete" persistent max-width="600px">
        <v-card dark>
          <v-card-title>
            <span class="text-h5">Excluir Editora</span>
          </v-card-title>
          <v-card-text>
            Tem certeza que deseja excluir a editora selecionada?
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
import Publisher from "@/services/publi";
import Swal from "sweetalert2";
import { validationMixin } from "vuelidate";
import { required } from "vuelidate/lib/validators";
import TableTop from "@/components/TableTop.vue";

export default {
  components: {
    TableTop,
  },
  mixins: [validationMixin],
  validations: {
    name: { required },
    city: { required },
  },
  data() {
    return {
      noDataText: "Nenhum registro encontrado",
      search: "",
      ModalTitle: "",
      PageTitle: "Editoras",
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
      OrderBy: "Id",
      OrderByDesc: false,
      page: 1,
      dialog: false,
      dialogDelete: false,
      publisherId: null,
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
        errors.push("Editora já cadastrada!");
      }
      return errors;
    },
    CityError() {
      const errors = [];
      if (!this.$v.city.$dirty) return errors;
      !this.$v.city.required && errors.push("Informe a cidade.");
      return errors;
    },
  },
  mounted() {
    this.getPublishers();
  },
  methods: {
    updateSearch(newSearchValue) {
      this.search = newSearchValue;
      this.getPublishers();
    },
    // Search
    filter(value, search) {
      return (
        value != null &&
        search != null &&
        (typeof value === "string" || typeof value === "number") &&
        value.toString().toLowerCase().indexOf(search.toLowerCase()) !== -1
      );
    },
    CheckNames() {
      return this.publishers.some((publisher) => publisher.name == this.name);
    },
    validateName() {
      this.nameExists = this.CheckNames(this.name);
      if (this.nameExists) {
        this.$v.name.$touch();
      }
    },
    // Listar
    async getPublishers() {
      this.loadingTable = true;
      try {
        const [publisherResponse] = await Promise.all([
          Publisher.list({
            Page: this.page,
            PageSize: this.pageSize,
            OrderBy: this.OrderBy,
            OrderByDesc: this.OrderByDesc,
            FilterValue: this.search,
          }),
        ]);
        const data = publisherResponse.data;
        this.publishers = data.data.map((publisher) => ({
          id: publisher.id,
          name: publisher.name,
          city: publisher.city,
        }));

        this.totalItems = data.totalRegisters;
      } catch (error) {
        console.error("Erro ao buscar informações:", error);
      } finally {
        this.loadingTable = false;
      }
    },
    handleOptionsUpdate(options) {
      console.log(options);
      const sortByMapping = {
        id: "Id",
        name: "Name",
        city: "City",
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
      this.getPublishers();
    },
    openModalCreate() {
      this.ModalTitle = "Adicionar Editora";
      this.dialog = true;
      this.$v.$reset();

      this.name = "";
      this.city = "";
    },
    openModalEdit(publisher) {
      this.ModalTitle = "Editar Editora";
      this.dialog = true;
      this.$v.$reset();

      this.publisherId = publisher.id;
      this.name = publisher.name;
      this.city = publisher.city;
    },
    closeModal() {
      this.dialog = false;
    },
    async confirm() {
      if (!this.nameExists) {
        this.$v.$touch();
        if (!this.$v.$error) {
          // Identifica qual modal foi ativado (Add)
          if (this.ModalTitle === "Adicionar Editora") {
            const newpublisher = {
              name: this.name,
              city: this.city,
            };
            Publisher.create(newpublisher)
              .then((response) => {
                this.publishers.push({ id: response.data.id, ...newpublisher });
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
                  text: error.response.data.error,
                  showConfirmButton: false,
                  timer: 3500,
                });
              });
          }
          // Caso contrário, edita =)
          else {
            const editedpublisher = {
              id: this.publisherId,
              name: this.name,
              city: this.city,
            };
            Publisher.update(editedpublisher)
              .then(() => {
                this.publishers = this.publishers.map((publisher) => {
                  if (publisher.id === editedpublisher.id) {
                    return editedpublisher;
                  } else {
                    return publisher;
                  }
                });
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
      }
    },
    // Excluir
    openModalDelete(publisher) {
      this.publisherId = publisher.id;
      this.name = publisher.name;
      this.city = publisher.city;
      this.dialogDelete = true;
    },
    closeModalDelete() {
      this.dialogDelete = false;
    },
    confirmDelete() {
      const deletedpublisher = {
        id: this.publisherId,
        name: this.name,
        city: this.city,
      };
      Publisher.delete(deletedpublisher)
        .then((response) => {
          if (response.status === 200) {
            Swal.fire({
              icon: "success",
              title: "Editora deletada com êxito!",
              showConfirmButton: false,
              timer: 3500,
            });
            this.getPublishers();
          } else {
            Swal.fire({
              icon: "error",
              title: "Erro ao deletar editora.",
              showConfirmButton: false,
              timer: 3500,
            });
          }
        })
        .catch((e) => {
          console.error("Erro ao deletar a editora:", e);
          console.log(e.response);
          Swal.fire({
            icon: "error",
            title: "Erro ao deletar editora.",
            text: e.response.data.message,
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
