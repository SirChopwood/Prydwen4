<script setup lang="ts">
const props = defineProps({
  seconds: {
    type: Number,
    required: true
  },
  longform: {
    type: Boolean,
    required: false,
    default: false
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
  <div class="flex flex-row gap-1 flex-nowrap border rounded border-neutral-700 bg-black/40 px-1 w-fit">
    <div v-if="hours > 0"><span :class="{'text-secondary': longform}">{{hours}}</span>{{longform ? " Hours" : "h"}}</div>
    <div v-if="mins > 0"><span :class="{'text-secondary': longform}">{{mins}}</span>{{longform ? " Minutes" : "m"}}</div>
    <div><span :class="{'text-secondary': longform}">{{secs}}</span>{{longform ? " Seconds" : "s"}}</div>
  </div>
</template>

<style scoped>

</style>