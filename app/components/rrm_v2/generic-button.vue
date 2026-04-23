<script setup lang="ts">
const buttonClasses: Record<string, Array<string>> = {
  blue: ["outline-blue-600", "hover:bg-blue-800", "text-blue-400", "hover:text-blue-200"],
  yellow: ["outline-yellow-600", "hover:bg-yellow-800", "text-yellow-400", "hover:text-yellow-200"],
  red: ["outline-red-600", "hover:bg-red-800", "text-red-400", "hover:text-red-200"],
  green: ["outline-green-600", "hover:bg-green-600", "text-green-400", "hover:text-green-200"],
  purple: ["outline-purple-900", "hover:bg-purple-950", "text-purple-700", "hover:text-white", "hover:outline-purple-400"],
  neutral: ["outline-neutral-600", "hover:bg-neutral-700", "text-neutral-400", "hover:text-neutral-200"]
}
const props = defineProps({
  disabled: {
    type: Boolean,
    required: false,
  },
  colour: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: false,
  }
})
const button = useTemplateRef("button")
let colour = "neutral"

onMounted(async () => {
  await updateColour()
})

watch(props, async (newValue, oldValue) => {
  await updateColour()
})

async function updateColour() {
  buttonClasses[colour]!.forEach(style => {
    button.value!.classList.remove(style)
  })

  if (!colour || !Object.keys(buttonClasses).includes(colour) || props.disabled) {
    colour = "neutral"
  } else {
    colour = props.colour
  }

  buttonClasses[colour]!.forEach(style => {
    button.value!.classList.add(style)
  })
}
</script>

<template>
  <div ref="button" class="py-1 px-4 hover:outline-2 bg-neutral-900 outline transition-all duration-200 cursor-pointer rounded flex flex-row items-center gap-2 disabled:outline-neutral-600 disabled:hover:bg-neutral-700 disabled:text-neutral-400 disabled:hover:text-neutral-200 disabled:cursor-not-allowed">
    <slot></slot>
  </div>
</template>

<style scoped>

</style>