<script setup lang="ts">
import GenericButton from "~/components/rrm_v2/generic-button.vue";
const props = defineProps({
  name: {
    required: true,
    type: String
  },
  modalManager: {
    type: Object as PropType<ModalManager>,
    default: {},
    required: true
  }
})
</script>

<template>
  <div class="text-neutral-200 font-cabin bg-neutral-950 p-2 rounded-sm flex flex-col w-fit max-w-1/2 min-w-1/3 h-fit absolute top-1/2 left-1/2 -translate-1/2 drop-shadow-md shadow">
    <div class="rounded-t stripes-secondary w-full p-2 flex flex-row drop-shadow-md shadow">
      <div class="grow text-white text-2xl font-jetbrains">
        {{name}}
      </div>
      <generic-button colour="red" @click="modalManager.hideModal(name)">
        <icon name="mdi:close-octagon-outline" class="text-xl inline align-middle -mx-4 translate-x-1.5"/>
      </generic-button>
    </div>
    <div class="bg-neutral-900 p-2 flex flex-col gap-2 border border-neutral-700 border-y-0">
      <slot name="default"/>
    </div>
    <div class="bg-neutral-900 rounded-b p-2 stripes flex flex-row justify-between border border-neutral-700 border-t-0">
      <slot name="footer"/>
    </div>
  </div>
</template>

<style scoped>

</style>