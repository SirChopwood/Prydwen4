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
</script>

<template>
  <div class="flex flex-row gap-2 flex-nowrap new-codeblock">
    <div v-if="duration.days > 0"><span class="text-secondary">{{duration.days}}</span>{{longform ? " Days" : "d"}}</div>
    <div v-if="duration.hours > 0"><span class="text-secondary">{{duration.hours}}</span>{{longform ? " Hours" : "h"}}</div>
    <div v-if="duration.minutes > 0"><span class="text-secondary">{{duration.minutes}}</span>{{longform ? " Minutes" : "m"}}</div>
    <div><span class="text-secondary">{{duration.seconds}}</span>{{longform ? " Seconds" : "s"}}</div>
  </div>
</template>

<style scoped>

</style>