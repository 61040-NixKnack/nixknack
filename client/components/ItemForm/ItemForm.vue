<script setup lang="ts">
import { storage } from "@/utils/firebase.js";
import router from "@/router/index";
import "@material/web/button/filled-button.js";
import "@material/web/textfield/outlined-text-field.js";
import "@material/web/chips/chip-set.js";
import "@material/web/chips/filter-chip.js";
import "@material/web/select/outlined-select.js";
import "@material/web/select/select-option.js";
import { ref as fref, uploadBytes, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import { computed, ref, onBeforeMount } from "vue";
import { fetchy } from "../../utils/fetchy";
import { formatDateShort } from "../../utils/formatDate";

const props = defineProps(["itemID"]);
const isEditing = computed(() => props.itemID !== undefined);
const name = ref("");
const lastUsedDate = ref(formatDateShort(new Date()));
const location = ref("");
const purpose = ref("");
const tags = ref<string[]>([]);

const chosenTags = ref<string[]>([]);
const originalTags = ref<string[]>([]);
const itemPicFile = ref();
const originalImgURL = ref("");
const itemPicURL = computed(() => (itemPicFile.value ? URL.createObjectURL(itemPicFile.value) : originalImgURL.value));

const emit = defineEmits(["closeSheet"]);

const submitForm = async (name: string, lastUsedDate: string, location: string, purpose: string) => {
  if (isEditing.value) {
    await updateItem(name, lastUsedDate, location, purpose);
  } else {
    await createItem(name, lastUsedDate, location, purpose);
  }
};

const createItem = async (name: string, lastUsedDate: string, location: string, purpose: string) => {
  let FB_Promise = null;
  let imgName = "";

  if (itemPicFile.value) {
    imgName = itemPicFile.value.name + v4();
    const imageRef = fref(storage, imgName);
    FB_Promise = uploadBytes(imageRef, itemPicFile.value);
  }

  try {
    const DB_Promise = fetchy("/api/items", "POST", {
      body: { name, lastUsedDate, location, purpose, image: FB_Promise ? imgName : null },
    });

    // console.log("waiting");
    const id = (await Promise.all([DB_Promise, FB_Promise]))[0].id;
    // console.log(id);
    await fetchy(`/api/items/${id}`, "POST", {
      body: { tags: chosenTags.value },
    });
    // console.log("done!");

    emit("closeSheet");
  } catch (_) {
    return;
  }
};

const updateItem = async (name: string, lastUsedDate: string, location: string, purpose: string) => {
  let FB_Promise = null;
  let imgName = "";
  const newTags = chosenTags.value.filter((tag) => !originalTags.value.includes(tag));
  const oldTags = originalTags.value.filter((tag) => !chosenTags.value.includes(tag));

  console.log(newTags, oldTags);

  if (itemPicFile.value) {
    imgName = itemPicFile.value.name + v4();
    const imageRef = fref(storage, imgName);
    FB_Promise = uploadBytes(imageRef, itemPicFile.value);
  }

  try {
    const DB_Promise = fetchy(`/api/items/${props.itemID}`, "PATCH", {
      body: FB_Promise ? { name, lastUsedDate, location, purpose, image: imgName } : { name, lastUsedDate, location, purpose },
    });

    // console.log("waiting");

    for (const tag in oldTags) void fetchy(`/items/${props.itemID}/${tag}`, "DELETE");

    if (newTags)
      await fetchy(`/items/${props.itemID}`, "POST", {
        body: { tags: newTags },
      });

    await Promise.all([DB_Promise, FB_Promise]);
    // console.log("done!");

    emit("closeSheet");
  } catch (_) {
    return;
  }

  emptyForm();
};

const emptyForm = () => {
  name.value = "";
  lastUsedDate.value = "";
  location.value = "";
  purpose.value = "";
  chosenTags.value = [];
};

function onInputChange(e: Event) {
  if (itemPicFile.value) {
    URL.revokeObjectURL(itemPicURL.value);
  }
  if (e.target !== null) {
    const files = (<HTMLInputElement>e.target).files;
    if (files) itemPicFile.value = files[0];
  }
}

const loadFirebase = async (imgURL: string | null) => {
  if (imgURL !== null) return await getDownloadURL(fref(storage, imgURL));
  return "";
};

onBeforeMount(async () => {
  tags.value = (await fetchy("/api/tags", "GET")).sort();

  if (isEditing.value) {
    const itemDoc = await fetchy(`/api/items/${props.itemID}`, "GET");
    originalTags.value = await fetchy(`/api/items/${props.itemID}/tags`, "GET");
    chosenTags.value = originalTags.value;

    // console.log(itemDoc);
    name.value = itemDoc.name;
    purpose.value = itemDoc.purpose;
    location.value = itemDoc.location;
    lastUsedDate.value = formatDateShort(new Date(itemDoc.lastUsedDate));
    originalImgURL.value = itemDoc.image ? await loadFirebase(itemDoc.image) : "";
  }
});

const addTag = () => {
  const selectionBox = document.querySelector("md-outlined-select");
  const selectedItem = Array.from(document.querySelectorAll("md-select-option")).filter((tag) => tag.selected)[0];
  chosenTags.value.push(selectedItem.value);
  selectionBox!.reset();
};

const checkDeleted = (tag: string) => {
  chosenTags.value = chosenTags.value.filter((x) => x !== tag);
};

const deleteItem = async () => {
  await fetchy(`/api/items/${props.itemID}`, "DELETE", {
    query: { points: false },
  });
  await router.push({ name: "Catalog" });
};
</script>

<template>
  <div class="creation-form">
    <form @submit.prevent="submitForm(name, lastUsedDate, location, purpose)">
      <div class="creation-form-header">
        <div class="close-button material-symbols-outlined" @click="emit('closeSheet')">close</div>
        <h2 class="hint-text">{{ isEditing ? "Edit your KnickKnack" : "Add a KnickKnack" }}</h2>
      </div>
      <div class="image-input">
        <label for="file-input">
          <div v-if="itemPicURL !== ''" class="img-container">
            <img :src="itemPicURL" :alt="itemPicURL" class="default-image" :key="itemPicURL" />
          </div>
          <div v-else class="img-container">
            <img src="@/assets/images/noImage.png" />
          </div>
        </label>
        <input type="file" accept="image/*" v-on:change="onInputChange" id="file-input" />
      </div>
      <md-outlined-text-field required v-model="name" label="Name" placeholder="Name"></md-outlined-text-field>
      <md-outlined-text-field pattern="\d{2}/\d{2}/\d{4}" v-model="lastUsedDate" label="Last Used Date" placeholder="mm/dd/yyyy"></md-outlined-text-field>
      <md-outlined-text-field v-model="location" label="Location" placeholder="Enter a location"></md-outlined-text-field>
      <md-outlined-text-field v-model="purpose" label="Description" type="textarea" placeholder="Add a description" rows="2" class="description-field"></md-outlined-text-field>
      <md-outlined-select label="Select a tag" @input="addTag">
        <md-select-option v-for="tag in tags.filter((x) => !chosenTags.includes(x))" :key="tag" :value="tag">
          <div slot="headline">{{ tag }}</div>
        </md-select-option>
      </md-outlined-select>

      <md-chip-set class="current-tags">
        <md-filter-chip v-for="tag in chosenTags" :key="tag" :label="tag" @click="() => checkDeleted(tag)" selected></md-filter-chip>
      </md-chip-set>
      <div class="button-group">
        <md-filled-button v-if="isEditing" type="button" class="submit-button" @click="deleteItem">Delete</md-filled-button
        ><md-filled-button type="submit" class="submit-button">{{ isEditing ? "Update" : "Add" }}</md-filled-button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.button-group {
  margin: 8px 0 0 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: space-between;
}

.close-button {
  align-self: flex-start;
  cursor: pointer;
}

.current-tags {
  align-self: center;
  max-width: 500px;
}

.creation-form {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  width: 100vw;
  max-width: 800px;
  bottom: 0;
  height: 98vh;
  z-index: 1;
  overflow: hidden;
}

md-filled-button {
  --md-filled-button-container-color: var(--dark-accent);
  --md-filled-button-label-text-color: var(--on-primary);
}

md-outlined-text-field,
md-outlined-select {
  min-width: 400px;
  width: 30vw;
}

.description-field {
  resize: vertical;
}

.creation-form-header {
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  justify-content: center;
}

form {
  background-color: var(--light-accent);
  border-radius: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 1em;
  height: 100%;
}

.image-input > input {
  display: none;
}

img {
  max-width: 180px;
  max-height: 180px;
}

.img-container {
  min-width: 180px;
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
