<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import SearchBar from '@/components/SearchBar.vue'
import EmojiGrid from '@/components/EmojiGrid.vue'
import ThemeToggle from '@/components/ThemeToggle.vue'
import ProgressDialog from '@/components/ProgressDialog.vue'
import { useEmojiFilter, useTheme } from '@/composables/useEmoji'
import { useDownloader } from '@/composables/useDownloader'
import type { Emoji, EmojiWithSelected } from '@/types'

type StatusFilter = 'all' | 'public' | 'hidden'
type DensityMode = 'comfortable' | 'compact'

const emojis = ref<Emoji[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const showScrollTop = ref(false)
const statusFilter = ref<StatusFilter>('all')
const densityMode = ref<DensityMode>('comfortable')

const {
  searchQuery,
  selectedEmojis,
  emojisWithSelected,
  selectedCount,
  selectedEmojiList,
  toggleSelect,
  deselectAll,
} = useEmojiFilter(emojis)

const { theme, setTheme } = useTheme()
const { progress, downloadSingle, downloadBatch } = useDownloader()

const totalCount = computed(() => emojis.value.length)
const publicCount = computed(() => emojis.value.filter((emoji) => emoji.hide === 0).length)
const hiddenCount = computed(() => emojis.value.filter((emoji) => emoji.hide === 1).length)
const sourceCount = computed(() =>
  emojis.value.reduce((total, emoji) => total + emoji.emoji_url.url_list.length, 0)
)

const filteredEmojis = computed(() => {
  if (statusFilter.value === 'public') {
    return emojisWithSelected.value.filter((emoji) => emoji.hide === 0)
  }
  if (statusFilter.value === 'hidden') {
    return emojisWithSelected.value.filter((emoji) => emoji.hide === 1)
  }
  return emojisWithSelected.value
})

const visibleCount = computed(() => filteredEmojis.value.length)
const selectedVisibleCount = computed(
  () => filteredEmojis.value.filter((emoji) => emoji.selected).length
)
const isSearching = computed(() => searchQuery.value.trim().length > 0)
const hasActiveFilter = computed(() => isSearching.value || statusFilter.value !== 'all')
const statusSummary = computed(() => {
  if (statusFilter.value === 'public') return '仅显示公开表情'
  if (statusFilter.value === 'hidden') return '仅显示隐藏表情'
  return '显示全部表情'
})
const selectedVisibleEmojis = computed(() => filteredEmojis.value.filter((emoji) => emoji.selected))
const libraryProgressPercent = computed(() => {
  if (totalCount.value === 0) return 0
  return Math.round((visibleCount.value / totalCount.value) * 100)
})
const capsuleStatusText = computed(() => {
  if (loading.value) return '加载中'
  if (error.value) return '待重试'
  if (hasActiveFilter.value) return `${visibleCount.value} / ${totalCount.value}`
  return '全部'
})

const statusOptions: Array<{ label: string; value: StatusFilter; count: () => number }> = [
  { label: '全部', value: 'all', count: () => totalCount.value },
  { label: '公开', value: 'public', count: () => publicCount.value },
  { label: '隐藏', value: 'hidden', count: () => hiddenCount.value },
]

const handleToggle = (originUri: string) => {
  toggleSelect(originUri)
}

const handleSelectVisible = () => {
  filteredEmojis.value.forEach((emoji) => {
    selectedEmojis.value.add(emoji.origin_uri)
  })
  selectedEmojis.value = new Set(selectedEmojis.value)
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

const handleDownloadVisible = async () => {
  if (selectedVisibleEmojis.value.length === 0) return
  try {
    await downloadBatch(selectedVisibleEmojis.value)
  } catch (err) {
    console.error('Visible download failed:', err)
  }
}

const handleDownloadAll = async () => {
  if (totalCount.value === 0) return
  try {
    await downloadBatch(emojis.value)
  } catch (err) {
    console.error('Download all failed:', err)
  }
}

const handleRetry = () => {
  window.location.reload()
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleScroll = () => {
  showScrollTop.value = window.scrollY > 500
}

onMounted(async () => {
  window.addEventListener('scroll', handleScroll, { passive: true })

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

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<template>
  <div class="app-shell" :class="{ 'has-selection': selectedCount > 0 }">
    <header class="app-header">
      <div class="header-inner">
        <div class="brand">
          <span class="brand-mark" aria-hidden="true">
            DY
          </span>
          <div>
            <p class="brand-eyebrow">Emoji Library</p>
            <h1 class="brand-title">抖音表情</h1>
          </div>
        </div>

        <div class="header-actions">
          <a
            class="github-link"
            href="https://github.com/wintopic/DOUYIN_EMOJI"
            target="_blank"
            rel="noopener"
            title="GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.5 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.22-3.37-1.22-.46-1.2-1.12-1.52-1.12-1.52-.92-.64.07-.63.07-.63 1.01.07 1.55 1.07 1.55 1.07.9 1.58 2.36 1.12 2.94.86.09-.67.35-1.12.64-1.38-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.04 1.04-2.76-.1-.26-.45-1.31.1-2.72 0 0 .85-.28 2.78 1.05A9.44 9.44 0 0 1 12 6.93c.86 0 1.72.12 2.52.34 1.93-1.33 2.78-1.05 2.78-1.05.55 1.41.2 2.46.1 2.72.65.72 1.04 1.64 1.04 2.76 0 3.95-2.34 4.82-4.57 5.08.36.32.68.94.68 1.9 0 1.38-.01 2.49-.01 2.83 0 .28.18.6.69.5A10.13 10.13 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
              />
            </svg>
          </a>
          <ThemeToggle v-model="theme" @update:model-value="setTheme" />
        </div>
      </div>
    </header>

    <main class="app-main">
      <section class="workspace-toolbar" aria-label="表情筛选和批量操作">
        <div class="toolbar-primary">
          <div class="search-cell">
            <SearchBar v-model="searchQuery" placeholder="搜索表情名称" />
          </div>

          <div class="filter-cell" role="tablist" aria-label="表情状态筛选">
            <button
              v-for="option in statusOptions"
              :key="option.value"
              class="segmented-btn"
              :class="{ active: statusFilter === option.value }"
              type="button"
              @click="statusFilter = option.value"
            >
              <span>{{ option.label }}</span>
              <strong>{{ option.count() }}</strong>
            </button>
          </div>

          <div class="view-cell" aria-label="视图密度">
            <button
              class="icon-btn"
              :class="{ active: densityMode === 'comfortable' }"
              type="button"
              title="舒适视图"
              @click="densityMode = 'comfortable'"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" />
              </svg>
            </button>
            <button
              class="icon-btn"
              :class="{ active: densityMode === 'compact' }"
              type="button"
              title="紧凑视图"
              @click="densityMode = 'compact'"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M4 4h4v4H4V4Zm6 0h4v4h-4V4Zm6 0h4v4h-4V4ZM4 10h4v4H4v-4Zm6 0h4v4h-4v-4Zm6 0h4v4h-4v-4ZM4 16h4v4H4v-4Zm6 0h4v4h-4v-4Zm6 0h4v4h-4v-4Z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="toolbar-meta">
          <div class="selection-summary">
            <strong>{{ visibleCount }}</strong>
            <span>{{ hasActiveFilter ? '个筛选结果' : '个当前表情' }}</span>
            <span class="summary-divider"></span>
            <span class="summary-muted">{{ statusSummary }}</span>
          </div>

          <div class="resource-summary" aria-label="资源统计">
            <span><strong>{{ totalCount }}</strong> 表情</span>
            <span><strong>{{ sourceCount }}</strong> 图片源</span>
            <span><strong>{{ publicCount }}</strong> 公开</span>
            <span><strong>{{ hiddenCount }}</strong> 隐藏</span>
          </div>

          <div class="quick-actions">
            <button class="btn btn-neutral" :disabled="visibleCount === 0" @click="handleSelectVisible">
              全选当前
            </button>
            <button class="btn btn-neutral" :disabled="totalCount === 0" @click="handleDownloadAll">
              下载全部
            </button>
          </div>
        </div>
      </section>

      <section v-if="error" class="state-panel error-state" aria-live="polite">
        <div class="state-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M12 2 1 21h22L12 2Zm1 16h-2v-2h2v2Zm0-4h-2v-4h2v4Z"
            />
          </svg>
        </div>
        <h2>加载失败</h2>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="handleRetry">重试</button>
      </section>

      <EmojiGrid
        v-else
        :emojis="filteredEmojis"
        :loading="loading"
        :density="densityMode"
        @toggle="handleToggle"
        @download="handleDownloadSingle"
      />
    </main>

    <footer class="app-footer">
      <span>MIT License</span>
      <a href="https://github.com/wintopic/DOUYIN_EMOJI" target="_blank" rel="noopener">
        GitHub
      </a>
    </footer>

    <aside class="library-capsule" aria-label="表情总数">
      <span
        class="library-capsule-progress"
        :style="{ width: `${libraryProgressPercent}%` }"
        aria-hidden="true"
      ></span>
      <span class="capsule-label">表情总数</span>
      <strong>{{ totalCount }}</strong>
      <span class="capsule-status">{{ capsuleStatusText }}</span>
    </aside>

    <Transition name="bulk-bar">
      <aside v-if="selectedCount > 0" class="bulk-action-bar" aria-label="已选表情操作">
        <div class="bulk-summary">
          <strong>{{ selectedCount }}</strong>
          <span>个已选</span>
          <span class="bulk-muted">{{ selectedVisibleCount }} 个在当前结果中</span>
        </div>

        <div class="bulk-actions">
          <button class="btn btn-ghost" @click="deselectAll">
            清空选择
          </button>
          <button
            class="btn btn-secondary"
            :disabled="selectedVisibleCount === 0"
            @click="handleDownloadVisible"
          >
            下载当前已选
          </button>
          <button class="btn btn-primary" @click="handleDownloadSelected">
            下载已选
            <span class="btn-count">{{ selectedCount }}</span>
          </button>
        </div>
      </aside>
    </Transition>

    <Transition name="scroll-top">
      <button
        v-if="showScrollTop"
        class="scroll-top-btn"
        title="返回顶部"
        @click="scrollToTop"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4">
          <path stroke-linecap="round" stroke-linejoin="round" d="m6 14 6-6 6 6" />
        </svg>
      </button>
    </Transition>

    <ProgressDialog :progress="progress" />
  </div>
</template>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface-header);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.header-inner {
  width: min(1480px, calc(100% - 40px));
  min-height: 58px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.brand {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: var(--text-primary);
  border: 1px solid var(--border-strong);
  background: var(--surface-elevated);
  font-size: 13px;
  font-weight: 850;
}

.brand-eyebrow {
  margin-bottom: 0;
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
}

.brand-title {
  color: var(--text-primary);
  font-size: 17px;
  font-weight: 800;
  line-height: 1.15;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.github-link {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  color: var(--text-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-elevated);
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background 0.18s ease;
}

.github-link:hover {
  color: var(--text-primary);
  text-decoration: none;
  border-color: var(--border-strong);
  background: var(--surface-hover);
}

.github-link svg {
  width: 20px;
  height: 20px;
}

.app-main {
  width: min(1480px, calc(100% - 40px));
  flex: 1;
  margin: 0 auto;
  padding: 14px 0 86px;
}

.app-shell.has-selection .app-main {
  padding-bottom: 166px;
}

.workspace-toolbar {
  display: grid;
  gap: 9px;
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-panel);
}

.workspace-toolbar :deep(.search-bar) {
  min-height: 44px;
}

.workspace-toolbar :deep(.search-input) {
  height: 42px;
}

.toolbar-primary {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) auto auto;
  align-items: center;
  gap: 10px;
}

.toolbar-meta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 12px;
  min-height: 32px;
  padding-top: 7px;
  border-top: 1px solid var(--border-subtle);
}

.search-cell {
  min-width: 0;
}

.filter-cell {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-elevated);
}

.segmented-btn {
  min-width: 0;
  min-height: 34px;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  color: var(--text-secondary);
  border: none;
  border-radius: 7px;
  background: transparent;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;
}

.segmented-btn strong {
  color: var(--text-tertiary);
  font-size: 12px;
}

.segmented-btn.active {
  color: var(--text-primary);
  background: var(--surface-muted);
  box-shadow: none;
}

.segmented-btn.active strong {
  color: var(--text-primary);
}

.segmented-btn:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

.view-cell {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-elevated);
}

.icon-btn {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  color: var(--text-tertiary);
  border: none;
  border-radius: 7px;
  background: transparent;
  cursor: pointer;
  transition:
    color 0.18s ease,
    background 0.18s ease;
}

.icon-btn.active {
  color: var(--text-primary);
  background: var(--surface-muted);
  box-shadow: none;
}

.icon-btn:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

.icon-btn svg {
  width: 18px;
  height: 18px;
}

.selection-summary {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  white-space: nowrap;
}

.selection-summary strong {
  color: var(--text-primary);
  font-size: 15px;
}

.summary-divider {
  width: 1px;
  height: 14px;
  margin: 0 4px;
  background: var(--border-subtle);
}

.summary-muted {
  overflow: hidden;
  color: var(--text-tertiary);
  text-overflow: ellipsis;
}

.resource-summary {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--text-tertiary);
  font-size: 12px;
  white-space: nowrap;
}

