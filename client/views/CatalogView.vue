<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import SearchBarComponent from "@/components/SearchBar/SearchBarComponent.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Your KnickKnacks</h1>
    <SearchBarComponent />
    <img src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.vectorkhazana.com%2Fpiranha-plant-svg&psig=AOvVaw0V60ZMy5Yhvt-7Zh3ZR4TG&ust=1701468066443000&source=images&cd=vfe&opi=89978449&ved=0CBIQjRxqFwoTCKjUqM_c7IIDFQAAAAAdAAAAABAE">
    <button id="new-post-fab" class="material-symbols-outlined" @click="console.log('Add item button clicked')">add</button>
  </main>
</template>

<style scoped>
main {
  padding: 8px 36px;
}

h1 {
  text-align: left;
  color: var(--on-primary);
}

#new-post-fab {
  position: fixed;
  bottom: 80px;
  right: 0;

  border: none;
  background-color: var(--dark-accent);
  color: var(--on-primary);

  font-size: 24px;
  border-radius: 16px;
  width: 56px;
  height: 56px;
  margin: 0 16px 16px 0;
  cursor: pointer;
}
</style>
