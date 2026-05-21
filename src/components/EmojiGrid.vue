<script setup lang="ts">
import EmojiCard from './EmojiCard.vue'
import type { EmojiWithSelected } from '@/types'

withDefaults(
  defineProps<{
    emojis: EmojiWithSelected[]
    loading: boolean
    density?: 'comfortable' | 'compact'
  }>(),
  {
    density: 'comfortable',
  }
)

const emit = defineEmits<{
  toggle: [originUri: string]
  download: [emoji: EmojiWithSelected]
}>()
</script>

<template>
  <div class="emoji-grid-container" :class="`density-${density}`">
    <div v-if="loading" class="emoji-grid skeleton-grid" aria-label="正在加载表情">
      <div v-for="n in 28" :key="n" class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>

    <div v-else-if="emojis.length === 0" class="empty-state">
      <div class="empty-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M9.75 3.5a6.25 6.25 0 0 1 4.96 10.05l4.37 4.37a.82.82 0 0 1-1.16 1.16l-4.37-4.37A6.25 6.25 0 1 1 9.75 3.5Zm0 1.65a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Z"
          />
        </svg>
      </div>
      <h2>没有找到匹配的表情</h2>
      <p>调整关键词或切换状态筛选。</p>
    </div>

    <div v-else class="emoji-grid" aria-label="表情列表">
      <EmojiCard
        v-for="(emoji, index) in emojis"
        :key="`${emoji.origin_uri}-${emoji.display_name}-${index}`"
        :emoji="emoji"
        @toggle="emit('toggle', $event)"
        @download="emit('download', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.emoji-grid-container {
  min-height: 420px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.density-compact .emoji-grid {
  grid-template-columns: repeat(auto-fill, minmax(122px, 1fr));
  gap: 10px;
}

.density-compact :deep(.emoji-card) {
  gap: 8px;
  padding: 8px;
}

.density-compact :deep(.emoji-file),
.density-compact :deep(.card-footer) {
  display: none;
}

.density-compact :deep(.emoji-name) {
  font-size: 13px;
}

.density-compact :deep(.source-chip) {
  display: none;
}

.skeleton-grid {
  pointer-events: none;
}

.skeleton-card {
  padding: 12px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-elevated);
}

.skeleton-image {
  aspect-ratio: 1;
  border-radius: 7px;
  background: var(--surface-muted);
}

.skeleton-line {
  width: 72%;
  height: 12px;
  margin-top: 12px;
  border-radius: 999px;
  background: var(--surface-muted);
}

.skeleton-line.short {
  width: 42%;
  margin-top: 8px;
}

.empty-state {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  background: transparent;
}

.empty-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  color: var(--text-secondary);
  border-radius: 8px;
  background: var(--surface-muted);
}

.empty-icon svg {
  width: 28px;
  height: 28px;
}

.empty-state h2 {
  color: var(--text-primary);
  font-size: 20px;
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 14px;
}

@media (max-width: 720px) {
  .emoji-grid {
    grid-template-columns: repeat(auto-fill, minmax(124px, 1fr));
    gap: 10px;
  }

  .density-compact .emoji-grid {
    grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
  }
}
</style>
