import { ref, computed, watch, type Ref } from 'vue'
import type { Emoji, EmojiWithSelected, ThemeMode } from '@/types'

const STORAGE_KEY_THEME = 'douyin-emoji-theme'

export function useEmojiFilter(emojis: Ref<Emoji[]>) {
  const searchQuery = ref('')
  const selectedEmojis = ref<Set<string>>(new Set())

  const filteredEmojis = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()
    if (!query) {
      return emojis.value
    }
    return emojis.value.filter((emoji) =>
      emoji.display_name.toLowerCase().includes(query)
    )
  })

  const emojisWithSelected = computed<EmojiWithSelected[]>(() => {
    return filteredEmojis.value.map((emoji) => ({
      ...emoji,
      selected: selectedEmojis.value.has(emoji.origin_uri),
    }))
  })

  const selectedCount = computed(() => selectedEmojis.value.size)

  const selectedEmojiList = computed(() =>
    emojis.value.filter((emoji) => selectedEmojis.value.has(emoji.origin_uri))
  )

  const toggleSelect = (originUri: string) => {
    if (selectedEmojis.value.has(originUri)) {
      selectedEmojis.value.delete(originUri)
    } else {
      selectedEmojis.value.add(originUri)
    }
    selectedEmojis.value = new Set(selectedEmojis.value)
  }

  const selectAll = () => {
    filteredEmojis.value.forEach((emoji) => {
      selectedEmojis.value.add(emoji.origin_uri)
    })
    selectedEmojis.value = new Set(selectedEmojis.value)
  }

  const deselectAll = () => {
    selectedEmojis.value.clear()
    selectedEmojis.value = new Set()
  }

  const clearSearch = () => {
    searchQuery.value = ''
  }

  return {
    searchQuery,
    selectedEmojis,
    filteredEmojis,
    emojisWithSelected,
    selectedCount,
    selectedEmojiList,
    toggleSelect,
    selectAll,
    deselectAll,
    clearSearch,
  }
}

export function useTheme() {
  const theme = ref<ThemeMode>(
    (localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode) || 'system'
  )

  const applyTheme = (mode: ThemeMode) => {
    const isDark =
      mode === 'dark' ||
      (mode === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.classList.toggle('dark', isDark)
  }

  const setTheme = (mode: ThemeMode) => {
    theme.value = mode
    localStorage.setItem(STORAGE_KEY_THEME, mode)
    applyTheme(mode)
  }

  watch(theme, (newTheme) => applyTheme(newTheme), { immediate: true })

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (theme.value === 'system') {
      applyTheme('system')
    }
  })

  return {
    theme,
    setTheme,
  }
}
