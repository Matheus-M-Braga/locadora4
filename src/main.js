import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import 'sweetalert2/dist/sweetalert2.min.css';
import Swal from 'sweetalert2';
import Vuelidate from "vuelidate";

Vue.config.productionTip = false;
Vue.use(Vuelidate)
Vue.prototype.$swal = Swal; 

new Vue({
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");