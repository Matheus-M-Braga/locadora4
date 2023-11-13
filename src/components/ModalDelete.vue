<template>
  <v-dialog v-model="internalDialogDelete" persistent max-width="480">
    <v-card dark class="modalDelete">
      <v-card-title class="d-flex justify-center">
        <span class="text-h5">Excluir {{ EntityName }}</span>
      </v-card-title>
      <v-card-text class="d-flex justify-center pb-3 pt-3">
        Tem certeza que deseja excluir o item selecionado?
      </v-card-text>
      <v-card-actions class="d-flex justify-center">
        <v-btn color="red darken-1" text @click="closeModalDelete">
          Cancelar
        </v-btn>
        <v-btn color="green darken-1" text @click="confirmDelete">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    dialogDelete: Boolean,
    EntityName: String,
  },
  data() {
    return {
      internalDialogDelete: this.dialogDelete,
    };
  },
  watch: {
    dialogDelete(newVal) {
      this.internalDialogDelete = newVal;
    },
  },
  methods: {
    closeModalDelete() {
      this.$emit("close-modal-delete");
    },
    confirmDelete() {
      this.$emit("confirm-delete");
    },
  },
};
</script>
