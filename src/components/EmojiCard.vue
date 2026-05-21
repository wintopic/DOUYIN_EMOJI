<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { EmojiWithSelected } from '@/types'

const props = defineProps<{
  emoji: EmojiWithSelected
}>()

const emit = defineEmits<{
  toggle: [originUri: string]
  download: [emoji: EmojiWithSelected]
}>()

const currentUrlIndex = ref(0)
const imageLoaded = ref(false)
const imageFailed = ref(false)

const urlList = computed(() => props.emoji.emoji_url.url_list)
const currentImageUrl = computed(() => urlList.value[currentUrlIndex.value] || '')
const cleanName = computed(() => props.emoji.display_name.replace(/^\[|\]$/g, ''))
const sourceCount = computed(() => urlList.value.length)
const sourceLabel = computed(() => {
  if (imageFailed.value) return '加载失败'
  if (currentUrlIndex.value > 0) return `备用源 ${currentUrlIndex.value + 1}`
  return ''
})

const resetImageState = () => {
  currentUrlIndex.value = 0
  imageLoaded.value = false
  imageFailed.value = false
}

const handleImageLoad = () => {
  imageLoaded.value = true
}

const handleImageError = () => {
  imageLoaded.value = false
  if (currentUrlIndex.value < urlList.value.length - 1) {
    currentUrlIndex.value += 1
    return
  }
  imageFailed.value = true
}

const retryImage = (e: Event) => {
  e.stopPropagation()
  resetImageState()
}

const handleToggle = () => {
  emit('toggle', props.emoji.origin_uri)
}

const handleDownload = (e: Event) => {
  e.stopPropagation()
  emit('download', props.emoji)
}

watch(
  () => `${props.emoji.origin_uri}-${props.emoji.display_name}`,
  () => resetImageState()
)
</script>

<template>
  <article
    class="emoji-card"
    :class="{ selected: emoji.selected, failed: imageFailed }"
    :aria-pressed="emoji.selected"
    tabindex="0"
    @click="handleToggle"
    @keydown.enter.prevent="handleToggle"
    @keydown.space.prevent="handleToggle"
  >
    <div class="emoji-image-frame">
      <img
        v-if="currentImageUrl && !imageFailed"
        :src="currentImageUrl"
        :alt="cleanName"
        class="emoji-image"
        :class="{ loaded: imageLoaded }"
        loading="lazy"
        @load="handleImageLoad"
        @error="handleImageError"
      />

      <div v-if="!imageLoaded && !imageFailed" class="image-loading" aria-hidden="true">
        <span></span>
      </div>

      <div v-if="imageFailed" class="image-fallback">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M4 5.75A2.75 2.75 0 0 1 6.75 3h10.5A2.75 2.75 0 0 1 20 5.75v12.5A2.75 2.75 0 0 1 17.25 21H6.75A2.75 2.75 0 0 1 4 18.25V5.75Zm2.75-1A1 1 0 0 0 5.75 5.75v9.48l3.07-3.07a1.75 1.75 0 0 1 2.47 0l1.07 1.07 2.35-2.35a1.75 1.75 0 0 1 2.47 0l1.07 1.07v-6.2a1 1 0 0 0-1-1H6.75Zm11.5 9.68-2.31-2.31-4.59 4.59-1.24-1.24 1.01-1.01-1.07-1.07-4.3 4.3v.56a1 1 0 0 0 1 1h10.5a1 1 0 0 0 1-1v-3.82ZM8 8.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z"
          />
        </svg>
        <button type="button" @click="retryImage">重试</button>
      </div>

      <span v-if="emoji.hide === 1" class="status-chip">隐藏</span>
      <span
        v-if="imageFailed || currentUrlIndex > 0"
        class="source-chip"
        :class="{ warning: imageFailed || currentUrlIndex > 0 }"
      >
        {{ sourceLabel }}
      </span>

      <div class="selection-badge" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="m9.55 16.55-4.2-4.2 1.2-1.2 3 3 7.9-7.9 1.2 1.2-9.1 9.1Z" />
        </svg>
      </div>
    </div>

    <div class="emoji-info">
      <div class="emoji-meta">
        <h3 class="emoji-name" :title="emoji.display_name">{{ cleanName }}</h3>
        <span class="emoji-file" :title="emoji.origin_uri">{{ emoji.origin_uri }}</span>
      </div>

      <button class="download-btn" title="下载此表情" @click="handleDownload">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M12.85 3v9.1l3.32-3.32 1.2 1.2L12 15.35 6.63 9.98l1.2-1.2 3.32 3.32V3h1.7ZM5 18.3h14V21H5v-2.7Z"
          />
        </svg>
        <span class="visually-hidden">下载</span>
      </button>
    </div>

    <div class="card-footer">
      <span>{{ sourceCount }} 个源</span>
      <span>{{ emoji.selected ? '已选择' : '点击选择' }}</span>
    </div>
  </article>
