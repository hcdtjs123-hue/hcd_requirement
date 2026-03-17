<template>
  <div ref="rootEl" class="relative inline-flex">
    <button
      type="button"
      class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 transition hover:bg-gray-50"
      :aria-expanded="open ? 'true' : 'false'"
      aria-haspopup="menu"
      aria-label="Buka menu aksi"
      @click="toggle"
      @keydown.esc.prevent.stop="close"
    >
      <MoreVertical class="h-4 w-4" />
    </button>

    <Teleport to="body">
      <div
        v-show="open"
        ref="menuEl"
        class="fixed z-[9999] w-56 rounded-2xl border border-gray-200 bg-white p-1 shadow-lg shadow-gray-200"
        :style="menuStyle"
        role="menu"
        @keydown.esc.prevent.stop="close"
      >
        <button
          v-for="(action, idx) in actions"
          :key="idx"
          type="button"
          role="menuitem"
          class="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-60"
          :class="action.tone === 'danger' ? 'text-red-600 hover:bg-red-50' : 'text-gray-700 hover:bg-gray-50'"
          :disabled="action.disabled"
          @click="handleAction(action)"
        >
          <span class="truncate">{{ action.label }}</span>
        </button>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue"
import { useEventListener } from "@vueuse/core"
import { MoreVertical } from "lucide-vue-next"

export type RowAction = {
  label: string
  onClick: () => void | Promise<void>
  disabled?: boolean
  tone?: "default" | "danger"
}

const props = defineProps<{
  actions: RowAction[]
}>()

const open = ref(false)
const rootEl = ref<HTMLElement | null>(null)
const menuEl = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})

const isAnyActionEnabled = computed(() => props.actions.some((a) => !a.disabled))

function close() {
  open.value = false
}

function toggle() {
  if (!isAnyActionEnabled.value) return
  open.value = !open.value
}

async function handleAction(action: RowAction) {
  if (action.disabled) return
  close()
  await action.onClick()
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

async function updatePosition() {
  if (!open.value) return
  await nextTick()
  const root = rootEl.value
  const menu = menuEl.value
  if (!root || !menu) return

  const button = root.querySelector("button")
  if (!button) return

  const rect = (button as HTMLElement).getBoundingClientRect()
  const menuRect = menu.getBoundingClientRect()
  const padding = 8
  const gap = 8

  const shouldOpenUp = rect.bottom + gap + menuRect.height > window.innerHeight - padding
  const top = shouldOpenUp ? rect.top - gap - menuRect.height : rect.bottom + gap
  const left = rect.right - menuRect.width

  menuStyle.value = {
    top: `${clamp(top, padding, window.innerHeight - padding - menuRect.height)}px`,
    left: `${clamp(left, padding, window.innerWidth - padding - menuRect.width)}px`,
  }
}

watch(open, async (value) => {
  if (!value) return
  await updatePosition()
})

useEventListener(window, "resize", () => updatePosition())
useEventListener(
  window,
  "scroll",
  () => updatePosition(),
  { capture: true },
)

useEventListener(
  document,
  "pointerdown",
  (event) => {
    if (!open.value) return
    const target = event.target as Node | null
    if (!target) return
    if (rootEl.value?.contains(target)) return
    if (menuEl.value?.contains(target)) return
    close()
  },
  { capture: true },
)

onBeforeUnmount(() => {
  close()
})
</script>
