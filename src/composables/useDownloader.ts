import { ref } from 'vue'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import type { Emoji, DownloadProgress } from '@/types'

function getBestImageUrl(emoji: Emoji): string {
  const urlList = emoji.emoji_url.url_list
  return urlList[0] || ''
}

function sanitizeFileName(name: string): string {
  return name.replace(/[<>:"/\\|?*]/g, '_').replace(/^\[|\]$/g, '')
}

async function fetchImageAsBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.status}`)
  }
  return response.blob()
}

function getFileExtension(url: string): string {
  const match = url.match(/\.(\w+)(\?|$)/)
  return match ? match[1] : 'png'
}

export function useDownloader() {
  const progress = ref<DownloadProgress>({
    current: 0,
    total: 0,
    status: 'idle',
    message: '',
  })

  const downloadSingle = async (emoji: Emoji): Promise<void> => {
    const url = getBestImageUrl(emoji)
    const blob = await fetchImageAsBlob(url)
    const ext = getFileExtension(url)
    const fileName = `${sanitizeFileName(emoji.display_name)}.${ext}`
    saveAs(blob, fileName)
  }

  const downloadBatch = async (emojis: Emoji[]): Promise<void> => {
    if (emojis.length === 0) return

    progress.value = {
      current: 0,
      total: emojis.length,
      status: 'downloading',
      message: '正在下载...',
    }

    const zip = new JSZip()
    const folder = zip.folder('douyin-emojis')

    if (!folder) {
      throw new Error('Failed to create zip folder')
    }

    for (let i = 0; i < emojis.length; i++) {
      const emoji = emojis[i]
      progress.value.current = i + 1
      progress.value.message = `正在下载 ${emoji.display_name} (${i + 1}/${emojis.length})`

      try {
        const url = getBestImageUrl(emoji)
        const blob = await fetchImageAsBlob(url)
        const ext = getFileExtension(url)
        const fileName = `${sanitizeFileName(emoji.display_name)}.${ext}`
        folder.file(fileName, blob)
      } catch (error) {
        console.error(`Failed to download ${emoji.display_name}:`, error)
      }
    }

    progress.value.status = 'compressing'
    progress.value.message = '正在压缩文件...'

    const zipBlob = await zip.generateAsync({ type: 'blob' })

    progress.value.status = 'done'
    progress.value.message = '下载完成!'

    saveAs(zipBlob, `douyin-emojis-${Date.now()}.zip`)

    setTimeout(() => {
      progress.value = {
        current: 0,
        total: 0,
        status: 'idle',
        message: '',
      }
    }, 2000)
  }

  return {
    progress,
    downloadSingle,
    downloadBatch,
  }
}
