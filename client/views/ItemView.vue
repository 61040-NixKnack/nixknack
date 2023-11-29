<script setup lang="ts">
import { onBeforeMount, ref } from "vue";
import { useRoute } from "vue-router";

const itemID = ref("");

onBeforeMount(() => {
  const route = useRoute();
  itemID.value = route.params.id as string;
});
</script>

<template>
  <main class="column">
    <p>Put like... the item thing you make here. with the like.. thing attached so it knows what item it is</p>
    <p>{{ itemID }}</p>
  </main>
</template>
