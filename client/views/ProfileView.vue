<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";

const { currentUsername } = storeToRefs(useUserStore());
const { logoutUser, deleteUser } = useUserStore();

async function logout() {
  await logoutUser();
  await router.push({ name: "Login" });
}

async function delete_() {
  await deleteUser();
  await router.push({ name: "Login" });
}
</script>

<template>
  <main class="column" id="profile-main">
    <section>
      <h2>{{ currentUsername }}'s Profile</h2>
      <!-- <h3>Points:</h3> -->
    </section>
    <!-- <section>
      <h2>Achievements</h2>
      <div class="secondary-div">
        <img src="@/assets/images/noImage.png" />
      </div>
    </section> -->
    <section>
      <h2>Settings</h2>
      <div class="secondary-div">
        <UpdateUserForm />
        <button id="logout-button" @click="logout">Logout</button>
        <button id="delete-button" @click="delete_">Delete User</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
#profile-main {
  margin-bottom: 88px;
}
h2 {
  font-size: 32px;
  color: var(--on-primary);
}
.secondary-div {
  background-color: var(--secondary);
  color: var(--on-secondary);
  border-radius: 10px;
  border: solid var(--secondary) 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

#logout-button {
  background-color: var(--dark-accent);
  border: 10px var(--dark-accent) solid;
  border-radius: 33px;
  font-size: 16px;
  font-weight: bold;
  padding-left: 15px;
  padding-right: 15px;
  color: var(--on-primary);
  width: fit-content;
}

#delete-button {
  border: 10px #ff5252 solid;
  border-radius: 33px;
  font-size: 16px;
  font-weight: bold;
  padding-left: 15px;
  padding-right: 15px;
  background-color: #ff5252;
  color: white;
  width: fit-content;
}
</style>
