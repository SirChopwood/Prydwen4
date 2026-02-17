<script setup lang="ts">
</script>

<template>
  <div
      id="ModalBackground"
      class="flex place-content-center items-center justify-center content-center h-full w-full fixed top-0 left-0 bg-black/75 z-40 transition-all duration-500 opacity-0 pointer-events-none"
  >
    <div
        id="ModalContents"
        class="w-3/4 h-3/4 z-20"
    />
  </div>
  <div
    id="NotificationContainer"
    class="pointer-events-none w-80 top-32 bottom-24 fixed right-2 overflow-clip flex flex-col gap-2 p-1 justify-end items-end"
  />
</template>

<style scoped>
</style>