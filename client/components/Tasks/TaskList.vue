<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../../utils/fetchy";

// Assuming items to get rid of today are stored in userPlan.value[0]
const userPlan = ref([["item", "item2"], ["item3"], ["item4", "item5", "item6"], [], ["item7"], [], []]);
const dateName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const offset = new Date().getDay();

onBeforeMount(async () => {
  // Get user plan from server\
  console.log(await fetchy("/api/plans", "GET"));
});
</script>

<template>
  <main>
    <section v-for="taskInd in 7" :key="taskInd" class="secondary-div">
      <h2>{{ dateName[(taskInd - 1 + offset) % 7] }}</h2>
      <div v-if="userPlan[taskInd - 1].length > 0">
        <div v-for="item in userPlan[taskInd - 1]" :key="item">
          <p>• <b>Task:</b> Discard {{ item }}</p>
        </div>
      </div>
      <div v-else>
        <p>No tasks!</p>
      </div>
    </section>
  </main>
</template>

<style scoped>
main {
  display: flex;
  flex-direction: column;
  gap: 32px;
  width: 512px;
  margin: auto;
}

.secondary-div {
  background-color: var(--secondary);
  color: var(--on-secondary);
  border-radius: 10px;
  border: solid var(--secondary) 20px;
  border-top: 10px;
  border-bottom: 10px;
}
</style>
