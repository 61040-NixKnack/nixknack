<script setup lang="ts">
//import { ref } from "vue";

defineProps(["itemID"]);
</script>

<template>
  <p>I'M HEERE NOW</p>
  <p>{{ itemID }}</p>
</template>

<style scoped>
form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}
</style>
