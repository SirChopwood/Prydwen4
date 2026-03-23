<script setup lang="ts">
import Cassette_tape from "~/components/rrm_v2/overlays/cassette_tape.vue";
import {onBeforeUnmount, useOverlayClient} from "#imports";

definePageMeta({
  title: "Rami Request Manager",
  layout: "blank"
})
useSeoMeta({
  title: "Cassette Overlay",
  ogTitle: "Cassette Overlay",
  description: "A overlay for showing requests, themed like a retro cassette player.",
  ogDescription: "A overlay for showing requests, themed like a retro cassette player.",
  ogImage: `https://louismayes.xyz/images/rrm/overlays/cassette/Player.png`,
  twitterImage: `https://louismayes.xyz/images/rrm/overlays/cassette/Player.png`,
  twitterCard: 'summary_large_image',
  author: "Rami Request Manager",
})

let client = useOverlayClient()
let route = useRoute()
let debug = ref(false)

onMounted(async () => {
  if (Array.isArray(route.params.channel)) {
    if (route.params.channel[0]) {
      await client.connectToServer(route.params.channel[0])
    }
  } else {
    if (route.params.channel) {
      await client.connectToServer(route.params.channel)
    }
  }
  setInterval(() => {currentScreenDisplay.value += 1}, 4000)
})

onBeforeUnmount(async () => {
  await client.disconnectFromServer()
})

let screenDisplays: Array<{title: string, value: string}> = [
  {title: "ID: ", value: "code"},
  {title: "User: ", value: "user"},
  {title: "Total: ", value: "total"},
  {title: "Status: ", value: "status"},
  {title: "Host: ", value: "host"}
]
let currentScreenDisplay = ref(0)
let getCurrentScreenDisplay: ComputedRef<{title: string, value: string}> = computed(() => {
  const current = screenDisplays[currentScreenDisplay.value % screenDisplays.length]
  switch (current!.value) {
    case "code":
      return {title: "ID: ", value: String(client.getCurrentRequest.value?.code) || "N/A"}
    case "user":
      return {title: "User: ", value: String(client.getCurrentRequest.value?.user) || "N/A"}
    case "total":
      return {title: "Songs in Queue: ", value: client.getCurrentPosition.value ? String(client.getRequestQueue.value.length - (client.getCurrentPosition.value! + 1)) : "N/A"}
    case "status":
      return {title: "Status: ", value: String(client.getCurrentSession.value?.requestState) || "N/A"}
    case "host":
      return {title: "DJ: ", value: String(client.getCurrentSession.value?.lastUser) || "N/A"}
  }
  return {title: "", value: ""}
})
let tapeRowValues = computed(() => {
  const indexes = [1,2,3,4,5]
  let list = []
  for (let i of indexes) {
    if (client.getCurrentRequestQueue.value[(client.getCurrentPosition.value! + i)]) {
      list.push(client.getCurrentRequestQueue.value[(client.getCurrentPosition.value! + i)])
    }
  }
  return list
})
</script>

<template>
  <button class="opacity-0 w-10 h-10" @click="debug = !debug">TOGGLE DEBUG</button>
  <div v-if="debug" class="bg-black m-4 rounded p-2 w-fit h-fit font-jetbrains text-sm">
    <div class="text-white text-lg font-bold underline">DEBUG</div>
    <div class="text-pink-500">channel (path param): {{ route.params.channel }}</div>
    <div class="text-red-500">channel (client): {{ client.channel }}</div>
    <div class="text-orange-500">connected: {{ client.ws?.readyState === client.ws?.OPEN }}</div>
    <div class="text-amber-500">current session: {{client.getCurrentSession.value}}</div>
    <div class="text-green-500 text-xs">current queue: {{client.getRequestQueue.value}}</div>
    <div class="text-cyan-500">current req: {{client.getCurrentRequest.value}}</div>
    <div class="text-blue-500">uptime: {{client.getUptime.value}}</div>
  </div>
  <div class="fixed bottom-0 -left-4 w-96 h-fit">
    <div class="relative">
      <nuxt-img src="/images/rrm/overlays/cassette/PlayerOverlay.png" class="absolute w-full z-20"></nuxt-img>
      <div v-if="client.getCurrentRequest.value">
        <div v-if="client.getRequestQueue.value.length > 0" class="absolute size-28 left-16 top-10 -ml-1 -mt-1 z-10 overflow-clip rounded-full ">
          <img v-if="client.getCurrentRequest.value!.metadata!['Thumbnail']" :src="client.getCurrentRequest.value!.metadata!['Thumbnail']" class="h-full aspect-square animate-spin" style="animation-duration: 4s"/>
        </div>

        <div class="absolute right-2.5 top-6 -z-10">
          <cassette_tape :song="client.getCurrentRequest.value" class=""></cassette_tape>
        </div>

        <div class="right-2 bottom-10 absolute flex-col w-44 h-10 pr-1 pt-1 text-green-400 font-jetbrains leading-3 text-base line text-nowrap z-10">
          <div class="overflow-hidden flex flex-row h-8 overflow-x-clip pt-3">
              <div class="animate-marquee">{{client.getCurrentRequest.value!.text}}&nbsp;|&nbsp;</div>
              <div class="animate-marquee">{{client.getCurrentRequest.value!.text}}&nbsp;|&nbsp;</div>
          </div>
          <div class="flex flex-row flex-nowrap">
            {{getCurrentScreenDisplay.title}}
            <div v-if="getCurrentScreenDisplay.value.length > 20"
                 class="text-nowrap overflow-hidden flex flex-row flex-nowrap h-8 ticker-tape-container">
              <div class="ticker-tape" style="animation-duration: 10s">
                {{ getCurrentScreenDisplay.value }}
              </div>
              <div class="ticker-tape" style="animation-duration: 10s">
                {{ getCurrentScreenDisplay.value }}
              </div>
            </div>
            <div v-else class="text-ellipsis">
              {{ getCurrentScreenDisplay.value }}
            </div>
          </div>
        </div>
      </div>
      <nuxt-img src="/images/rrm/overlays/cassette/Player.png" class="w-full z-0"></nuxt-img>
      <div class="absolute bottom-4 left-14 w-36 h-12 -mb-1 -ml-2 pl-1 pt-2 flex flex-row justify-evenly">
        <div class="size-8">
          <nuxt-img src="/images/rrm/overlays/cassette/PlayerButton1.png" class="object-fill opacity-70"/>
        </div>
        <div class="size-8">
          <nuxt-img src="/images/rrm/overlays/cassette/PlayerButton2.png" class="object-fill opacity-70"/>
        </div>
        <div class="size-8">
          <nuxt-img src="/images/rrm/overlays/cassette/PlayerButton3.png" class="object-fill opacity-70"/>
        </div>
      </div>
    </div>
  </div>

  <div class="fixed inset-x-96 -bottom-12 h-32 flex flex-row overflow-visible justify-center">
    <transition-group name="tapes">
      <cassette_tape v-for="song of tapeRowValues" :song="song" :key="song!.id" class="-mx-2" :style="`rotate: ${((song!.text.length%20)-10)*1.2}deg`"/>
    </transition-group>
  </div>
</template>

<style scoped>
.tapes-move,
.tapes-enter-active,
.tapes-leave-active {
  transition: all 2s ease;
}
.tapes-enter-from,
.tapes-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
.tapes-leave-active {
  position: absolute;
}
</style>