<script setup lang="ts">
import { computed } from 'vue'
import type { EmojiWithSelected } from '@/types'

const props = defineProps<{
  emoji: EmojiWithSelected
}>()

const emit = defineEmits<{
  toggle: [originUri: string]
  download: [emoji: EmojiWithSelected]
}>()

const imageUrl = computed(() => {
  const urlList = props.emoji.emoji_url.url_list
  return urlList[0] || ''
})

const handleToggle = () => {
  emit('toggle', props.emoji.origin_uri)
}

const handleDownload = (e: Event) => {
  e.stopPropagation()
  emit('download', props.emoji)
}
</script>

<template>
  <div
    class="emoji-card"
    :class="{ selected: emoji.selected }"
    @click="handleToggle"
  >
    <div class="emoji-image-wrapper">
      <img
        :src="imageUrl"
        :alt="emoji.display_name"
        class="emoji-image"
        loading="lazy"
      />
      <div class="selection-overlay">
        <div class="check-icon">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        </div>
      </div>
    </div>
    <div class="emoji-info">
      <span class="emoji-name">{{ emoji.display_name }}</span>
      <button class="download-btn" @click="handleDownload" title="下载">
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
          <path
            d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.emoji-card {
  background: var(--card-bg);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
  position: relative;
}

.emoji-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.emoji-card.selected {
  border-color: var(--primary-color);
  background: var(--card-selected-bg);
}

.emoji-image-wrapper {
  position: relative;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--image-bg);
  border-radius: 8px;
  overflow: hidden;
}

.emoji-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.selection-overlay {
  position: absolute;
  inset: 0;
  background: rgba(25, 118, 210, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.emoji-card.selected .selection-overlay {
  opacity: 1;
}

.check-icon {
  width: 32px;
  height: 32px;
  background: var(--primary-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.check-icon svg {
  width: 20px;
  height: 20px;
}

.emoji-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
  gap: 8px;
}

.emoji-name {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.download-btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border: none;
  background: var(--primary-color);
  color: white;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.download-btn:hover {
  background: var(--primary-hover);
  transform: scale(1.1);
}
</style>
