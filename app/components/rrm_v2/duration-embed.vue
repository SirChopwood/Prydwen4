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

let duration = computed(() => {
  let remainder = props.seconds

  function reduceRemainder(seconds: number) {
    let amount = Math.floor(remainder / seconds)
    remainder = remainder - (amount * seconds)
    return amount
  }

  let days = reduceRemainder(86400)
  let hours = reduceRemainder(3600)
  let mins = reduceRemainder(60)

  return{
    days: days,
    hours: hours,
    minutes: mins,
    seconds: Math.floor(remainder)
  }
})
// let days = computed(() => {
//   console.log("days", Math.floor(props.seconds / 86400))
//   return Math.floor(props.seconds / 86400)
// })
// let hours = computed(() => {
//   console.log("hours", Math.floor(props.seconds / 3600))
//   return Math.floor(props.seconds / 3600)
// })
// let mins = computed(() => {
//   console.log("mins", Math.floor((props.seconds - (hours.value * 3600)) / 60))
//   return Math.floor((props.seconds - (hours.value * 3600)) / 60)
// })
// let secs = computed(() => {
//   console.log("secs", Math.floor((props.seconds - ((hours.value * 3600) + (mins.value * 60)))))
//   return Math.floor((props.seconds - ((hours.value * 3600) + (mins.value * 60))))
// })
</script>

<template>
  <div class="flex flex-row gap-2 flex-nowrap border rounded border-neutral-700 bg-black/40 px-1 w-fit font-jetbrains">
    <div v-if="duration.days > 0"><span :class="{'text-secondary': longform}">{{duration.days}}</span>{{longform ? " Days" : "d"}}</div>
    <div v-if="duration.hours > 0"><span :class="{'text-secondary': longform}">{{duration.hours}}</span>{{longform ? " Hours" : "h"}}</div>
    <div v-if="duration.minutes > 0"><span :class="{'text-secondary': longform}">{{duration.minutes}}</span>{{longform ? " Minutes" : "m"}}</div>
    <div><span :class="{'text-secondary': longform}">{{duration.seconds}}</span>{{longform ? " Seconds" : "s"}}</div>
  </div>
</template>

<style scoped>

</style>