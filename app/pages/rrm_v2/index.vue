<script setup lang="ts">
import ToolbarButton from "~/components/rrm_v2/toolbar-button.vue";
import GenericButton from "~/components/rrm_v2/generic-button.vue";
import {usePanelClient} from "~/composables/rrm_v2";
import TwitchAccountModal from "~/components/rrm_v2/modals/twitch-account-modal.vue";
import SessionManagerModal from "~/components/rrm_v2/modals/session-manager-modal.vue";
import TwitchChannelWidget from "~/components/rrm_v2/widgets/twitch-channel-widget.vue";
import ControlCategoryWidget from "~/components/rrm_v2/widgets/control-category-widget.vue";
import RequestQueueWidget from "~/components/rrm_v2/widgets/request-queue-widget.vue";
import TwitchPlayerWidget from "~/components/rrm_v2/widgets/twitch-player-widget.vue";
import {onBeforeUnmount} from "#imports";
import DurationEmbed from "~/components/rrm_v2/duration-embed.vue";
import RequestCreationModal from "~/components/rrm_v2/modals/request-creation-modal.vue";


definePageMeta({
  title: "Rami Request Manager V2",
  layout: "panel"
})
useSeoMeta({
  title: "Rami Request Manager V2",
  ogTitle: "Rami Request Manager V2",
  description: "A twitch panel and overlay for managing chat based interaction, such as song requests for DJs.",
  ogDescription: "A twitch panel and overlay for managing chat based interaction, such as song requests for DJs.",
  ogImage: `https://louismayes.xyz/images/projects/external/rrm.png`,
  twitterImage: `https://louismayes.xyz/images/projects/external/rrm.png`,
  twitterCard: 'summary_large_image',
  author: "Ramiris"
})

const { loggedIn, user, session, fetch, clear, openInPopup } = useUserSession()
let modalManager = useModalManager()
let client = usePanelClient(modalManager)

watch(client.getUptime, (value, oldValue) => {
  console.log("CURRENT UPTIME", value, oldValue)
})

onMounted(async () => {
  await modalManager.onMounted()
  await client.connectToServer()
  if (loggedIn && user.value) {
    client.userId = user.value.id
  }
})

onBeforeUnmount(async () => {
  await client.disconnectFromServer()
})
</script>

<template>
  <div class="fixed top-0 z-30 bg-neutral-800 stripes w-full h-10 flex flex-row divide-x divide-neutral-700">
    <toolbar-button @click="navigateTo('/')" title="Return to Home">
      <icon name="mdi:home-outline" class="text-xl inline align-middle"/>
    </toolbar-button>
    <button disabled class="px-4 text-primary font-bold border-b border-b-neutral-500">
      Rami Request Manager <span class="codeblock">2.0.0</span>
    </button>
    <toolbar-button v-if="loggedIn && client.isConnected" @click="modalManager.showModal('Manage Sessions', SessionManagerModal, {client})">
      Sessions
    </toolbar-button>

    <div class="grow border-b border-b-neutral-500"/>

    <toolbar-button
        v-if="user"
        @click="modalManager.showModal('Twitch User Account', TwitchAccountModal, {client, loggedIn, user, clear})"
        title="View Account"
    >
      <img :src="user.profile_image_url" class="size-6 inline align-middle rounded mr-1"/>{{user.display_name}}
    </toolbar-button>
  </div>
  <div class="mt-10 flex flex-col w-full h-full">
    <div v-if="loggedIn && client.isConnected" class="w-full h-full flex flex-row p-4 gap-4">
      <div class="basis-3/5 h-full">
        <request-queue-widget :client="client"  :modal-manager="modalManager"/>
      </div>
      <div class="basis-2/5 flex flex-col gap-4">
        <control-category-widget header="Stream Preview">
          <twitch-player-widget/>
        </control-category-widget>
        <control-category-widget header="Session Info">
          <div class="w-full flex flex-col gap-4" v-if="client.getCurrentSession.value">
            <div class="flex flex-row flex-wrap gap-2">Uptime {{client.getUptime.value}} <duration-embed :seconds="client.getUptime.value"/></div>
            <div class="flex flex-row flex-wrap gap-2">
              <div class="h-fit">Sources:</div>
              <div v-for="source of client.getCurrentSession.value?.sources" class="codeblock">{{source}}</div>
            </div>
            <div class="flex flex-row flex-wrap gap-4">
              <div class="h-fit">Participating Channels:</div>
              <twitch-channel-widget v-for="channel of client.getCurrentSession.value?.channels" :client="client" :channel-id="channel"/>
            </div>
            <div class="flex flex-row flex-wrap gap-4">
              <generic-button colour="yellow" @click="modalManager.showModal('Add a Request', RequestCreationModal, {client})"><icon name="mdi:plus" class="text-lg -ml-1"/>Add Request</generic-button>
              <generic-button colour="blue" @click="client.sendMessage('updatePosition', {index: client.getCurrentSession.value.position + 1})"><icon name="mdi:chevron-triple-right" class="text-lg -ml-1"/>Next Request</generic-button>
              <div class="grow"/>
              <generic-button colour="red" @click="client.sendMessage('updateSessionState', {
              sessionId: client.currentSessionId.value,
              open: 'Closed'
              })"><icon name="mdi:alert-octagon-outline" class="text-lg -ml-1"/>End Session</generic-button>
            </div>
          </div>
        </control-category-widget>
      </div>
    </div>
    <div v-if="!loggedIn" class="flex flex-col gap-2 bg-neutral-800 m-4 border-2 border-red-900 rounded h-96 justify-center items-center content-center">
      <div class="text-2xl text-primary">Rami Request Manager</div>
      <div>Version: <span class="codeblock">2.0.0</span></div>
      To begin, please sign in to Twitch using the button below.
      <generic-button colour="purple" @click="navigateTo('/api/rrm_v2/auth', {external: true})">
        <icon name="mdi:twitch"/>
        Log In via Twitch
      </generic-button>
    </div>
  </div>
</template>