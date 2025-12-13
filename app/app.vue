<script lang="ts" setup>
useHead({
  title: "Loading...",
  titleTemplate: "%s - Louis Mayes"
})
useSeoMeta({
  title: 'Home',
  ogTitle: 'Home',

  description: "Welcome to my portfolio! Browse my projects and see what I've been up to.",
  ogDescription: "Welcome to my portfolio! Browse my projects and see what I've been up to.",

  ogImage: `https://louismayes.xyz/images/misc/banner.png`,
  ogImageUrl: `https://louismayes.xyz/images/misc/banner.png`,
  twitterImage: `https://louismayes.xyz/images/misc/banner.png`,

  twitterCard: 'summary_large_image',
  themeColor: "#ffcc00",

  author: "Louis Mayes"
})
</script>

<template>
  <div class="font-cabin h-full">
      <NuxtLayout>
          <div>
            <NuxtRouteAnnouncer/>
          </div>
          <NuxtPage />
      </NuxtLayout>
    </div>
</template>

<style>
@reference "./assets/css/tailwind.css";

html {
  @apply scrollbar scrollbar-thumb-neutral-700 scrollbar-track-neutral-900 scrollbar-corner-neutral-800 scroll-pt-8 scroll-smooth;
}
</style>