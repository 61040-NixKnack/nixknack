<script setup lang="ts">
import LoginForm from "@/components/Login/LoginForm.vue";
import RegisterForm from "@/components/Login/RegisterForm.vue";
import { fetchy } from "../utils/fetchy";

const init = async () => {
  try {
    await fetchy(`/api/init`, "POST");
  } catch {
    return;
  }
  console.log("Success");
};
</script>

<template>
  <main class="column">
    <h1>Please login or register!</h1>
    <LoginForm />
    <RegisterForm />
    <button @click="init">Init</button>
  </main>
</template>
