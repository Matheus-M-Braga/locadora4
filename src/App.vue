<template>
  <v-app>
    <LayoutPage/>
    <router-view></router-view>
  </v-app>
</template>

<script>

import LayoutPage from './components/LayoutPage'

  export default {
    name: 'App',

    components: {
      LayoutPage,
    },
    computed: {
    }
  }
</script>
<style src="./assets/style.css"></style>