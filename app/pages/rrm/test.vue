<script setup lang="ts">
console.log("Loading WS")

let messages: Ref<Array<String>> = ref([])
let ws: WebSocket | null = null

onMounted(async () => {
})

function openWs() {
  if (ws) {return}
  ws = new WebSocket("/api/rrm_v2/overlay")
  ws.addEventListener("open", async (event) => {
    console.log("WS Ready")
    messages.value.push(`WS Ready`)
    ws!.send(JSON.stringify({type: "ping", value: ""}))
  })
  ws.addEventListener("message", async (event) => {
    console.log(event.data)
    messages.value.push(`${event.data}`)
  })
  ws.addEventListener("close", async (event) => {
    console.log("WS Closed")
    messages.value.push(`WS Closed`)
  })
  ws.addEventListener("error", async (event) => {
    console.log(`WS Error: ${event}`)
    messages.value.push(`WS Error: ${event}`)
  })
}

function testPing() {
  ws!.send(JSON.stringify({type: "ping", value: ""}))
}

function test() {
  ws!.send(JSON.stringify({type: "test", value: "Hello There"}))
}

function testClass() {
  ws!.send(JSON.stringify({type: "class", value: "Ayy Lmao"}))
}

function closeWs() {
  ws!.close()
  ws = null
}

onUnmounted(() => {
  ws!.close()
})
</script>

<template>
  <div class="p-8 flex flex-col gap-8 w-full h-fit max-h-full overflow-scroll">
    <div class="flex flex-row gap-8">
      <button class="bg-neutral-800 rounded-sm border-primary border-2 p-2 text-3xl font-bold hover:text-primary" v-if="!ws" @click="openWs">Open</button>
      <button class="bg-neutral-800 rounded-sm border-primary border-2 p-2 text-3xl font-bold hover:text-primary" v-if="ws" @click="testPing">Ping</button>
      <button class="bg-neutral-800 rounded-sm border-primary border-2 p-2 text-3xl font-bold hover:text-primary" v-if="ws" @click="test">Test</button>
      <button class="bg-neutral-800 rounded-sm border-primary border-2 p-2 text-3xl font-bold hover:text-primary" v-if="ws" @click="testClass">Class</button>
      <button class="bg-neutral-800 rounded-sm border-primary border-2 p-2 text-3xl font-bold hover:text-primary" v-if="ws" @click="closeWs">Close</button>
    </div>
    <div class="bg-neutral-800 rounded-sm border-primary border-2 flex flex-col w-full h-fit max-h-full overflow-scroll">
      <div v-for="message of messages">{{message}}</div>
    </div>
  </div>
</template>

<style scoped>

</style>