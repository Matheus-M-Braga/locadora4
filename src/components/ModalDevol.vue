<template>
  <v-dialog v-model="internalDialogDevol" persistent max-width="480">
    <v-card dark class="modalDelete">
      <v-card-title class="d-flex justify-center">
        <span class="text-h5">Devolver Livro</span>
      </v-card-title>
      <v-card-text class="d-flex justify-center pb-3 pt-3">
        Tem certeza que deseja realizar a devolução do livro selecionado?
      </v-card-text>
      <v-card-actions class="d-flex justify-center">
        <v-btn color="red darken-1" text @click="closeModalDevol">
          Cancelar
        </v-btn>
        <v-btn color="green darken-1" text @click="confirmDevol">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script>
export default {
  props: {
    dialogDevol: Boolean,
  },
  data() {
    return {
      internalDialogDevol: this.dialogDevol,
    };
  },
  watch: {
    dialogDevol(newVal) {
      this.internalDialogDevol = newVal;
    },
  },
  methods: {
    closeModalDevol() {
      this.$emit("close-modal-devol");
    },
    confirmDevol() {
      this.$emit("confirm-devol");
    },
  },
};
</script>
