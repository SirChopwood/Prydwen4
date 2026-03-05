<script setup lang="ts">
import ModalTemplate from "~/components/rrm_v2/modals/modal-template.vue";
import DurationEmbed from "~/components/rrm_v2/duration-embed.vue";

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
  request: {
    //@ts-ignore
    type: Object as PropType<schema.RRM_V2_Requests.$inferSelect>,
    required: true,
  },
  sourceText: {
    type: String,
    required: true,
  }
})

function getDuration() {
  let duration = props.request.metadata["Duration"]
  if (!duration) {return "N/A"}

  if (duration > 60) {
    let mins = Math.floor(duration/60)
    return `${mins}m ${duration - (mins * 60)}s`
  } else {
    return `${duration}s`
  }
}
</script>

<template>
  <modal-template :name="name" :modal-manager="modalManager" >
    <div class="flex flex-row w-full h-fit gap-4">
      <div class="flex flex-col p-1 gap-2 grow">
        <div class="text-xl text-primary">{{request.text}}</div>
        <div>Requested by <span class="text-neutral-400">{{request.user}}</span></div>
        <div>Source: <span class="text-neutral-400">{{sourceText}}</span></div>
        <div v-if="props.request.metadata['Group']">
          Group: <span class="text-neutral-400">{{props.request.metadata['Group']}}</span>
        </div>
        <div v-if="props.request.metadata['Duration']" class="flex flex-row flex-nowrap gap-1">
          <div>Duration: </div>
          <duration-embed :seconds="props.request.metadata['Duration']" class=""/>
        </div>
        <div>Code: <span class="new-codeblock w-fit inline-block">{{request.code}}</span></div>
      </div>
      <div class="h-40 bg-red-900 aspect-video rounded-sm">
        <nuxt-img v-if="request.metadata['Thumbnail']" :src="request.metadata['Thumbnail']" class="w-full h-full" placeholder/>
      </div>
    </div>
    <template v-slot:footer>
    </template>
  </modal-template>
</template>

<style scoped>

</style>