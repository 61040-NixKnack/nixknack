<script setup lang="ts">
import AddItemForm from "@/components/AddItem/AddItemForm.vue";
import CatalogInfoComponent from "@/components/Catalog/CatalogInfoComponent.vue";
import SearchBarComponent from "@/components/SearchBar/SearchBarComponent.vue";
import { useUserStore } from "@/stores/user";
import "@material/web/progress/circular-progress.js";
import { storeToRefs } from "pinia";
import { onBeforeMount, ref } from "vue";
import { fetchy } from "../utils/fetchy";

type CatalogInfoType = { itemId: string; itemName: string; itemUrl: string };

const { currentUsername, isLoggedIn } = storeToRefs(useUserStore());
const openOverlay = ref(false);
let itemData = ref<CatalogInfoType[]>();

const reloadCatalog = async () => {
  const response = await fetchy("/api/items", "GET");
  itemData.value = response.map((item: { _id: string; name: string; image: string }) => {
    return { itemId: item._id, itemName: item.name, itemUrl: item.image ?? "client/assets/images/noImage.png" };
  });
};

onBeforeMount(reloadCatalog);
</script>

<template>
  <main>
    <h1>Your KnickKnacks</h1>
    <div class="catalog-content">
      <SearchBarComponent />
      <div class="item-list" v-if="itemData">
        <CatalogInfoComponent
          v-for="item in itemData"
          :key="item.itemId"
          :itemName="item.itemName"
          :itemUrl="item.itemUrl"
          :onclick="() => $router.push({ name: 'Item', params: { id: item.itemId } })"
        />
      </div>
      <md-circular-progress indeterminate v-else></md-circular-progress>
    </div>

    <div class="overlay" v-if="openOverlay">
      <div class="shade" @click="openOverlay = false"></div>
      <AddItemForm
        class="add-item-form"
        @closeSheet="
          openOverlay = false;
          reloadCatalog();
        "
      />
    </div>

    <button id="new-post-fab" class="material-symbols-outlined" @click="openOverlay = true">add</button>
  </main>
</template>

<style scoped>
main {
  padding: 8px 36px;
}

.shade {
  overflow: hidden;
  position: fixed; /* Sit on top of the page content */
  display: flex;
  width: 100%; /* Full width (cover the whole page) */
  height: 100%; /* Full height (cover the whole page) */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5); /* Black background with opacity */
  z-index: 2; /* Specify a stack order in case you're using a different order for other elements */
}

.add-item-form {
  position: fixed; /* Sit on top of the page content */

  z-index: 3;
  bottom: 0;
}

h1 {
  text-align: left;
  color: var(--on-primary);
}
.catalog-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}

md-circular-progress {
  position: fixed;
  top: 50%;
  left: 50%;
}

.item-list {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  row-gap: 16px;
  column-gap: 16px;
  width: 100%;
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
