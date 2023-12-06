<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import PlanList from "@/components/Plan/PlanList.vue";

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
</script>

<template>
  <main>
    <h1>Your Plan</h1>
    <PlanList />
  </main>
</template>

<style scoped>
h1 {
  text-align: center;
}
</style>
