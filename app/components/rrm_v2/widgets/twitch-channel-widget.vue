<script setup lang="ts">
const props = defineProps({
  client: {
    type: RRM_V2_PanelClient,
    required: true
  },
  channelId: {
    type: String,
    required: true,
  }
})

onMounted(() => {
  props.client?.getChannelById(props.channelId)
})

let channel = computed(() => {
  if (props.channelId && props.client) {
    if (Object.keys(props.client.channels.value).includes(props.channelId)) {
      return props.client.channels.value[props.channelId]
    }
  }
  return undefined
})
</script>

<template>
  <a v-if="channel" :href="`https://twitch.tv/${channel.login}`" target="_blank" class="border-purple-950 border-2 hover:border-purple-800 bg-neutral-900 hover:bg-neutral-700 px-1 py-0.5 rounded text-white transition-all duration-200">
    <img
        :src="channel.profile_image_url"
        class="size-6 inline align-middle rounded mr-1"
    />
    {{channel.display_name}}
  </a>
</template>

<style scoped>

</style>