<script setup lang="ts">
useHead({
  script: [{src: "https://player.twitch.tv/js/embed/v1.js"}]
})

let twitchPlayer: any;
let twitchPlayerBoxRef = useTemplateRef("twitchPlayerBox")

onMounted(() => {
  let TwitchOptions = {
    width: twitchPlayerBoxRef.value!.clientWidth,
    height: twitchPlayerBoxRef.value!.clientHeight,
    channel: "totless",
    autoplay: true,
    muted: true,
    parent: ["louismayes.xyz", "localhost"]
  };
  // @ts-ignore
  twitchPlayer = new Twitch.Player("twitchPlayerBox", TwitchOptions)
})
</script>

<template>
  <div id="twitchPlayerBox" ref="twitchPlayerBox" class="aspect-video bg-purple-950 text-center rounded overflow-clip"></div>
</template>

<style scoped>

</style>