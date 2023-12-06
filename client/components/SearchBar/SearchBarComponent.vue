<script setup lang="ts">
import { defineEmits, defineProps, ref } from "vue";

const props = defineProps(["modelValue"]);
defineEmits(["update:modelValue"]);
const internalValue = ref(props.modelValue.value);
</script>

<template>
  <form class="pure-form">
    <button class="search-button material-symbols-outlined">search</button>
    <input
      id="input_field"
      type="text"
      autocomplete="off"
      placeholder="Search..."
      v-model="internalValue"
      @input="$emit('update:modelValue', internalValue)"
      @keydown="
        (event) => {
          if (event.key == 'Enter') event.preventDefault();
        }
      "
    />
    <button class="search-button material-symbols-outlined">filter_list</button>
  </form>
</template>

<style scoped>
form {
  min-width: 360px;
  width: 100%;
  max-width: 720px;
  height: 56px;
  padding: 0 16px;
  background-color: var(--light-accent);
  border-radius: 56px;
  gap: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

input {
  border: 0px solid;
  border-style: none;
  background-color: transparent;
  color: var(--on-primary);
  width: 100%;
  cursor: pointer;
}

.search-button {
  border: transparent;
  background-color: transparent;
  color: var(--on-primary);
  font-size: 24px;
  padding: 0;
  margin: 0;
  cursor: pointer;
}
</style>
