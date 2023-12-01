<script setup lang="ts">
// import { ref } from "vue";

const props = defineProps(["itemID", "itemUrl", "itemName"]);
</script>

<template>
  <div class="tile">
    <img class="item-image" :src="props.itemUrl" />
    <div class="item-name">{{ props.itemName }}</div>
  </div>
</template>

<style scoped>
.tile {
  background-color: var(--secondary);
  color: var(--on-secondary);

  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;

  --width: 40%;
  width: var(--width);
  height: calc(var(--width) * 1.33);

  max-width: 200px;
  max-height: 250px;
  border-radius: 28px;
  padding: 16px;
}

.item-image {
  width: 80%;
  height: 80%;

  max-width: 300px;
  max-height: 300px;
  /* margin: 16px; */
  border-radius: 28px;

  object-fit: contain;
}

.item-name {
  font-size: 20px;
  font-weight: bold;
  /* margin: 16px; */
}
</style>
