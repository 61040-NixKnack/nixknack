<script setup lang="ts">
import { useUserStore } from "@/stores/user";
import { ref } from "vue";

let username = ref("");
let password = ref("");

const { updateUser, updateSession } = useUserStore();

async function updateUsername() {
  await updateUser({ username: username.value });
  await updateSession();
  username.value = "";
}

async function updatePassword() {
  await updateUser({ password: password.value });
  await updateSession();
  password.value = "";
}
</script>

<template>
  <main>
    <form @submit.prevent="updateUsername">
      <fieldset>
        <legend>Change Username</legend>
        <div>
          <input type="text" placeholder="New username" v-model="username" required />
          <button type="submit">Update</button>
        </div>
      </fieldset>
    </form>

    <form @submit.prevent="updatePassword">
      <fieldset>
        <legend>Change Password</legend>
        <div>
          <input type="password" placeholder="New password" v-model="password" required />
          <button type="submit">Update</button>
        </div>
      </fieldset>
    </form>
  </main>
</template>

<style scoped>
main {
  margin: 0px;
  width: 35vw;
  display: flex;
  flex-direction: column;
  gap: 30px;
}
fieldset {
  border: none;
  width: 100%;
  padding: 0;
}
legend {
  color: var(--on-secondary);
  font-weight: bold;
  font-size: 20px;
}
button {
  background-color: var(--dark-accent);
  border: 10px var(--dark-accent) solid;
  border-radius: 33px;
  font-size: 16px;
  font-weight: bold;
  padding-left: 15px;
  padding-right: 15px;
  color: var(--on-primary);
  cursor: pointer;
}
div {
  margin-top: 8px;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
input {
  padding: 8px;
}
</style>
