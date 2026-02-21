export interface EmojiUrl {
  uri: string
  url_list: string[]
}

export interface Emoji {
  origin_uri: string
  display_name: string
  hide: number
  emoji_url: EmojiUrl
}

export interface EmojiWithSelected extends Emoji {
  selected: boolean
}

export type ThemeMode = 'light' | 'dark' | 'system'

export interface DownloadProgress {
  current: number
  total: number
  status: 'idle' | 'downloading' | 'compressing' | 'done' | 'error'
  message: string
}
