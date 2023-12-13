<script setup lang="ts">
import router from "@/router";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import UpdateUserForm from "../components/Setting/UpdateUserForm.vue";
import { fetchy } from "../utils/fetchy";
import "@material/web/progress/circular-progress.js";
import "@material/web/progress/linear-progress.js";

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
  <main class="column" id="profile-main" v-if="achievementReady">
    <section>
      <h2>{{ currentUsername }}'s Profile</h2>
      <h3>Total Exp: {{ points }}</h3>
    </section>
    <section>
      <h2>Achievements</h2>
      <div id="all-achievements">
        <div class="achievement secondary-div">
          <p>
            <b>Level {{ achievementData[0]["exp"] }}</b>
          </p>
          <p>To next: {{ achievementData[2]["exp"][1] - achievementData[1]["exp"] }}</p>
          <md-linear-progress :value="(achievementData[1]['exp'] - achievementData[2]['exp'][0]) / (achievementData[2]['exp'][1] - achievementData[2]['exp'][0])"></md-linear-progress>
        </div>
        <div class="achievement secondary-div">
          <p>
            <b>Items Added {{ achievementData[0]["added"] }}</b>
          </p>
          <p>To Next: {{ achievementData[2]["added"][1] - achievementData[1]["added"] }}</p>
          <md-linear-progress :value="(achievementData[1]['added'] - achievementData[2]['added'][0]) / (achievementData[2]['added'][1] - achievementData[2]['added'][0])"></md-linear-progress>
        </div>
        <div class="achievement secondary-div">
          <p>
            <b>Items Discarded {{ achievementData[0]["discarded"] }}</b>
          </p>
          <p>To Next: {{ achievementData[2]["discarded"][1] - achievementData[1]["discarded"] }}</p>
          <md-linear-progress
            :value="(achievementData[1]['discarded'] - achievementData[2]['discarded'][0]) / (achievementData[2]['discarded'][1] - achievementData[2]['discarded'][0])"
          ></md-linear-progress>
        </div>
        <div class="achievement secondary-div">
          <p>
            <b>Task Completer {{ achievementData[0]["tasks"] }}</b>
          </p>
          <p>To Next: {{ achievementData[2]["tasks"][1] - achievementData[1]["tasks"] }}</p>
          <md-linear-progress :value="(achievementData[1]['tasks'] - achievementData[2]['tasks'][0]) / (achievementData[2]['tasks'][1] - achievementData[2]['tasks'][0])"></md-linear-progress>
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
  <div v-else>
    <md-circular-progress indeterminate></md-circular-progress>
  </div>
</template>

<style scoped>
main {
  --md-sys-color-primary: var(--dark-accent);
  --md-linear-progress-track-height: 8px;
  --md-linear-progress-track-shape: 8px;
  --md-linear-progress-active-indicator-height: 8px;
}

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

md-circular-progress {
  position: fixed;
  top: 50%;
  left: 50%;
}
</style>
