<script setup lang="ts">
import router from "@/router/index";
import { onBeforeMount, ref } from "vue";
import { useToastStore } from "../../stores/toast";
import { fetchy } from "../../utils/fetchy";
import { formatDateShort } from "../../utils/formatDate";
import { storage } from "@/utils/firebase.js";
import { ref as fref, getDownloadURL } from "firebase/storage";

const props = defineProps(["itemID"]);
const itemName = ref("");
const itemDesc = ref("");
const lastUsed = ref("");
const itemTags = ref([]);
const imageURL = ref("");

onBeforeMount(async () => {
  try {
    const itemDoc = await fetchy(`/api/items/${props.itemID}`, "GET");
    itemName.value = itemDoc.name;
    itemDesc.value = itemDoc.purpose;
    lastUsed.value = formatDateShort(new Date(itemDoc.lastUsedDate));
    if (itemDoc.image) imageURL.value = await getDownloadURL(fref(storage, itemDoc.image));
  } catch (error) {
    await router.push({ name: "not-found-page" });
  }
});

const notImplemented = async () => {
  useToastStore().showToast({ message: "NOT IMPLEMENTED", style: "error" });
};

const goBack = async () => {
  await router.push({ name: "Catalog" });
};

// TODO
// Function to make a fake item
// const makeFake = async () => {
//   await fetchy("/api/items", "POST", {
//     body: { name: "Test Item", purpose: "This is a test description. Real descriptions are more helpful. Just padding this out to be a bit longer", lastUsedDate: new Date().toString() },
//   });
// };
</script>

<template>
  <main v-if="itemName != ''">
    <section id="return">
      <div class="material-symbols-outlined" id="back_arr" @click="goBack"><b>arrow_back</b></div>
      <h1>{{ itemName }}</h1>
    </section>
    <section id="imgSection">
      <div class="secondary-div" id="itemImg">
        <div v-if="imageURL">
          <img :src="imageURL" />
        </div>
        <div v-else>
          <img src="@/assets/images/noImage.png" />
        </div>
      </div>
    </section>
    <section>
      <h2>Description</h2>
      <div class="secondary-div" id="itemDesc">
        <p>{{ itemDesc }}</p>
        <div id="last-used">
          <p><b>Last Used:</b></p>
          <p>{{ lastUsed }}</p>
        </div>
      </div>
    </section>
    <section>
      <h2>Tags</h2>
      <div id="tag-list">
        <div v-for="tag in itemTags" :key="tag" class="secondary-div">
          <strong>{{ tag }}</strong>
        </div>
      </div>
    </section>
    <section id="options">
      <!-- TODO -->
      <button @click="notImplemented">Edit</button>
      <button @click="notImplemented">Discard</button>
    </section>
  </main>
  <md-circular-progress indeterminate v-else></md-circular-progress>
</template>

<style scoped>
main {
  height: calc(100vh - 80px);
  aspect-ratio: 9/16;
  max-width: auto;
  display: flex;
  flex-direction: column;
  justify-content: space-evenly;
}

md-circular-progress {
  position: fixed;
  top: 50%;
  left: 50%;
}

section {
  color: var(--on-primary);
}

form {
  display: flex;
  gap: 0.5em;
  padding: 1em;
  align-items: center;
}

.secondary-div {
  background-color: var(--secondary);
  color: var(--on-secondary);
  border-radius: 10px;
  border: solid var(--secondary) 20px;
}

#return {
  display: flex;
  align-items: center;
}

#back_arr {
  font-size: 40px;
  font-weight: bold;
}

#imgSection {
  display: flex;
  align-items: center;
  justify-content: center;
}

#itemImg {
  display: block;
  height: fit-content;
  width: fit-content;
}

#itemDesc {
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  text-wrap: wrap;
  border-top: 10px;
  border-bottom: 10px;
  font-size: 20px;
  text-align: center;
  max-width: 100%;
}

#last-used {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
}

#tag-list {
  width: 100%;
  display: flex;
  justify-content: left;
  gap: 10px;
}

#tag-list > * {
  font-size: 16px;
  text-align: center;
  padding-top: 5px;
  padding-bottom: 5px;
  border: solid var(--secondary) 1px;
  border-radius: 5px;
  padding-left: 20px;
  padding-right: 20px;
}

#options {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: stretch;
}

#options button {
  border: none;
  background: var(--secondary);
  color: var(--on-secondary);
  font-size: 24px;
  font-weight: bold;
  width: 100%;
  margin-left: 5%;
  margin-right: 5%;
  padding-top: 10px;
  padding-bottom: 10px;
  border-radius: 25px;
}

img {
  width: 180px;
  height: 180px;
}
</style>
