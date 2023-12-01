<script setup lang="ts">
import CatalogInfoComponent from "@/components/Catalog/CatalogInfoComponent.vue";
import SearchBarComponent from "@/components/SearchBar/SearchBarComponent.vue";
import { useUserStore } from "@/stores/user";
import { storeToRefs } from "pinia";

type CatalogInfoType = { itemId: string; itemName: string; itemUrl: string };

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());

const itemData: CatalogInfoType[] = [];

for (let i = 0; i < 10; i++) {
  itemData.push({ itemId: i.toString(), itemName: "Piranha Plant", itemUrl: "client/assets/images/piranha_plant.jpg" });
}
</script>

<template>
  <main>
    <h1>Your KnickKnacks</h1>

    <div class="catalog-content">
      <SearchBarComponent />
      <div class="item-list">
        <CatalogInfoComponent v-for="item in itemData" :key="item.itemId" :itemName="item.itemName" :itemUrl="item.itemUrl" />
      </div>
    </div>

    <button id="new-post-fab" class="material-symbols-outlined" @click="console.log('Add item button clicked')">add</button>
  </main>
</template>

<style scoped>
main {
  padding: 8px 36px;
}

h1 {
  text-align: left;
  color: var(--on-primary);
}
.catalog-content {
  display: flex;
  flex-direction: column;
  align-items: center;

  gap: 16px;
}

.item-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  row-gap: 16px;
  column-gap: 16px;
}

#new-post-fab {
  position: fixed;
  bottom: 80px;
  right: 0;

  border: none;
  background-color: var(--dark-accent);
  color: var(--on-primary);

  font-size: 24px;
  border-radius: 16px;
  width: 56px;
  height: 56px;
  margin: 0 16px 16px 0;
  cursor: pointer;
}
</style>