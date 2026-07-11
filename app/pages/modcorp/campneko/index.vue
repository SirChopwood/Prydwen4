<script setup lang="ts">
definePageMeta({
  title: "Camp Neko Overlay",
  layout: "blank"
})
useSeoMeta({
  title: "Camp Neko Overlay",
  ogTitle: "Camp Neko Overlay",
  description: "The overlay for the Camp Neko event.",
  ogDescription: "The overlay for the Camp Neko event.",
  ogImage: `https://louismayes.xyz/images/modcorp/campneko/MimiSword.png`,
  twitterImage: `https://louismayes.xyz/images/modcorp/campneko/MimiSword.png`,
  twitterCard: 'summary_large_image',
  author: "Camp Neko Overlay",
})

let overlayData: Ref<{
  bossBar: {
    mode: "None" | "HP" | "Puzzle"
    percentages: Record<string, number>
  },
  messages: {
    announcement?: string,
    title?: string,
    subtitle?: string,
  }
  timer: {
    mode: "None" | "Encounter" | "Paused"
    start?: number,
    end?: number
  }
}> = ref({
  bossBar: {
    mode: "None",
    percentages: {}
  },
  messages: {
  },
  timer: {
    mode: "None"
  }
})
type TeamData = {
  id: number,
  active: number,
  name: string,
  description: string,
  colour: string,
  logo_url: string,
  icon_url: string,
  score: number,
  guild: string,
  channel: string,
  role: string,
}
let teamsData: Ref<Array<TeamData>> = ref([])
let MimiContainer = useTemplateRef("MimiContainer")
let MimiTypes = ["Bag", "Shield", "Sword"]

let currentTeamIndex = ref(0)
function getCurrentTeam() {
  return teamsData.value[currentTeamIndex.value]
}
function getCurrentScore() {
  return String(getCurrentTeam()!.score).padStart(4, "0")
}
function getTeamById(id: number) {
  for (let team of teamsData.value) {
    if (team.id === id) {
      return team
    }
  }
}

onMounted(() => {
  let teamCycleTimer = setInterval(() => {
    currentTeamIndex.value = (currentTeamIndex.value + 1) % teamsData.value.length || 0
    console.log(currentTeamIndex.value)
  }, 4000)
  let refreshTimer = setInterval(async () => {
    await updateOverlayData()
    await updateTeamData()
  }, 5000)
})

let updateTimer: NodeJS.Timeout
let timerRemainder = ref<{
  total: number,
  ms: number,
  s: number,
  m: number,
  h: number,
  d: number,
}>({total: 0, ms: 0,s: 0,m: 0,h: 0,d: 0})
let previousTimes = {start: 0, end: 0}
function setTimer(start: number, end: number) {
  if (previousTimes.start === start && previousTimes.end === end ) {
    return
  }
  previousTimes = {start: start, end: end}

  if (updateTimer) {
    clearInterval(updateTimer)
  }
  let ms = end - start
  // Reset Anim
  console.log("reset")
  MimiContainer.value!.classList.remove("mimibox")

  updateTimer = setInterval(() => {
    // Get today's date and time
    let now = new Date().getTime();
    // Find the distance between now and the count down date
    let distance = end - now;
    // Time calculations for days, hours, minutes and seconds
    let days = Math.floor(distance / (1000 * 60 * 60 * 24));
    let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    let seconds = Math.floor((distance % (1000 * 60)) / 1000);

    timerRemainder.value = {
      total: ms,
      ms: distance,
      s: seconds,
      m: minutes,
      h: hours,
      d: days
    }

    // If the count down is finished, write some text
    if (distance < 0) {
      clearInterval(updateTimer);
    }
  }, 1000)

  console.log("animation")
  MimiContainer.value!.classList.add("mimibox")
  MimiContainer.value!.style.animationDuration = `${ms}ms `
  setTimeout(async () => {
    console.log("reset")
    MimiContainer.value!.classList.remove("mimibox")
    clearInterval(updateTimer)
    previousTimes = {start: 0, end: 0}
  }, ms)
}

