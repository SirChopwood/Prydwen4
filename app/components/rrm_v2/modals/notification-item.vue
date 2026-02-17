<script setup lang="ts">
const props = defineProps({
  uid: {
    required: true,
    type: String
  },
  title: {
    required: true,
    type: String
  },
  colour: {
    required: true,
    type: String
  },
  message: {
    required: true,
    type: String
  },
  modalManager: {
    type: Object as PropType<ModalManager>,
    default: {},
    required: true
  }
})

onMounted(() => {
  setTimeout(() => {
    props.modalManager.hideNotification(props.uid)
  }, 5100)
})
</script>

<template>
  <div class="text-neutral-200 text-sm font-cabin bg-neutral-900 rounded-sm flex flex-col w-fit h-fit drop-shadow-md shadow notification-anim">
    <div class="rounded-t stripes w-full px-1 flex flex-row drop-shadow-md shadow border-neutral-700 border border-b-0">
      <div class="grow text-primary text-base font-jetbrains">{{title}}</div>
    </div>
    <div class="bg-neutral-900 px-1 border border-neutral-700 border-t-0 rounded-b">
      {{message}}
    </div>
  </div>
</template>

<style scoped>
.notification-anim {
  animation-name: notification;
  animation-duration: 5s;
  animation-direction: normal;
  animation-timing-function: ease-in-out;
  animation-fill-mode: forwards;
}

@keyframes notification {
  0% {
    translate: 0 100%;
    opacity: 0;
  }
  10% {
    translate: 0 0;
    opacity: 0.9;
  }
  90% {
    translate: 0 0;
    opacity: 0.9;
  }
  100% {
    translate: 100% 0;
    opacity: 0;
  }
}
</style>