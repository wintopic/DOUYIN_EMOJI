<script setup lang="ts">
import { computed } from 'vue'
import EmojiCard from './EmojiCard.vue'
import type { EmojiWithSelected } from '@/types'

const props = defineProps<{
  emojis: EmojiWithSelected[]
  loading: boolean
}>()

const emit = defineEmits<{
  toggle: [originUri: string]
  download: [emoji: EmojiWithSelected]
}>()

const gridStyle = computed(() => ({
  '--total': props.emojis.length,
}))
</script>

<template>
  <div class="emoji-grid-container">
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="emojis.length === 0" class="empty-state">
      <svg viewBox="0 0 24 24" fill="currentColor" width="48" height="48">
        <path
          d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
        />
      </svg>
      <span>没有找到匹配的表情</span>
    </div>

    <div v-else class="emoji-grid" :style="gridStyle">
      <EmojiCard
        v-for="emoji in emojis"
        :key="emoji.origin_uri"
        :emoji="emoji"
        @toggle="emit('toggle', $event)"
        @download="emit('download', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.emoji-grid-container {
  min-height: 400px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: var(--text-secondary);
  gap: 16px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border-color);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .emoji-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
}
</style>
