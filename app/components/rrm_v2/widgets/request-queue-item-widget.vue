<script setup lang="ts">
import RequestInfoModal from "~/components/rrm_v2/modals/request-info-modal.vue";

const props = defineProps({
  client: {
    type: RRM_V2_PanelClient,
    required: true
  },
  modalManager: {
    type: Object as PropType<ModalManager>,
    default: {},
    required: true
  },
  item: {
    //@ts-ignore
    type: Object as PropType<schema.RRM_V2_Requests.$inferSelect>,
    required: true,
  },
  index: {
    type: Number,
    required: true
  }
})

let selected = computed(() => {
  if (props.client.getCurrentSession.value) {
    return props.client.getCurrentSession.value!.position === Number(props.index)
  }
  return false
})

let isFirst = computed(() => {
  return props.index === 0
})

let isLast = computed(() => {
  if (props.client.getCurrentSession.value) {
    return props.index >= props.client.getCurrentSession.value.requests.length - 1
  }
  return false
})

async function copyCodeToClipboard() {
  await navigator.clipboard.writeText(props.item.code)
}

async function playNow() {
  props.client.sendMessage("updatePosition", {index: props.index})
}

async function moveUp() {
  props.client.sendMessage("moveRequest", {oldIndex: props.index, newIndex: props.index - 1})
}

async function moveDown() {
  props.client.sendMessage("moveRequest", {oldIndex: props.index, newIndex: props.index + 1})
}

async function removeRequest() {
  props.client.sendMessage("removeRequest", {index: props.index})
}

async function openInfoModal() {
  props.modalManager.showModal("Request Info", RequestInfoModal, {request: props.item, sourceText: getSourceText()})
}

function getCodeText() {
  switch (props.item.metadata['Source']) {
    case "YouTube":
      return `URL`
    case "PyPy":
      return props.item.code
    default:
      return props.item.code
  }
}

function getSourceText() {
  switch (props.item.metadata['Source']) {
    case "YouTube":
      return `${props.item.metadata['Channel']} [YouTube]`
    case "PyPy":
      return `${props.item.metadata['Channel']} [PyPy]`
    case "PlainText":
      return `Plain Text Message`
    default:
      return "Unknown"
  }
}
</script>

<template>
  <div class="group flex flex-col transition-all duration-200">
    <div class="relative bg-neutral-900 group-hover:bg-neutral-800 w-full flex flex-row rounded border overflow-clip drop-shadow-2xl" :class="{
      'border-primary': selected,
      'h-24': selected,
      'border-neutral-700': !selected,
      'group-hover:border-neutral-600': !selected
    }">
      <div class="grow flex flex-col p-1">
        <div class="text-primary" :class="{
        'text-2xl': selected,
        'text-lg': !selected
        }">
          {{item.text}}
        </div>
        <div class="flex flex-row gap-2 divide-neutral-700 divide-x *:pr-2">
          <div>
            Requested by <span class="text-secondary">{{item.user}}</span>
          </div>
          <div>
            Source: <span class="text-secondary">{{getSourceText()}}</span>
          </div>
          <div v-if="!selected">
            Code: <span @click="copyCodeToClipboard" title="Click to Copy" class="text-sm codeblock w-fit inline-block hover:text-white hover:cursor-copy">{{getCodeText()}}</span>
          </div>
        </div>
        <div v-if="selected">
          Code: <span @click="copyCodeToClipboard" class="text-sm codeblock w-fit inline-block hover:text-white hover:cursor-copy">{{item.code}}</span>
        </div>
      </div>
      <div class="flex flex-row gap-4 p-1 h-fit text-2xl bg-black/70 rounded-bl drop-shadow transition-all duration-200 opacity-0 group-hover:opacity-100">
        <div class="flex flex-row gap-1 *:text-white/0 *:group-hover:text-white/50 *:hover:text-white *:hover:cursor-pointer">
          <icon title="Play Now" @click="playNow" name="mdi:play"/>
        </div>
        <div class="flex flex-row gap-1 *:text-white/0 *:group-hover:text-white/50 *:hover:text-white *:hover:cursor-pointer">
          <icon v-if="!isFirst" title="Move Up" @click="moveUp" name="mdi:arrow-up-bold"/>
          <icon v-else name="mdi:arrow-up-bold" class="text-neutral-700! cursor-default!"/>
          <icon v-if="!isLast" title="Move Down" @click="moveDown" name="mdi:arrow-down-bold"/>
          <icon v-else name="mdi:arrow-down-bold" class="text-neutral-700! cursor-default!"/>
        </div>
        <div class="flex flex-row gap-1 *:text-white/0 *:group-hover:text-white/50 *:hover:text-white *:hover:cursor-pointer">
          <icon title="Show Info" @click="openInfoModal" name="mdi:database-search"/>
          <icon title="Remove" @click="removeRequest" name="mdi:delete-forever"/>
        </div>
      </div>
      <nuxt-img v-if="item.metadata['Thumbnail']" :src="item.metadata['Thumbnail']" class="-z-10 absolute top-1/2 -translate-y-1/2 right-0 w-1/3 image-opacity-gradient"/>
    </div>
    <div v-if="selected" class="mx-2 relative rounded-b overflow-clip">
      <div class="absolute inset-0 w-full h-full stripes-scroller -z-10 bg-repeat"/>
      <div class="w-full text-sm text-center self-center justify-self-center text-primary italic">
        - Currently Playing -
      </div>
    </div>
  </div>
</template>

<style scoped>
.image-opacity-gradient {
  mask-image: linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0));
}
</style>