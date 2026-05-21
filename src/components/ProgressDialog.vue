<script setup lang="ts">
import { computed } from 'vue'
import type { DownloadProgress } from '@/types'

const props = defineProps<{
  progress: DownloadProgress
}>()

const progressPercent = computed(() => {
  if (props.progress.total === 0) return 0
  return Math.round((props.progress.current / props.progress.total) * 100)
})

const isVisible = computed(() => props.progress.status !== 'idle')
const isDone = computed(() => props.progress.status === 'done')
const statusTitle = computed(() => {
  if (props.progress.status === 'compressing') return '正在打包'
  if (props.progress.status === 'done') return '下载完成'
  if (props.progress.status === 'error') return '下载失败'
  return '正在下载'
})
</script>

<template>
  <Teleport to="body">
    <Transition name="progress">
      <div v-if="isVisible" class="progress-overlay" role="status" aria-live="polite">
        <section class="progress-modal" aria-label="下载进度">
          <div class="progress-icon" :class="{ done: isDone }" aria-hidden="true">
            <svg v-if="isDone" viewBox="0 0 24 24" fill="currentColor">
              <path d="m9.55 16.55-4.2-4.2 1.2-1.2 3 3 7.9-7.9 1.2 1.2-9.1 9.1Z" />
            </svg>
            <span v-else class="spinner"></span>
          </div>

          <div class="progress-content">
            <div class="progress-header">
              <div>
                <h2>{{ statusTitle }}</h2>
                <p>{{ progress.message }}</p>
              </div>
              <span class="progress-percent">{{ progressPercent }}%</span>
            </div>

            <div class="progress-track" aria-hidden="true">
              <div class="progress-fill" :style="{ width: `${progressPercent}%` }"></div>
            </div>

            <div class="progress-detail">
              <span>{{ progress.current }} / {{ progress.total }}</span>
              <span v-if="progress.status === 'compressing'">生成 ZIP 文件</span>
              <span v-else-if="isDone">文件已保存</span>
              <span v-else>请保持页面打开</span>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.progress-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: rgba(7, 10, 14, 0.46);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.progress-modal {
  width: min(460px, 100%);
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 16px;
  padding: 20px;
  border: 1px solid var(--border-subtle);
  border-radius: 10px;
  background: var(--surface-elevated);
  box-shadow: var(--shadow-lg);
}

.progress-icon {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  color: var(--brand-red);
  border-radius: 8px;
  background: var(--brand-red-soft);
}

.progress-icon.done {
  color: var(--text-inverse);
  background: var(--brand-cyan);
}

.progress-icon svg {
  width: 26px;
  height: 26px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid var(--border-subtle);
  border-top-color: var(--brand-red);
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

.progress-content {
  min-width: 0;
}

.progress-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.progress-header h2 {
  color: var(--text-primary);
  font-size: 18px;
  line-height: 1.2;
}

.progress-header p {
  overflow: hidden;
  max-width: 300px;
  margin-top: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress-percent {
  flex: 0 0 auto;
  color: var(--brand-red);
  font-size: 18px;
  font-weight: 850;
  line-height: 1.2;
}

.progress-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--surface-muted);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--text-primary);
  transition: width 0.22s ease;
}

.progress-detail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 10px;
  color: var(--text-tertiary);
  font-size: 12px;
}

.progress-enter-active,
.progress-leave-active {
  transition: opacity 0.18s ease;
}

.progress-enter-active .progress-modal,
.progress-leave-active .progress-modal {
  transition: transform 0.18s ease;
}

.progress-enter-from,
.progress-leave-to {
  opacity: 0;
}

.progress-enter-from .progress-modal,
.progress-leave-to .progress-modal {
  transform: translateY(8px);
}

@media (max-width: 520px) {
  .progress-modal {
    grid-template-columns: 1fr;
  }

  .progress-header p {
    max-width: 220px;
  }
}
</style>
