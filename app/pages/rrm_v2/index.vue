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

let version = ref("2.1.0")
const { loggedIn, user, session, fetch, clear, openInPopup } = useUserSession()
let modalManager = useModalManager()
let client = usePanelClient(modalManager)

onMounted(async () => {
  await modalManager.onMounted()
  if (loggedIn && user.value) {
    client.user = user.value
    await client.connectToServer(user.value.id)
  }
})

onBeforeUnmount(async () => {
  await client.disconnectFromServer()
})
</script>

<template>
  <div class="fixed top-0 z-30 bg-neutral-800 stripes w-full h-10 flex flex-row divide-x divide-neutral-700">
    <toolbar-button @click="navigateTo('/')" title="Return to Home">
      <!--  WHERE DID THIS EVEN GO???  -->
      <icon name="mdi:home-outline" class="text-xl inline align-middle"/>
    </toolbar-button>
    <button disabled class="px-4 text-primary font-bold border-b border-b-neutral-500">
      Rami Request Manager <span class="new-codeblock text-neutral-400">{{version}}</span>
    </button>
    <toolbar-button v-if="loggedIn && client.isConnected.value" @click="modalManager.showModal('Manage Sessions', SessionManagerModal, {client})">
      Sessions
    </toolbar-button>

    <div class="grow border-b border-b-neutral-500"/>
    <button disabled class="px-4 border-b border-b-neutral-500" title="Millisecond delay on Upload/Download. (Ping)">
      <div
          class="inline-block new-codeblock w-40 text-neutral-400"
          :class="{
        'text-amber-400': client.pingUpload.value > 200 || client.pingDownload.value > 200,
        'text-red-400': client.pingUpload.value > 400 || client.pingDownload.value > 400,
      }">
        {{client.pingUpload}} <icon name="mdi:upload" class="translate-0.5"/>
        {{client.pingDownload}} <icon name="mdi:download" class="translate-0.5"/>
      </div>
    </button>
    <toolbar-button
        v-if="user"
        @click="modalManager.showModal('Twitch User Account', TwitchAccountModal, {client, loggedIn, user, clear})"
        title="View Account"
    >
      <img :src="user.profile_image_url" class="size-6 inline align-middle rounded mr-1"/>{{user.display_name}}
    </toolbar-button>
  </div>
  <div class="mt-10 flex flex-col w-full h-full">
    <div v-if="loggedIn && client.isConnected.value" class="w-full h-full flex flex-row p-4 gap-4">
      <div class="basis-3/5 h-full">
        <request-queue-widget :client="client"  :modal-manager="modalManager"/>
      </div>
      <div class="basis-2/5 flex flex-col gap-4">
        <!--  TWITCH STREAM EMBED WIDGET - Just for you ben :3  -->
        <control-category-widget header="Stream Preview">
          <twitch-player-widget v-show="client.isCurrentSessionValid"/>
          <div v-show="!client.isCurrentSessionValid" class="size-10 block"/>
        </control-category-widget>
        <!--  SESSION INFO WIDGET  -->
        <control-category-widget header="Session Info">
          <div class="w-full flex flex-col gap-4" v-if="client.isCurrentSessionValid.value">
            <div class="flex flex-row flex-wrap gap-2">Uptime: <duration-embed :seconds="client.getUptime.value" longform/></div>
            <div class="flex flex-row flex-wrap gap-2">
              <div class="h-fit">Sources:</div>
              <div v-for="source of client.getCurrentSession.value?.sources" class="new-codeblock">{{source}}</div>
            </div>
            <div class="flex flex-row flex-wrap gap-4">
              <div class="h-fit">Participating Channels:</div>
              <twitch-channel-widget v-for="channel of client.getCurrentSession.value?.channels" :client="client" :channel-id="channel"/>
            </div>
            <div class="flex flex-row flex-wrap gap-4">

              <generic-button colour="yellow" @click="modalManager.showModal('Add a Request', RequestCreationModal, {client})">
                <icon name="mdi:plus" class="text-lg -ml-1"/>Add Request
              </generic-button>

              <generic-button colour="blue" @click="client.sendMessage('updatePosition', {index: client.getCurrentSession.value!.position + 1})">
                <icon name="mdi:chevron-triple-right" class="text-lg -ml-1"/>Next Request
              </generic-button>

              <div class="grow"/>

              <generic-button colour="red" @click="client.sendMessage('updateSessionState', {
              sessionId: client.currentSessionId.value,
              open: 'Closed'
              })">
                <icon name="mdi:alert-octagon-outline" class="text-lg -ml-1"/>End Session
              </generic-button>

            </div>
          </div>
          <!--  PLACEHOLDER WHEN NO SESSION  -->
          <div v-else class="text-2xl text-neutral-400 italic w-full text-center">
              No Session selected.
          </div>
        </control-category-widget>
      </div>
    </div>
    <!--  PRE-LOGIN AND LOADING SCREEN  -->
    <div v-else class="flex flex-col gap-2 bg-neutral-800 m-4 p-4 border-2 border-neutral-700 rounded h-fit w-fit justify-self-center place-self-center justify-center items-center content-center text-center text-2xl text-neutral-400">
      <div class="text-2xl text-primary">Rami Request Manager</div>
      <div>Version: <span class="codeblock">{{version}}</span></div>
      <!--  PLACEHOLDER WHILE LOADING  -->
      <div v-if="loggedIn" class="flex flex-col gap-2">
        <div class="text-secondary">Loading...</div>
        <div class="italic">Please wait</div>
      </div>
      <!--  FORCE USER TO LOGIN TO TWITCH  -->
      <div v-else class="flex flex-col gap-2">
        <div class="text-secondary">Welcome!</div>
        <div class="italic">To begin, please sign in...</div>
        <generic-button colour="purple" @click="navigateTo('/api/rrm_v2/auth', {external: true})">
          <icon name="mdi:twitch"/>
          Log In via Twitch
        </generic-button>
      </div>
    </div>
  </div>
</template>