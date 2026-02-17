<script setup lang="ts">
import ModalTemplate from "~/components/rrm_v2/modals/modal-template.vue";
import GenericButton from "~/components/rrm_v2/generic-button.vue";
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

const sessionSources = ['PyPy', 'YouTube', 'VRDancing', 'PlainText']
let tickedChannels: Ref<Array<string>> = ref([])
let tickedSources: Ref<Array<string>> = ref([])
let disabledControls: Ref<boolean> = ref(true)

watch(tickedChannels, (newVal, oldVal) => {
  console.log(newVal, oldVal)
})

onMounted(async () => {
  await props.client.sendMessage('getPermittedChannels', '')
  disabledControls.value = false
})

let sessionValid = computed(() => {
  return (tickedSources.value.length > 0 && tickedChannels.value.length > 0)
})

async function createSession() {
  if (!sessionValid.value) {return}

  let channelList = tickedChannels.value
  if (!channelList.includes(props.client.userId)) {
    channelList.push(props.client.userId)
  }

  await props.client.sendMessage('createSession', {
    hostId: props.client.userId,
    channels: channelList,
    sources: tickedSources.value,
  })
  await props.modalManager.hideModal(props.name)
}
</script>

<template>
  <modal-template :name="name" :modal-manager="modalManager">
    <div class="flex flex-col gap-2">
      <div class="flex flex-col gap-2">
        <div class="h-fit">Sources <span class="text-secondary">({{tickedSources.length}})</span></div>
        <div class="flex flex-row flex-wrap gap-2">
          <div v-for="source of sessionSources" class="flex flex-row border border-neutral-700 rounded items-center">
            <input type="checkbox" :value="source" v-model="tickedSources" :disabled="disabledControls" class="peer size-4 mx-1 accent-primary text-black">
            <div class="px-1 peer-checked:text-primary">{{source}}</div>
          </div>
        </div>
      </div>
      <div class="h-fit">Participating Channels <span class="text-secondary">({{tickedChannels.length}})</span></div>
      <div class="flex flex-col gap-2 border border-neutral-700 p-2 rounded bg-neutral-950 h-52 overflow-y-scroll">
        <div class="flex flex-col gap-2">
          <div class="text-secondary border-b border-b-secondary w-full">
            <span>Moderator</span>
            <span class="italic text-neutral-400"> - Channels you are a Moderator for on Twitch.</span>
            <span class="text-neutral-600"> (Channel Role)</span>
          </div>
          <div class="flex flex-row flex-wrap gap-2">
            <div v-for="channel of client.moderated.value" class="flex flex-row border border-neutral-700 rounded items-center">
              <input type="checkbox" :value="channel" v-model="tickedChannels" :disabled="disabledControls" class="peer size-4 mx-2 accent-primary text-black">
              <twitch-channel-widget :client="client" :channel-id="channel" @click.stop class=" peer-checked:text-primary"/>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2" v-if="client.groups.value.length > 0" v-for="group of client.groups.value">
          <div class="text-secondary border-b border-b-secondary w-full">
            <span>{{group.name}}</span>
            <span class="italic text-neutral-400"> - {{group.desc}}</span>
            <span class="text-neutral-600"> (RRM Group)</span>
          </div>
          <div class="flex flex-row flex-wrap gap-2">
            <div v-for="channel of group.channels" class="flex flex-row border border-neutral-700 rounded items-center">
              <input type="checkbox" :value="channel" v-model="tickedChannels" :disabled="disabledControls" class="peer size-4 mx-2 accent-primary text-black">
              <twitch-channel-widget :client="client" :channel-id="channel" @click.stop class=" peer-checked:text-primary"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <template v-slot:footer>
      <div class="grow"/>
      <generic-button :colour="sessionValid ? 'green' : 'neutral'" @click="createSession()">
        Create
      </generic-button>
    </template>
  </modal-template>
</template>

<style scoped>

</style>