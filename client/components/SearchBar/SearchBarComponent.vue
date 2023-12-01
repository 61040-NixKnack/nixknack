<script setup lang="ts">
import { ref } from "vue";

const query = ref("");
const emit = defineEmits(["getItemsByQuery"]);
</script>

<template>
  <form class="pure-form">
    <button class="search-button material-symbols-outlined">search</button>
    <input id="author" type="text" placeholder="Search..." />
    <button class="search-button material-symbols-outlined">filter_list</button>
  </form>
</template>

<style scoped>
form {
  min-width: 360px;
  width: 100%;
  max-width: 720px;
  height: 56px;
  padding: 0 16px;
  background-color: var(--light-accent);
  border-radius: 56px;
  gap: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

input {
  border: 0px solid;
  border-style: none;
  background-color: transparent;
  color: var(--on-primary);
  width: 100%;
  cursor: pointer;
}

.search-button {
  border: transparent;
  background-color: transparent;
  color: var(--on-primary);
  font-size: 24px;
  padding: 0;
  margin: 0;
  cursor: pointer;
}
</style>
