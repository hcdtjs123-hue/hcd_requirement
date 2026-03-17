<template>
  <RouterView />
  <AppToastProvider />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router"

import AppToastProvider from "@/presentation/components/feedback/AppToastProvider.vue"
</script>
