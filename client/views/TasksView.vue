<script setup lang="ts">
import TaskList from "@/components/Tasks/TaskList.vue";
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
