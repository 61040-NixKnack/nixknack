<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";
import { fetchy } from "../utils/fetchy";

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

const points = ref(0);
const achievementReady = ref(false);
const achievementData = ref();

onBeforeMount(async () => {
  points.value = await fetchy("api/points", "GET");
  achievementData.value = await fetchy("/api/achievements", "GET");
  achievementReady.value = true;
});
</script>

<template>
  <main class="column" id="profile-main">
    <section>
      <h2>{{ currentUsername }}'s Profile</h2>
      <h3>Total Exp: {{ points }}</h3>
    </section>
    <section>
      <h2>Achievements</h2>
      <div id="all-achievements">
        <div class="achievement secondary-div">
          <p>
            <b>Level {{ achievementReady ? achievementData[0]["exp"] : 0 }}</b>
          </p>
          <p>To next: {{ achievementReady ? achievementData[2]["exp"][1] - achievementData[1]["exp"] : 0 }}</p>
        </div>
        <div class="achievement secondary-div">
          <p>
            <b>Items Added {{ achievementReady ? achievementData[0]["added"] : 0 }}</b>
          </p>
          <p>To Next: {{ achievementReady ? achievementData[2]["added"][1] - achievementData[1]["added"] : 0 }}</p>
        </div>
        <div class="achievement secondary-div">
          <p>
            <b>Items Discarded {{ achievementReady ? achievementData[0]["discarded"] : 0 }}</b>
          </p>
          <p>To Next: {{ achievementReady ? achievementData[2]["discarded"][1] - achievementData[1]["discarded"] : 0 }}</p>
        </div>
        <div class="achievement secondary-div">
          <p>
            <b>Task Completer {{ achievementReady ? achievementData[0]["tasks"] : 0 }}</b>
          </p>
          <p>To Next: {{ achievementReady ? achievementData[2]["tasks"][1] - achievementData[1]["tasks"] : 0 }}</p>
        </div>
      </div>
    </section>
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
h3 {
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
  cursor: pointer;
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
  cursor: pointer;
}

#all-achievements {
  display: flex;
  flex-direction: row;
  gap: 10px;
}
</style>
