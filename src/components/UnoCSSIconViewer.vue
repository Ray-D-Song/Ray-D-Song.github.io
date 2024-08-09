<script setup lang="ts">
import { icons } from '@iconify-json/fe/index.js'

const iconNames = Object.keys(icons.icons).slice(0, 30)
</script>

<template>
  <div class="dark:bg-[#181818] bg-[#ffffff] w-full h-40 rounded-lg overflow-y-scroll">
    <div class="grid grid-cols-6 gap-4">
      <template v-for="icon in iconNames">
        <div class="flex flex-col items-center justify-center cursor-pointer p-4px dark:hover:bg-[#2A2A2A] hover:bg-[#EBEAEA]">
          <div :class="`i-${icons.prefix}-${icon}`" class="mb-2px" />
          <div class="text-xs text-center">{{ icon }}</div>
        </div>
      </template>
    </div>
  </div>
</template>