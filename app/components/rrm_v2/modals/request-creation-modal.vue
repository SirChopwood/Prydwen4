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

let disabledControls: Ref<boolean> = ref(true)
let inputCode: Ref<string> = ref("")
let codeArray = computed(() => {
  let inputCodes = inputCode.value.split(",")
  let outputCodes = []

  for (let code of inputCodes) {
    if (code !== "") {
      outputCodes.push(code)
    }
  }
  return outputCodes
})

onMounted(async () => {
  disabledControls.value = false
})

let sessionValid = computed(() => {
  return (inputCode.value !== "")
})

async function createRequest() {
  if (!sessionValid.value) {return}

  await props.client.sendMessage('createRequest', {
    hostId: props.client.userId,
    codes: codeArray.value,
  })
  await props.modalManager.hideModal(props.name)
}
</script>

<template>
  <modal-template :name="name" :modal-manager="modalManager">
    <div class="flex flex-col gap-2">
      <div>Please enter your request below.</div>
      <div class="border-l-2 border-l-neutral-400 pl-2 italic text-neutral-400">RRM will automatically try to parse what you type and add it to the queue.</div>
      <div class="border-l-2 border-l-neutral-400 pl-2 italic text-neutral-400">Tip: You can use commas <span class="codeblock">,</span> to add multiple entries at once.</div>
      <input type="text" v-model="inputCode" class="appearance-none w-full p-1 bg-neutral-950 border-neutral-700 border rounded active:ring-0 active:outline-0 focus:ring-0 focus:outline-0 focus:border-secondary hover:border-secondary transition-all duration-200"/>
    </div>
    <template v-slot:footer>
      <div class="grow"/>
      <generic-button :colour="sessionValid ? 'green' : 'neutral'" @click="createRequest()">
        Add {{codeArray.length > 1 ? codeArray.length : ""}} Request{{codeArray.length > 1 ? "s" : ""}}
      </generic-button>
    </template>
  </modal-template>
</template>

<style scoped>

</style>