.resource-summary strong {
  color: var(--text-primary);
  font-size: 13px;
}

.quick-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
}

.btn {
  min-height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 750;
  line-height: 1;
  cursor: pointer;
  white-space: nowrap;
  transition:
    transform 0.18s ease,
    color 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.btn:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.48;
}

.btn-primary {
  color: #fff;
  background: var(--text-primary);
  box-shadow: none;
}

.btn-primary:hover:not(:disabled) {
  background: var(--brand-red);
  box-shadow: none;
}

.btn-secondary {
  color: var(--text-primary);
  border-color: var(--border-subtle);
  background: var(--surface-muted);
  box-shadow: none;
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--border-strong);
  background: var(--surface-hover);
}

.btn-neutral {
  color: var(--text-primary);
  background: var(--surface-elevated);
  border-color: var(--border-subtle);
}

.btn-neutral:hover:not(:disabled) {
  border-color: var(--border-strong);
  background: var(--surface-hover);
}

.btn-ghost {
  color: var(--text-secondary);
  background: transparent;
  border-color: transparent;
}

.btn-ghost:hover:not(:disabled) {
  color: var(--text-primary);
  background: var(--surface-hover);
}

.btn-count {
  min-width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 7px;
  border-radius: 999px;
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.92);
  font-size: 12px;
}