</template>

<style scoped>
.emoji-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-elevated);
  cursor: pointer;
  box-shadow: none;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.emoji-card:hover {
  transform: translateY(-1px);
  border-color: var(--border-strong);
  box-shadow: none;
}

.emoji-card:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

.emoji-card.selected {
  border-color: var(--text-primary);
  background: var(--surface-elevated);
  box-shadow: inset 0 0 0 1px var(--text-primary);
}

.emoji-card.failed {
  border-color: var(--border-strong);
}

.emoji-image-frame {
  position: relative;
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 7px;
  background: transparent;
}

.emoji-image {
  width: 86%;
  height: 86%;
  object-fit: contain;
  opacity: 0;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.emoji-image.loaded {
  opacity: 1;
}

.emoji-card:hover .emoji-image {
  transform: scale(1.04);
}

.image-loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  pointer-events: none;
}

.image-loading span {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--text-secondary);
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

.image-fallback {
  display: grid;
  place-items: center;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 12px;
}

.image-fallback svg {
  width: 34px;
  height: 34px;
}

.image-fallback button {
  min-height: 28px;
  padding: 0 10px;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 7px;
  background: var(--surface-muted);
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;
}

.status-chip,
.source-chip {
  position: absolute;
  padding: 4px 7px;
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  background: var(--surface-elevated);
  font-size: 11px;
  font-weight: 750;
  line-height: 1;
}

.status-chip {
  top: 8px;
  left: 8px;
  color: var(--text-secondary);
}

.source-chip {
  left: 8px;
  bottom: 8px;
  color: var(--text-secondary);
  border-color: var(--border-subtle);
  background: var(--surface-elevated);
}

.source-chip.warning {
  color: var(--text-secondary);
  border-color: var(--border-subtle);
  background: var(--surface-elevated);
}

.selection-badge {
  position: absolute;
  right: 8px;
  top: 8px;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  color: #fff;
  border-radius: 999px;
  background: var(--text-primary);
  box-shadow: none;
  opacity: 0;
  transform: scale(0.8);
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
}

.emoji-card.selected .selection-badge {
  opacity: 1;
  transform: scale(1);
}

.selection-badge svg {
  width: 18px;
  height: 18px;
}

.emoji-info {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px;
  align-items: center;
  gap: 8px;
}

.emoji-meta {
  min-width: 0;
}

.emoji-name {
  overflow: hidden;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.emoji-file {
  display: block;
  overflow: hidden;
  margin-top: 3px;
  color: var(--text-tertiary);
  font-size: 11px;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 7px;
  background: var(--surface-muted);
  cursor: pointer;
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease,
    transform 0.18s ease;
}

.download-btn:hover {
  color: #fff;
  border-color: var(--text-primary);
  background: var(--text-primary);
  transform: translateY(-1px);
}

.download-btn:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

.download-btn svg {
  width: 18px;
  height: 18px;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 650;
}
</style>
