<script setup lang="ts">
const props = defineProps(["itemID", "itemUrl", "itemName"]);
</script>

<template>
  <div class="tile">
    <div v-if="itemUrl" class="img-div">
      <img class="item-image" :src="itemUrl" />
    </div>
    <div v-else class="img-div">
      <img class="item-image" src="@/assets/images/noImage.png" />
    </div>
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
  margin: 0;
  padding: 0;

  min-width: 200px;
  min-height: 200px;

  width: 200px;
  height: 200px;

  max-width: 300px;
  max-height: 300px;
  border-radius: 28px;

  object-fit: contain;
}

.item-name {
  font-size: 20px;
  font-weight: bold;
}

.img-div {
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: fit-content;
}
</style>
