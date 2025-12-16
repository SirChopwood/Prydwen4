<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "content-gallery",
  props: {
    scrolling: String
  }
})
</script>

<template>
  <div v-if="scrolling === 'true'" class="flex flex-col md:flex-row items-center w-full justify-evenly justify-items-center h-fit md:max-h-96 flex-nowrap overflow-y-clip overflow-x-scroll scrollbar scrollbar-thumb-neutral-700 scrollbar-track-neutral-900 scrollbar-corner-neutral-800">
    <slot />
  </div>
  <div v-else class="flex flex-col md:flex-row items-center w-full justify-evenly justify-items-center h-fit md:max-h-96 flex-nowrap overflow-clip">
    <slot />
  </div>
</template>

<style scoped>

</style>