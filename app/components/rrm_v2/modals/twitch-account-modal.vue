<script setup lang="ts">
import ModalTemplate from "~/components/rrm_v2/modals/modal-template.vue";
import type {User, UserSessionComposable} from "#auth-utils";
import GenericButton from "~/components/rrm_v2/generic-button.vue";
import UserGroupsModal from "~/components/rrm_v2/modals/user-groups-modal.vue";

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
  },
  loggedIn: {
    type: Boolean,
    required: true
  },
  user: {
    type: Object as PropType<User>,
    required: true
  },
  clear: {
    type: Function,
    required: true
  }
})

async function logout() {
  props.clear()
  await props.modalManager.hideModal(props.name)
}
</script>

<template>
  <modal-template v-if="loggedIn" :name="name" :modal-manager="modalManager" >
    <div class="flex flex-row w-full h-fit">
      <div class="flex flex-col p-1 gap-2 grow">
        <div class="text-xl text-primary">{{user.display_name}}</div>
        <div class="italic wrap-normal max-w-80 text-sm"> {{ user.description }}</div>
        <div class="w-fit">ID: <span class="codeblock">{{user.id}}</span></div>
        <div class="">
          Creation Date/Time:
          <span class="codeblock size-fit">{{user.created_at.split("T")[0]}}</span>
          at
          <span class="codeblock size-fit">{{user.created_at.split("T")[1]!.replace("Z","")}}</span>
        </div>
      </div>
      <nuxt-img :src="user.profile_image_url" class="size-40 rounded-sm" placeholder/>
    </div>
    <template v-slot:footer>
      <generic-button colour="purple" @click="logout">
        Log out
      </generic-button>
      <generic-button colour="blue" @click="modalManager.showModal('User Groups', UserGroupsModal, {client})">
        View Groups
      </generic-button>
    </template>
  </modal-template>
  <modal-template v-else :name="name" :modal-manager="modalManager" >
    Please login to Twitch to see your account details.
  </modal-template>
</template>

<style scoped>

</style>