<script setup lang="ts">
import ModalTemplate from "~/components/rrm_v2/modals/modal-template.vue";
import GenericButton from "~/components/rrm_v2/generic-button.vue";
import SessionCreationModal from "~/components/rrm_v2/modals/session-creation-modal.vue";
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

let selectionId: Ref<number> = ref(-1)
let selectionSession = () => {
  return props.client.activeSessions.value[String(selectionId.value)]
}

async function saveAndClose() {
  await props.client.setCurrentSession(selectionId.value)
  await props.modalManager.hideModal(props.name)
}

onMounted(async () => {
  props.client.sendMessage('getActiveSessions', {channelId: props.client.user!.id})
})
</script>

<template>
  <modal-template :name="name" :modal-manager="modalManager">
    <div class="flex flex-col gap-2 justify-center content-center border-b border-b-neutral-700 pb-2">
      <div class="grow text-center">Select an active session or create a new one.</div>
      <div class="flex flex-row gap-2 justify-center">
        <generic-button colour="green" title="Create a New Session" @click="modalManager.showModal('Create a New Session', SessionCreationModal, {client})">
          Create
        </generic-button>
        or
        <select v-model="selectionId" class="min-w-40 codeblock text-white py-1">
          <option v-if="Object.keys(client.activeSessions.value).length === 0" disabled selected label="None Available" :value="-1"/>
          <option v-else disabled label="Select an Option..." :value="-1"/>
          <option selected label="None" :value="-1"/>
          <option v-for="session of client.activeSessions.value" :label="`Session ${session.id}`" :value="session.id"/>
        </select>
        <generic-button colour="blue" title="Refresh Current Sessions" @click="props.client.sendMessage('getActiveSessions', {channelId: client.user!.id})">
          <icon name="mdi:sync" class="text-xl inline align-middle -mx-4 translate-x-1.5"/>
        </generic-button>
      </div>
    </div>
    <div class="w-fit flex flex-col gap-2">
      <div class="text-xl text-primary">Selected Session</div>
      <div class="flex flex-row flex-wrap gap-4" v-if="selectionSession()" >
        <div class="h-fit">Sources:</div>
        <div v-for="source of selectionSession()!.sources" class="codeblock">{{source}}</div>
      </div>
      <div class="">ID: <span v-if="selectionSession()" class="codeblock">{{selectionSession()!.id}}</span></div>
      <div class="">Creation Date/Time: <span v-if="selectionSession()" class="codeblock">{{String(selectionSession()!.startTime).replace("T", " ").replace("Z", "").replaceAll('"', '')}}</span></div>
      <div class="flex flex-row flex-wrap gap-4" v-if="selectionSession()" >
        <div class="h-fit">Participating Channels:</div>
        <twitch-channel-widget v-for="channel of selectionSession()!.channels" :client="client" :channel-id="channel"/>
      </div>
    </div>
    <template v-slot:footer>
      <div class="grow"/>
      <generic-button colour="green" @click="saveAndClose">
        Apply
      </generic-button>
    </template>
  </modal-template>
</template>

<style scoped>

</style>