<script setup>
import HelloWorld from './components/HelloWorld.vue'
import TheWelcome from './components/TheWelcome.vue'
import FlightView from "@/views/FlightView.vue";
import {ref} from 'vue';
</script>

<template>
  <!--<header>
    <img alt="Plane logo" class="logo" src="./assets/plane.png" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="Plan a plane!" />
    </div>
  </header>-->

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
