<script setup lang="ts">
defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const handleInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

const handleClear = () => {
  emit('update:modelValue', '')
}
</script>

<template>
  <label class="search-bar">
    <span class="search-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M9.75 3.5a6.25 6.25 0 0 1 4.96 10.05l4.37 4.37a.82.82 0 0 1-1.16 1.16l-4.37-4.37A6.25 6.25 0 1 1 9.75 3.5Zm0 1.65a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Z"
        />
      </svg>
    </span>
    <input
      type="search"
      :value="modelValue"
      :placeholder="placeholder || '搜索表情'"
      class="search-input"
      autocomplete="off"
      @input="handleInput"
    />
    <Transition name="clear-fade">
      <button
        v-if="modelValue"
        type="button"
        class="clear-btn"
        title="清空搜索"
        @click="handleClear"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path
            d="M6.4 5.23 12 10.83l5.6-5.6 1.17 1.17-5.6 5.6 5.6 5.6-1.17 1.17-5.6-5.6-5.6 5.6-1.17-1.17 5.6-5.6-5.6-5.6 1.17-1.17Z"
          />
        </svg>
      </button>
    </Transition>
  </label>
</template>

<style scoped>
.search-bar {
  position: relative;
  min-height: 48px;
  display: flex;
  align-items: center;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--surface-elevated);
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.search-bar:focus-within {
  border-color: var(--brand-red);
  box-shadow: 0 0 0 4px var(--focus-ring);
  background: var(--input-bg);
}

.search-icon {
  position: absolute;
  left: 14px;
  width: 20px;
  height: 20px;
  display: grid;
  place-items: center;
  color: var(--text-tertiary);
  pointer-events: none;
}

.search-icon svg {
  width: 19px;
  height: 19px;
}

.search-bar:focus-within .search-icon {
  color: var(--brand-red);
}

.search-input {
  width: 100%;
  min-width: 0;
  height: 46px;
  padding: 0 44px 0 44px;
  color: var(--text-primary);
  border: none;
  outline: none;
  background: transparent;
  font-size: 15px;
}

.search-input::-webkit-search-cancel-button {
  display: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.clear-btn {
  position: absolute;
  right: 8px;
  width: 32px;
  height: 32px;
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

.clear-btn:hover {
  color: var(--text-primary);
  background: var(--surface-hover);
}

.clear-btn:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 1px;
}

.clear-btn svg {
  width: 18px;
  height: 18px;
}

.clear-fade-enter-active,
.clear-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.clear-fade-enter-from,
.clear-fade-leave-to {
  opacity: 0;
  transform: scale(0.92);
}
</style>
