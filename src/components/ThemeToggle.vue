<script setup lang="ts">
import { computed } from 'vue'
import type { ThemeMode } from '@/types'

const props = defineProps<{
  modelValue: ThemeMode
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ThemeMode]
}>()

const currentTheme = computed(() => props.modelValue)

const isDark = computed(() => {
  if (currentTheme.value === 'dark') return true
  if (currentTheme.value === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
})

const toggleTheme = () => {
  emit('update:modelValue', isDark.value ? 'light' : 'dark')
}

const buttonTitle = computed(() => {
  if (currentTheme.value === 'system') {
    return `跟随系统（${isDark.value ? '深色' : '浅色'}）`
  }
  return isDark.value ? '切换到浅色模式' : '切换到深色模式'
})
</script>

<template>
  <button class="theme-toggle-btn" :title="buttonTitle" @click="toggleTheme">
    <Transition name="theme-icon" mode="out-in">
      <svg
        v-if="isDark"
        key="sun"
        class="theme-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M12 6.1a5.9 5.9 0 1 1 0 11.8 5.9 5.9 0 0 1 0-11.8Zm0 1.7a4.2 4.2 0 1 0 0 8.4 4.2 4.2 0 0 0 0-8.4ZM12.85 2v2.7h-1.7V2h1.7Zm0 17.3V22h-1.7v-2.7h1.7ZM22 11.15v1.7h-2.7v-1.7H22Zm-17.3 0v1.7H2v-1.7h2.7Zm13.67-7.32 1.2 1.2-1.9 1.91-1.21-1.2 1.91-1.91ZM6.34 17.06l1.2 1.2-1.9 1.91-1.21-1.2 1.91-1.91Zm13.23 1.91-1.2 1.2-1.91-1.91 1.2-1.2 1.91 1.91ZM7.54 5.74l-1.2 1.2-1.91-1.91 1.2-1.2 1.91 1.91Z"
        />
      </svg>
      <svg
        v-else
        key="moon"
        class="theme-icon"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          d="M20.78 14.72A8.8 8.8 0 0 1 9.28 3.22a.85.85 0 0 0-1.02-1.1A10.45 10.45 0 1 0 21.88 15.74a.85.85 0 0 0-1.1-1.02ZM12 20.75A8.75 8.75 0 0 1 7.2 4.67a10.5 10.5 0 0 0 12.13 12.12A8.72 8.72 0 0 1 12 20.75Z"
        />
      </svg>
    </Transition>
  </button>
</template>

<style scoped>
.theme-toggle-btn {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-elevated);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.theme-toggle-btn:hover {
  color: var(--text-primary);
  border-color: var(--border-strong);
  background: var(--surface-hover);
}

.theme-toggle-btn:active {
  transform: scale(0.96);
}

.theme-toggle-btn:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

.theme-icon {
  width: 20px;
  height: 20px;
}

.theme-icon-enter-active,
.theme-icon-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.theme-icon-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.theme-icon-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
