<script setup lang="ts">
import ModalTemplate from "~/components/rrm_v2/modals/modal-template.vue";
import TwitchChannelWidget from "~/components/rrm_v2/widgets/twitch-channel-widget.vue";

const props = defineProps({
  name: {
    required: true,
    type: String
  },
  modalManager: {
    type: Object as PropType<ModalManager>,
    default: {},
    required: true
  },
  client: {
    type: RRM_V2_PanelClient,
    required: true
  }
})

onMounted(async () => {
  await props.client.sendMessage('getPermittedChannels', '')
})
</script>

<template>
  <modal-template :name="name" :modal-manager="modalManager">
    <div class="flex flex-col w-full gap-2 p-2">
      <div
          v-if="client.groups.value.length > 0"
          v-for="group in client.groups.value"
          class="flex flex-col w-full p-1 rounded border border-neutral-600"
      >
        <div class="text-xl text-primary">{{group.name}}</div>
        <div class="italic">{{group.desc}}</div>
        <div class="w-fit">ID: <span class="codeblock">{{group.id}}</span></div>
        <div>
          Members:
          <div class="flex flex-row flex-wrap gap-4">
            <twitch-channel-widget v-for="channel of group.channels" :client="client" :channel-id="channel"/>
          </div>
        </div>
      </div>
      <div v-else class="text-2xl stripes-warning text-center">Loading...</div>
    </div>
  </modal-template>
</template>

<style scoped>

</style>