async function updateOverlayData() {
  let res = await fetch(`/api/raids_v2/raid/fetch`, {
    method: "POST",
    body: JSON.stringify({}),
    headers: {"Content-type": "application/json"}
  })
  if (res.ok) {
    let data = await res.json()
    if (data.length > 0 && data[0]) {
      overlayData.value = data[0].overlayData
      if (overlayData.value.timer.mode === "Encounter" && overlayData.value.timer.start && overlayData.value.timer.end) {
        setTimer(overlayData.value.timer.start, overlayData.value.timer.end)
      }
    } else {
      overlayData.value = {
        bossBar: {
          mode: "None",
          percentages: {}
        },
        messages: {
        },
        timer: {
          mode: "None"
        }
      }
    }
  }
}

async function updateTeamData() {
  let res = await fetch(`/api/teams_v2/team/fetch`, {
    method: "POST",
    body: JSON.stringify({team_ids: []}),
    headers: {"Content-type": "application/json"}
  })
  if (res.ok) {
    let data = await res.json()
    if (data.length > 0) {
      teamsData.value = data
    }
  }
}
</script>

<template>
  <div class="font-sourgummy" v-if="overlayData.bossBar && overlayData.messages && overlayData.timer">
    <transition name="bossbar">
      <div ref="BossBar" v-if="overlayData.bossBar.mode === 'HP'" class="fixed top-0 left-0 right-0 h-32">
        <transition-group name="bossbarsegments" tag="div" class="absolute top-8 left-8 right-8 h-7 -z-20 flex flex-row bg-neutral-800">
          <div v-for="key of Object.keys(overlayData.bossBar.percentages)" :key="key" class="h-full relative" :style="'width: ' + overlayData.bossBar.percentages[key] + '%; background-color: ' + getTeamById(Number(key))!.colour + ';'">
            <nuxt-img :src="'/images/modcorp/campneko/Branch'+getTeamById(Number(key))!.name+'.png'" class="absolute right-0 size-32 max-w-32 -mr-12"/>
          </div>
        </transition-group>
        <nuxt-img src="/images/modcorp/campneko/BossBar.png" class="w-full z-50"/>
      </div>
    </transition>
    <transition name="timer">
      <div ref="Timer" v-if="overlayData.timer.mode !== 'None'" class="fixed bottom-0 left-0 w-60 h-40">
        <nuxt-img src="/images/modcorp/campneko/TimerBackground.png" class="absolute bottom-0 left-0"/>
        <div v-if="timerRemainder.ms > 0" class="text-white text-5xl">
          {{timerRemainder.m}} : {{timerRemainder.s}}
        </div>
      </div>
    </transition>
    <transition name="scoreboard">
      <div ref="Scoreboard" v-if="getCurrentTeam()" class="fixed bottom-0 right-0 w-96 h-52">
        <nuxt-img src="/images/modcorp/campneko/ScoreboardBackground2.png" class="absolute bottom-0 right-0"/>
        <div class="absolute top-16 -mt-1 right-6 w-28 h-8 -skew-x-12 opacity-80 text-center text-2xl content-center" :style="'color: '+getCurrentTeam()!.colour">
          {{getCurrentTeam()!.name}}
        </div>
        <img :src="getCurrentTeam()!.icon_url" class="absolute bottom-3 left-2 size-5 skew-y-6 -skew-x-12 opacity-80"/>
        <div class="font-playpen text-7xl text-white -skew-x-6 absolute bottom-3 right-72 -mr-1">{{getCurrentScore()[0]}}</div>
        <div class="font-playpen text-7xl text-white -skew-x-6 absolute bottom-2 right-48">{{getCurrentScore()[1]}}</div>
        <div class="font-playpen text-7xl text-white -skew-x-6 absolute bottom-1 right-28 -mr-1">{{getCurrentScore()[2]}}</div>
        <div class="font-playpen text-7xl text-white -skew-x-6 absolute bottom-0 right-4">{{getCurrentScore()[3]}}</div>
      </div>
    </transition>
