<script setup lang="ts">
import RequestQueueItemWidget from "~/components/rrm_v2/widgets/request-queue-item-widget.vue";

const props = defineProps({
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

watch(props.client?.getCurrentSession, async (newValue, oldValue) => {
  if (newValue) {
    desiredRequestState.value = newValue.requestState
  }
})

let desiredRequestState: Ref<string> = ref("Locked")

watch(desiredRequestState, async (newValue, oldValue) => {
  if (newValue === props.client?.getCurrentSession.value?.requestState) {
    return
  }
  await props.client?.sendMessage("updateRequestState", {
    sessionId: props.client?.currentSessionId.value,
    enabled: newValue
  })
})
</script>

<template>
  <div class="border border-neutral-700 drop-shadow-2xl rounded flex flex-col">
    <div class="stripes-secondary rounded-t p-2 flex flex-row text-2xl font-jetbrains gap-2">
      <div>Request Queue</div>
      <div class="grow"/>
      <div v-if="client.isCurrentSessionValid.value" class="flex flex-row gap-2 items-center text-xl codeblock text-white pl-2">
        <icon v-if="client.getCurrentSession.value!.requestState !== desiredRequestState" name="mdi:loading" class="animate-spin" title="Processing..."/>
        <icon v-else-if="client.getCurrentSession.value!.requestState === 'Locked'" name="mdi:lock" title="Queue Locked"/>
        <icon v-else name="mdi:lock-open-variant" title="Queue Unlocked"/>
        <select v-model="desiredRequestState" class="min-w-40 py-0.5 bg-neutral-800">
          <option class="text-green-500" label="Unlocked" value="Unlocked"/>
          <option class="text-red-500" label="Locked" value="Locked"/>
        </select>
      </div>
    </div>
    <div class="mx-2 relative rounded-b bg-neutral-950 border border-t-0 border-fuchsia-950">
      <div v-if="client.isCurrentSessionValid.value && client.getCurrentRequestQueue.value.length > 0" class="text-sm font-jetbrains py-0.5 px-1">
        Currently playing request <span class="text-secondary">{{client.getCurrentSession.value!.position + 1}}</span> out of <span class="text-secondary">{{client.getCurrentSession.value!.requests.length}}</span> total.
      </div>
    </div>
    <div ref="scrollBox" class="flex flex-col gap-2 p-2 h-full">
      <div
          v-if="!client.isCurrentSessionValid.value"
          class="text-2xl text-neutral-400 italic w-full text-center"
      >
        No Session selected.
      </div>
      <div
          v-else-if="client.getCurrentRequestQueue.value.length === 0"
          class="text-2xl text-neutral-400 italic w-full text-center"
      >
        It looks a little empty in here... A few requests should fill it right up!
      </div>
      <request-queue-item-widget
          v-else
          v-for="requestIndex of Object.keys(client.getCurrentRequestQueue.value)"
          :client="client"
          :item="client.getCurrentRequestQueue.value[Number(requestIndex)]"
          :index="Number(requestIndex)"
          :modal-manager="modalManager"
      />
    </div>
  </div>
</template>

<style scoped>

</style>