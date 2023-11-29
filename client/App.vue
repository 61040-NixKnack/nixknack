<script setup lang="ts">
import { useToastStore } from "@/stores/toast";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";
import { computed, onBeforeMount } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";

const currentRoute = useRoute();
const currentRouteName = computed(() => currentRoute.name);
const userStore = useUserStore();
const { isLoggedIn } = storeToRefs(userStore);
const { toast } = storeToRefs(useToastStore());

// Make sure to update the session before mounting the app in case the user is already logged in
onBeforeMount(async () => {
  try {
    await userStore.updateSession();
  } catch {
    // User is not logged in
  }
});
</script>

<template>
  <article v-if="toast !== null" class="toast" :class="toast.style">
    <p>{{ toast.message }}</p>
  </article>
  <RouterView class="content" />
  <nav v-show="currentRouteName != 'Login'">
    <RouterLink :to="{ name: 'Catalog' }">
      <div id="home-button" class="nav-target" :class="{ active_target: currentRouteName == 'Catalog' || currentRouteName == 'Item' }">
        <div class="target_overlay">
          <div class="material-symbols-outlined nav-target-icon">grid_view</div>
        </div>
      </div>
    </RouterLink>
    <RouterLink :to="{ name: 'Profile' }">
      <div id="music-player-button" class="nav-target" :class="{ active_target: currentRouteName == 'Profile' }">
        <div class="target_overlay">
          <div class="material-symbols-outlined nav-target-icon">account_circle</div>
        </div>
      </div>
    </RouterLink>
    <RouterLink :to="{ name: 'Tasks' }">
      <div id="messages-button" class="nav-target" :class="{ active_target: currentRouteName == 'Tasks' }">
        <div class="target_overlay">
          <div class="material-symbols-outlined nav-target-icon">assignment</div>
        </div>
      </div>
    </RouterLink>
  </nav>
</template>

<style scoped>
@import "./assets/toast.css";

.content {
  margin-bottom: 80px;
  /* background-color: var(--primary); */
}

nav {
  align-items: center;
  flex-direction: row;
  justify-content: space-around;

  background-color: lightgray;
  display: flex;

  position: fixed;
  bottom: 0;
  min-height: 52px;
  width: 100%;
  padding-top: 12px;
  padding-bottom: 16px;
  gap: 8px;

  background-color: var(--light-accent);
}

.nav-target-icon {
  width: 24px;
  height: 24px;
  line-height: 32px;
  color: var(--on-primary);
}

.nav-target:hover {
  cursor: pointer;
}

.target_overlay {
  width: 64px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-content: center;
  background-color: rgba(0, 0, 0, 0);
  border-radius: 16px;
}

.target_overlay:hover {
  background-color: rgba(0, 0, 0, 0.175);
}

.active_target {
  .target_overlay {
    background-color: var(--dark-accent);
  }

  .nav-target-icon {
    color: var(--on-primary);
  }

  .material-symbols-outlined {
    font-variation-settings: "FILL" 1;
  }
}

a {
  font-size: small;
  color: black;
  text-decoration: none;
}
</style>