<!--    <transition name="scoreboard">-->
<!--      <div ref="Scoreboard" v-if="getCurrentTeam()" class="fixed bottom-0 right-0 w-60 h-52">-->
<!--        <nuxt-img src="/images/modcorp/campneko/ScoreboardBackground.png" class="absolute bottom-0 right-0"/>-->
<!--        <img :src="getCurrentTeam()!.logo_url" class="absolute top-2 right-6 size-12 skew-y-6 -skew-x-12 opacity-80"/>-->
<!--        <div class="font-playpen text-7xl text-white -skew-x-6 absolute bottom-2 right-32">{{getCurrentScore()[0]}}</div>-->
<!--        <div class="font-playpen text-7xl text-white -skew-x-6 absolute bottom-2 right-6">{{getCurrentScore()[1]}}</div>-->
<!--      </div>-->
<!--    </transition>-->
    <transition name="mimis">
      <div ref="Mimis" v-show="overlayData.timer.mode !== 'None'" class="fixed bottom-0 left-64 right-64 h-32">
        <nuxt-img src="/images/modcorp/campneko/MimiStart.png" class="absolute bottom-0 left-0 h-32"/>
        <nuxt-img src="/images/modcorp/campneko/MimiEnd.png" class="absolute bottom-0 right-0 h-32"/>
        <div class="absolute bottom-0 left-12 right-14 h-24">
          <div ref="MimiContainer" class="absolute top-0 flex flex-row w-fit h-full -translate-x-1/2 shrink-0">
            <div v-for="mimi of MimiTypes">
              <nuxt-img :src="'/images/modcorp/campneko/Mimi' + mimi + '.png'" :class="'w-20 min-w-20 -mr-12 shrink-0 mimi' + mimi"/>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="titlebar">
      <div ref="TitleBar" v-if="overlayData.messages.title"  class="fixed top-1/4 left-40 right-40 h-32">
        <div class="absolute left-1/2 -translate-x-1/2 flex flex-col justify-center align-center items-center banner py-4 px-8 w-fit">
          <div class="flex flex-row gap-4 justify-center items-center">
            <nuxt-img src="/images/modcorp/campneko/TitleDivider.png" class="h-6"/>
            <span class="text-5xl text-white font-lusitana text-nowrap">{{overlayData.messages.title}}</span>
            <nuxt-img src="/images/modcorp/campneko/TitleDivider.png" class="h-6 -scale-x-100"/>
          </div>
          <span class="text-lg text-white font-lusitana text-nowrap">{{overlayData.messages.subtitle}}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.mimiBag {
  animation: mimi-sway 4s cubic-bezier(0.25, 0.25, 0.25, 0.5) infinite;
  transform-origin: 60% bottom;
  animation-delay: 0.45s;
}
.mimiSword {
  animation: mimi-sway 3.5s cubic-bezier(0.25, 0.25, 0.25, 0.5) infinite;
  transform-origin: 60% bottom;
}
.mimiShield {
  animation: mimi-sway 4.2s cubic-bezier(0.25, 0.25, 0.25, 0.5) infinite;
  transform-origin: 60% bottom;
  animation-delay: 0.63s;
}

.mimibox {
  animation: mimi-walk forwards linear;
}

@keyframes mimi-walk {
  0% {
    left: 0
  }
  100% {
    left: 100%
  }
}

.banner {
  background-image: linear-gradient(to right, rgba(0,0,0,0), rgba(0,0,0,0.5), rgba(0,0,0,0));
}

@keyframes mimi-sway {
  0% {
    transform: rotate(0deg) translateY(8px);
  }
  20% {
    transform: rotate(8deg) translateY(2px);
  }
  40%{
    transform: rotate(10deg) translateY(7px);
  }
  60%{
    transform: rotate(-8deg) translateY(3px);
  }
  80% {
    transform: rotate(-10deg) translateY(10px);
  }
  100% {
    transform: rotate(0deg) translateY(8px);
  }
}

.titlebar-enter-active,
.titlebar-leave-active {
  transition: all 2s ease;
}

.titlebar-enter-from,
.titlebar-leave-to {
  opacity: 0;
  translate: 0 50%;
}


.bossbarsegments-move {
  transition: all 0.5s ease;
}
</style>