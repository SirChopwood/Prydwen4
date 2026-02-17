<script setup lang="ts">
const props = defineProps({
  header: {
    type: String,
    required: true,
  }
})
function codeName() {
  return props.header.toLowerCase().replaceAll(" ","")
}

let isOpen = ref(true)

onMounted(async () => {
  let openState = localStorage.getItem(`RRM_V2_ControlOpenState_${codeName()}`)
  if (openState !== null) {
    await setOpenState(openState.toLowerCase() === 'true')
  }
})

async function setOpenState(newState: boolean) {
  isOpen.value = newState
  localStorage.setItem(`RRM_V2_ControlOpenState_${codeName()}`, String(newState))
}
</script>

<template>
  <div class="border border-neutral-700 drop-shadow-2xl rounded flex flex-col gap-2">
    <div class="stripes-secondary text-2xl rounded-t p-2 font-jetbrains cursor-pointer" :class="{'rounded-b': !isOpen}" @click="setOpenState(!isOpen)">{{header}}</div>
    <div class="w-full p-2" v-show="isOpen">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>

</style>