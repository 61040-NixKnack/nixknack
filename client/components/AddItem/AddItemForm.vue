<script setup lang="ts">
import { ref } from "vue";
import { fetchy } from "../../utils/fetchy";
import "@material/web/button/filled-button.js";
import "@material/web/textfield/outlined-text-field.js";
const name = ref("");
const lastUsedDate = ref("");
const location = ref("");
const purpose = ref("");

const emit = defineEmits(["closeSheet"]);

const makeFake = async () => {
  await fetchy("/api/items", "POST", {
    body: { name: "Test Item", purpose: "This is a test description. Real descriptions are more helpful. Just padding this out to be a bit longer", lastUsedDate: new Date().toString() },
  });
};

const createItem = async (name: string, lastUsedDate: string, location: string, purpose: string) => {
  try {
    // await fetchy("/api/items", "POST", {
    //   body: { content, name, lastUsedDate, location, purpose },
    // });

    await makeFake();
    emit("closeSheet");
  } catch (_) {
    return;
  }
  //   void updateStatus();
  emptyForm();
};

const emptyForm = () => {
  name.value = "";
  lastUsedDate.value = "";
  location.value = "";
  purpose.value = "";
};
</script>

<template>
  <div class="creation-form">
    <form @submit.prevent="createItem(name, lastUsedDate, location, purpose)">
      <div class="creation-form-header">
        <h2 class="hint-text">Add a KnickKnack (Submit form for a test item!)</h2>
      </div>
      <img src="/client/assets/images/noimage.png" alt="No image" class="default-image" />
      <md-outlined-text-field v-model="name" label="Name" placeholder="Name"></md-outlined-text-field>
      <md-outlined-text-field v-mode="lastUsedDate" label="Last Used Date" placeholder="mm/dd/yyyy"></md-outlined-text-field>
      <md-outlined-text-field v-model="location" label="Location" placeholder="Location"></md-outlined-text-field>
      <md-outlined-text-field v-model="purpose" label="Description" type="textarea" placeholder="Description" rows="3" class="description-field"></md-outlined-text-field>
      <md-filled-button type="submit" class="submit-button">Add</md-filled-button>
    </form>
  </div>
</template>

<style scoped>
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
  /* flex-direction: row; */
  /* align-items: flex-start; */
  /* float: left; */
  /* gap: 0vw; */
  /* background-color: pink; */
}

.hint-text {
  align-self: flex-start;
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
</style>