.state-panel {
  min-height: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  text-align: center;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-elevated);
}

.state-panel h2 {
  color: var(--text-primary);
  font-size: 22px;
}

.state-panel p {
  max-width: 460px;
  color: var(--text-secondary);
}

.state-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  color: var(--text-secondary);
  border-radius: 8px;
  background: var(--surface-muted);
}

.state-icon svg {
  width: 28px;
  height: 28px;
}

.app-footer {
  width: min(1480px, calc(100% - 40px));
  margin: 0 auto;
  padding: 18px 0 28px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--text-tertiary);
  font-size: 13px;
}

.app-footer a {
  font-weight: 700;
}

.library-capsule {
  position: fixed;
  left: 50%;
  bottom: max(18px, env(safe-area-inset-bottom));
  z-index: 66;
  width: clamp(216px, 46vw, 300px);
  min-height: 42px;
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  overflow: hidden;
  padding: 8px 12px;
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 999px;
  background: var(--surface-panel);
  box-shadow: var(--shadow-md);
  pointer-events: none;
  transform: translateX(-50%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.library-capsule-progress {
  position: absolute;
  inset: 0 auto 0 0;
  z-index: -1;
  width: 0;
  background: linear-gradient(90deg, var(--brand-red-soft), rgba(229, 49, 82, 0));
  transition: width 0.28s ease;
}

.capsule-label,
.capsule-status {
  min-width: 0;
  overflow: hidden;
  color: var(--text-tertiary);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.library-capsule strong {
  font-size: 17px;
  font-weight: 850;
  line-height: 1;
}

.capsule-status {
  justify-self: end;
}

.app-shell.has-selection .library-capsule {
  bottom: calc(84px + env(safe-area-inset-bottom));
}

.bulk-action-bar {
  position: fixed;
  left: 50%;
  bottom: max(18px, env(safe-area-inset-bottom));
  z-index: 90;
  width: min(760px, calc(100% - 32px));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 10px;
  color: var(--text-primary);
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-panel);
  box-shadow: var(--shadow-lg);
  transform: translateX(-50%);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.bulk-summary {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  white-space: nowrap;
}

.bulk-summary strong {
  font-size: 18px;
  line-height: 1;
}

.bulk-muted {
  overflow: hidden;
  color: var(--text-tertiary);
  text-overflow: ellipsis;
}

.bulk-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.bulk-bar-enter-active,
.bulk-bar-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.bulk-bar-enter-from,
.bulk-bar-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

.scroll-top-btn {
  position: fixed;
  right: 24px;
  bottom: max(24px, env(safe-area-inset-bottom));
  z-index: 70;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  color: #fff;
  border: none;
  border-radius: 8px;
  background: var(--text-primary);
  box-shadow: var(--shadow-lg);
  cursor: pointer;
  transition:
    transform 0.18s ease,
    background 0.18s ease;
}

.scroll-top-btn:hover {
  transform: translateY(-2px);
  background: var(--text-secondary);
}

.scroll-top-btn svg {
  width: 22px;
  height: 22px;
}

.scroll-top-enter-active,
.scroll-top-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.scroll-top-enter-from,
.scroll-top-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

@media (max-width: 1180px) {
  .toolbar-primary {
    grid-template-columns: minmax(260px, 1fr) auto;
  }

  .view-cell {
    grid-column: 2;
  }

  .toolbar-meta {
    grid-template-columns: 1fr auto;
  }

  .resource-summary {
    grid-column: 1 / 3;
    flex-wrap: wrap;
    row-gap: 4px;
  }

  .quick-actions {
    justify-content: flex-end;
  }
}

@media (max-width: 760px) {
  .header-inner,
  .app-main,
  .app-footer {
    width: min(100% - 28px, 1480px);
  }

  .header-inner {
    min-height: 54px;
  }

  .brand-mark {
    width: 32px;
    height: 32px;
  }

  .brand-eyebrow {
    display: none;
  }

  .brand-title {
    font-size: 16px;
  }

  .github-link {
    display: none;
  }

  .app-main {
    padding-top: 10px;
    padding-bottom: 84px;
  }

  .app-shell.has-selection .app-main {
    padding-bottom: 222px;
  }

  .workspace-toolbar {
    margin-bottom: 10px;
    padding: 8px;
  }

  .workspace-toolbar :deep(.search-bar) {
    min-height: 42px;
  }

  .workspace-toolbar :deep(.search-input) {
    height: 40px;
  }

  .toolbar-primary {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
  }

  .toolbar-meta {
    display: none;
  }

  .search-cell {
    grid-column: 1 / 3;
  }

  .filter-cell,
  .view-cell {
    width: auto;
  }

  .segmented-btn {
    flex: 1;
    justify-content: center;
    padding: 0 9px;
  }

  .segmented-btn strong {
    display: none;
  }

  .filter-cell {
    justify-content: stretch;
  }

  .view-cell {
    justify-content: flex-end;
  }

  .icon-btn {
    width: 34px;
    height: 34px;
  }

  .btn {
    width: 100%;
  }

  .bulk-action-bar {
    bottom: max(10px, env(safe-area-inset-bottom));
    width: min(100% - 20px, 760px);
    display: grid;
    grid-template-columns: 1fr;
    gap: 9px;
  }

  .bulk-summary {
    justify-content: center;
  }

  .bulk-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
  }

  .bulk-actions .btn-ghost {
    grid-column: 1 / -1;
  }

  .bulk-actions .btn {
    min-width: 0;
    padding: 0 8px;
    white-space: normal;
    line-height: 1.15;
  }

  .library-capsule {
    bottom: max(12px, env(safe-area-inset-bottom));
    width: clamp(216px, 64vw, 284px);
    min-height: 40px;
    padding: 7px 11px;
  }

  .app-shell.has-selection .library-capsule {
    bottom: calc(150px + env(safe-area-inset-bottom));
  }

  .scroll-top-btn {
    right: 16px;
    bottom: max(18px, env(safe-area-inset-bottom));
  }

  .has-selection .scroll-top-btn {
    bottom: calc(206px + env(safe-area-inset-bottom));
  }
}

@media (max-width: 380px) {
  .toolbar-primary {
    grid-template-columns: 1fr;
  }

  .search-cell,
  .filter-cell,
  .view-cell {
    grid-column: 1;
  }

  .filter-cell {
    width: 100%;
  }

  .view-cell {
    width: max-content;
  }
}
</style>
