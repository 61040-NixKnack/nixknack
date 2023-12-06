<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import TaskList from "@/components/Tasks/TaskList.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Your Plan</h1>
    <TaskList />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
  color: var(--on-primary);
}
</style>
