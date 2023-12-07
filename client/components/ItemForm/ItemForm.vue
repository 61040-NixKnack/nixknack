<script setup lang="ts">
import { storage } from "@/utils/firebase.js";
import "@material/web/button/filled-button.js";
import "@material/web/textfield/outlined-text-field.js";
import { ref as fref, uploadBytes } from "firebase/storage";
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
const itemPicFile = ref();
const itemPicURL = ref("");

const emit = defineEmits(["closeSheet"]);

// const makeFake = async () => {
//   await fetchy("/api/items", "POST", {
//     body: { name: "Test Item", purpose: "This is a test description. Real descriptions are more helpful. Just padding this out to be a bit longer", lastUsedDate: new Date().toString() },
//   });
// };

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

    console.log("waiting");
    await Promise.all([DB_Promise, FB_Promise]);
    console.log("done!");

    emit("closeSheet");
  } catch (_) {
    return;
  }
};

const updateItem = async (name: string, lastUsedDate: string, location: string, purpose: string) => {
  let FB_Promise = null;
  let imgName = "";

  if (itemPicFile.value) {
    imgName = itemPicFile.value.name + v4();
    const imageRef = fref(storage, imgName);
    FB_Promise = uploadBytes(imageRef, itemPicFile.value);
  }

  try {
    const DB_Promise = await fetchy(`/api/items/${props.itemID}`, "PATCH", {
      body: { name, lastUsedDate, location, purpose, image: FB_Promise ? imgName : null },
    });

    console.log("waiting");
    await Promise.all([DB_Promise, FB_Promise]);
    console.log("done!");

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

onBeforeMount(async () => {
  if (isEditing.value) {
    const itemDoc = await fetchy(`/api/items/${props.itemID}`, "GET");
    console.log(itemDoc);
    name.value = itemDoc.name;
    purpose.value = itemDoc.purpose;
    location.value = itemDoc.location;
    lastUsedDate.value = formatDateShort(new Date(itemDoc.lastUsedDate));
    if (itemDoc.image) itemPicFile.value = await getDownloadURL(fref(storage, itemDoc.image));
  }
});
</script>

<template>
  <div class="creation-form">
    <form @submit.prevent="submitForm(name, lastUsedDate, location, purpose)">
      <div class="creation-form-header">
        <div class="close-button material-symbols-outlined" @click="emit('closeSheet')">close</div>
        <h2 class="hint-text">Add a KnickKnack</h2>
      </div>
      <div class="image-input">
        <label for="file-input">
          <div v-if="itemPicFile">
            <img :src="itemPicURL" alt="No image" class="default-image" :key="itemPicURL" />
          </div>
          <div v-else>
            <img src="@/assets/images/noImage.png" />
          </div>
        </label>
        <input type="file" accept="image/*" v-on:change="onInputChange" id="file-input" />
      </div>
      <md-outlined-text-field required v-model="name" label="Name" placeholder="Name"></md-outlined-text-field>
      <md-outlined-text-field pattern="\d{2}/\d{2}/\d{4}" v-model="lastUsedDate" label="Last Used Date" placeholder="mm/dd/yyyy"></md-outlined-text-field>
      <md-outlined-text-field v-model="location" label="Location" placeholder="Location"></md-outlined-text-field>
      <md-outlined-text-field v-model="purpose" label="Description" type="textarea" placeholder="Description" rows="3" class="description-field"></md-outlined-text-field>

      <div class="button-group">
        <md-filled-button v-if="isEditing" type="button" class="submit-button">Discard</md-filled-button><md-filled-button type="submit" class="submit-button">Add</md-filled-button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.button-group {
  margin: 16px auto;
  width: 100%;
  display: flex;
  justify-content: space-around;
  align-items: space-between;
}

.close-button {
  align-self: flex-start;
}

.creation-form {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  width: 100vw;
  max-width: 800px;
  bottom: 0;
  height: 90vh;
  z-index: 1;
  overflow: hidden;
}

md-filled-button {
  --md-filled-button-container-color: var(--dark-accent);
  --md-filled-button-label-text-color: var(--on-primary);
}

md-outlined-text-field {
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
  width: 180px;
  height: 180px;
}
</style>
