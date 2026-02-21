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
  const newTheme = isDark.value ? 'light' : 'dark'
  emit('update:modelValue', newTheme)
}

const buttonTitle = computed(() => {
  if (currentTheme.value === 'system') {
    return `跟随系统 (${isDark.value ? '深色' : '浅色'}) - 点击切换`
  }
  return currentTheme.value === 'dark' ? '深色模式 - 点击切换' : '浅色模式 - 点击切换'
})
</script>

<template>
  <button class="theme-toggle-btn" :title="buttonTitle" @click="toggleTheme">
    <svg v-if="isDark" class="theme-icon" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"
      />
    </svg>
    <svg v-else class="theme-icon" viewBox="0 0 24 24" fill="currentColor">
      <path
        d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-2.98 0-5.4-2.42-5.4-5.4 0-1.81.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"
      />
    </svg>
  </button>
</template>

<style scoped>
.theme-toggle-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: var(--card-bg);
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  border: 1px solid var(--border-color);
}

.theme-toggle-btn:hover {
  background: var(--hover-bg);
  transform: scale(1.05);
}

.theme-toggle-btn:active {
  transform: scale(0.95);
}

.theme-icon {
  width: 20px;
  height: 20px;
  color: var(--text-primary);
  transition: all 0.3s ease;
}

.theme-toggle-btn:hover .theme-icon {
  transform: rotate(15deg);
}
</style>
