<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import EmojiGrid from '@/components/EmojiGrid.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import { useEmojiFilter, useTheme } from '@/composables/useEmoji'
import { useDownloader } from '@/composables/useDownloader'
import type { Emoji, EmojiWithSelected } from '@/types'

const emojis = ref<Emoji[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const {
  searchQuery,
  emojisWithSelected,
  selectedCount,
  selectedEmojiList,
  toggleSelect,
  selectAll,
  deselectAll,
} = useEmojiFilter(emojis)

const { theme, setTheme } = useTheme()
const { progress, downloadSingle, downloadBatch } = useDownloader()

const totalCount = computed(() => emojis.value.length)

const handleToggle = (originUri: string) => {
  toggleSelect(originUri)
}

const handleDownloadSingle = async (emoji: EmojiWithSelected) => {
  try {
    await downloadSingle(emoji)
  } catch (err) {
    console.error('Download failed:', err)
  }
}

const handleDownloadSelected = async () => {
  if (selectedCount.value === 0) return
  try {
    await downloadBatch(selectedEmojiList.value)
    deselectAll()
  } catch (err) {
    console.error('Batch download failed:', err)
  }
}

const handleDownloadAll = async () => {
  try {
    await downloadBatch(emojis.value)
  } catch (err) {
    console.error('Download all failed:', err)
  }
}

const handleRetry = () => {
  window.location.reload()
}

onMounted(async () => {
  try {
    const response = await fetch('/data/emojis.json')
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data: Emoji[] = await response.json()
    emojis.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : '加载失败'
    console.error('Failed to load emojis:', err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-content">
        <div class="logo-section">
          <h1 class="app-title">
            <span class="title-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"
                />
              </svg>
            </span>
            抖音表情下载
          </h1>
        </div>
        <ThemeToggle v-model="theme" @update:model-value="setTheme" />
      </div>
    </header>

    <main class="app-main">
      <div class="toolbar">
        <div class="search-section">
          <SearchBar v-model="searchQuery" placeholder="搜索表情名称..." />
        </div>
        <div class="action-section">
          <div class="stats">
            <span class="stat-item">
              共 <strong>{{ totalCount }}</strong> 个表情
            </span>
            <span v-if="selectedCount > 0" class="stat-item selected">
              已选 <strong>{{ selectedCount }}</strong> 个
            </span>
          </div>
          <div class="action-buttons">
            <button
              v-if="selectedCount > 0"
              class="btn btn-secondary"
              @click="deselectAll"
            >
              取消选择
            </button>
            <button
              class="btn btn-secondary"
              @click="selectAll"
            >
              全选
            </button>
            <button
              class="btn btn-primary"
              :disabled="selectedCount === 0"
              @click="handleDownloadSelected"
            >
              下载已选 ({{ selectedCount }})
            </button>
            <button class="btn btn-outline" @click="handleDownloadAll">
              下载全部
            </button>
          </div>
        </div>
      </div>

      <div v-if="error" class="error-state">
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="handleRetry">
          重试
        </button>
      </div>

      <EmojiGrid
        v-else
        :emojis="emojisWithSelected"
        :loading="loading"
        @toggle="handleToggle"
        @download="handleDownloadSingle"
      />
    </main>

    <footer class="app-footer">
      <p>
        开源项目 · 
        <a href="https://github.com/wintopic/DOUYIN_EMOJI" target="_blank" rel="noopener">GitHub</a>
      </p>
    </footer>

    <ProgressDialog :progress="progress" />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.logo-section {
  flex: 1;
  min-width: 0;
}

.app-title {
  font-size: clamp(18px, 4vw, 24px);
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}

.title-icon {
  width: clamp(20px, 4vw, 28px);
  height: clamp(20px, 4vw, 28px);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-icon svg {
  width: 100%;
  height: 100%;
}

.app-main {
  flex: 1;
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 24px;
}

.toolbar {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.search-section {
  max-width: 400px;
}

.action-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.stats {
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.stat-item strong {
  color: var(--text-primary);
}

.stat-item.selected strong {
  color: var(--primary-color);
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn-secondary {
  background: var(--hover-bg);
  color: var(--text-primary);
  border-color: var(--border-color);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--border-color);
}

.btn-outline {
  background: transparent;
  color: var(--primary-color);
  border-color: var(--primary-color);
}

.btn-outline:hover:not(:disabled) {
  background: var(--primary-alpha);
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  color: var(--text-secondary);
}

.app-footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  padding: 16px 24px;
  text-align: center;
  font-size: 14px;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .header-content {
    flex-wrap: wrap;
    gap: 12px;
  }

  .logo-section {
    flex: 1 1 auto;
  }

  .action-section {
    flex-direction: column;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: center;
  }

  .stats {
    justify-content: center;
  }
}
</style>
