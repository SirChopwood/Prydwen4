<script setup lang="ts">
const props = defineProps({
  seconds: {
    type: Number,
    required: true
  }
})

let hours = computed(() => {
  console.log("hours", Math.floor(props.seconds / 3600))
  return Math.floor(props.seconds / 3600)
})
let mins = computed(() => {
  console.log("mins", Math.floor((props.seconds - (hours.value * 3600)) / 60))
  return Math.floor((props.seconds - (hours.value * 3600)) / 60)
})
let secs = computed(() => {
  console.log("secs", Math.floor((props.seconds - ((hours.value * 3600) + (mins.value * 60)))))
  return Math.floor((props.seconds - ((hours.value * 3600) + (mins.value * 60))))
})
</script>

<template>
  <div class="flex flex-row gap-1 flex-nowrap">
    <div v-if="hours > 0"><span class="text-secondary">{{hours}}</span>h</div>
    <div v-if="mins > 0"><span class="text-secondary">{{mins}}</span>m</div>
    <div><span class="text-secondary">{{secs}}</span>s</div>
  </div>
</template>

<style scoped>

</style>