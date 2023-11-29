<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";
import ItemInfo from "@/components/Catalog/ItemInfo.vue";

const itemID = ref("");

onBeforeMount(() => {
  const route = useRoute();
  itemID.value = route.params.id as string;
});
</script>

<template>
  <main class="column">
    <ItemInfo :itemID="itemID" />
  </main>
</template>
