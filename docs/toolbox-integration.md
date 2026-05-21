# Douyin Emoji Toolbox Integration Spec

Version: 1.0
Last updated: 2026-05-20
Audience: AI agents, toolbox integrators, lightweight plugin builders

## 1. Purpose

This project is a lightweight emoji catalog and downloader. It loads a static
Douyin emoji dataset, lets users search and filter the catalog, select items,
download one image, or download multiple images as a ZIP archive.

The current app runs as a static Vue/Vite site and PWA.
It does not require a backend.

## 2. Core Modules

### 2.1 Catalog Module

Responsibility:

- Load emoji data from `public/data/emojis.json` in the deployed app.
- Keep the original item fields intact.
- Expose total counts, public counts, hidden counts, and image source counts.
- Validate that every item has an id, display name, visibility flag, and at
  least one image URL before download.

Source files:

- `src/types/index.ts`
- `src/App.vue`

### 2.2 Search And Filter Module

Responsibility:

- Search by `display_name`.
- Filter by visibility status.
- Keep search and status filters independent.
- Return the filtered list in the same order as the source dataset.

Source file:

- `src/composables/useEmoji.ts`

State:

```ts
type StatusFilter = 'all' | 'public' | 'hidden'

interface FilterState {
  query: string
  status: StatusFilter
}
```

Rules:

- Empty query returns all items matching the status filter.
- Query matching is substring-based against `display_name`.
- `hide === 0` means public.
- `hide === 1` means hidden.

### 2.3 Selection Module

Responsibility:

- Track selected emojis by stable id.
- Toggle a single item.
- Select all currently visible items.
- Clear all selections.
- Report selected total and selected-visible total.

Source file:

- `src/composables/useEmoji.ts`

State:

```ts
interface SelectionState {
  selectedIds: string[]
  selectedCount: number
  selectedVisibleCount: number
}
```

Stable id:

- Use `origin_uri`.
- Do not use array index as an id.

### 2.4 Download Module

Responsibility:

- Pick the first available URL from `emoji_url.url_list`.
- Fetch the image as a Blob.
- Save a single image with a sanitized file name.
- Save multiple images into a ZIP archive under `douyin-emojis/`.
- Report progress for batch downloads.

Source file:

- `src/composables/useDownloader.ts`

Download progress state:

```ts
type DownloadStatus = 'idle' | 'downloading' | 'compressing' | 'done' | 'error'

interface DownloadProgress {
  current: number
  total: number
  status: DownloadStatus
  message: string
}
```

Filename rules:

- Base name: `display_name`.
- Replace invalid filename characters: `< > : " / \ | ? *`.
- Extension: parse from the selected URL; fallback to `png`.

### 2.5 UI Status Module

Responsibility:

- Show a compact floating capsule with total count and filter progress.
- Keep the capsule above the bottom bulk action bar when selections exist.
- Avoid covering primary toolbar controls or selected action buttons.

Source files:

- `src/App.vue`

Recommended UI state:

```ts
interface LibraryCapsuleState {
  totalCount: number
  visibleCount: number
  progressPercent: number
  label: '表情总数'
  statusText: '全部' | '加载中' | '待重试' | string
}
```

## 3. Data Contract

Input dataset:

```ts
interface EmojiUrl {
  uri: string
  url_list: string[]
}

interface Emoji {
  origin_uri: string
  display_name: string
  hide: number
  emoji_url: EmojiUrl
}
```

Normalized item for toolbox use:

```ts
interface ToolboxEmojiItem {
  id: string
  name: string
  hidden: boolean
  sourceUri: string
  sources: string[]
}
```

Normalization:

```ts
function normalizeEmoji(input: Emoji): ToolboxEmojiItem {
  return {
    id: input.origin_uri,
    name: input.display_name,
    hidden: input.hide === 1,
    sourceUri: input.emoji_url.uri,
    sources: input.emoji_url.url_list,
  }
}
```

Known current dataset shape:

```json
{
  "total": 371,
  "publicCount": 214,
  "hiddenCount": 157,
  "sourceUrlCount": 742
}
```

## 4. AI-Readable Actions

Use these action names if the toolbox exposes the project as a local agent tool,
plugin command, MCP tool, or internal function.

### 4.1 `load_catalog`

Purpose: load and validate the emoji dataset.

Request:

```json
{
  "action": "load_catalog",
  "params": {
    "source": "/data/emojis.json"
  }
}
```

Response:

```json
{
  "ok": true,
  "stats": {
    "total": 371,
    "publicCount": 214,
    "hiddenCount": 157,
    "sourceUrlCount": 742
  }
}
```

### 4.2 `query_emojis`

Purpose: search and filter the catalog.

Request:

```json
{
  "action": "query_emojis",
  "params": {
    "query": "鲸鱼",
    "status": "hidden",
    "limit": 20,
    "offset": 0
  }
}
```

Response:

```json
{
  "ok": true,
  "total": 371,
  "visible": 1,
  "items": [
    {
      "id": "jingyudianzan.png",
      "name": "[鲸鱼点赞]",
      "hidden": true,
      "sourceUri": "tos-cn-i-tsj2vxp0zn/5e87abfaec4244ac8c7b492248defd69",
      "sources": ["https://example.invalid/image.png"]
    }
  ]
}
```

### 4.3 `select_emojis`

Purpose: update item selection.

Request:

```json
{
  "action": "select_emojis",
  "params": {
    "mode": "toggle",
    "ids": ["jingyudianzan.png"]
  }
}
```

Supported modes:

- `toggle`
- `add`
- `remove`
- `clear`
- `select_visible`

Response:

```json
{
  "ok": true,
  "selection": {
    "selectedIds": ["jingyudianzan.png"],
    "selectedCount": 1,
    "selectedVisibleCount": 1
  }
}
```

### 4.4 `download_emojis`

Purpose: download one item or a group of items.

Request:

```json
{
  "action": "download_emojis",
  "params": {
    "mode": "zip",
    "ids": ["jingyudianzan.png"],
    "filename": "douyin-emojis.zip"
  }
}
```

Supported modes:

- `single`
- `zip`

Progress event:

```json
{
  "event": "download_progress",
  "current": 1,
  "total": 20,
  "status": "downloading",
  "message": "正在下载 [鲸鱼点赞] (1/20)"
}
```

Response:

```json
{
  "ok": true,
  "status": "done",
  "savedAs": "douyin-emojis.zip",
  "failed": []
}
```

### 4.5 `get_catalog_stats`

Purpose: return the current catalog, filter, and selection summary.

Request:

```json
{
  "action": "get_catalog_stats"
}
```

Response:

```json
{
  "ok": true,
  "stats": {
    "total": 371,
    "visible": 371,
    "publicCount": 214,
    "hiddenCount": 157,
    "selectedCount": 0,
    "selectedVisibleCount": 0,
    "filterProgressPercent": 100
  }
}
```

## 5. Suggested Toolbox Architecture

For a local toolbox, split the integration into four small services:

```text
EmojiCatalogService
  - load(source)
  - normalize(item)
  - getById(id)
  - stats()

EmojiQueryService
  - query({ query, status, limit, offset })
  - visibleIds()

EmojiSelectionService
  - toggle(id)
  - add(ids)
  - remove(ids)
  - clear()
  - selectVisible(ids)
  - summary()

EmojiDownloadService
  - downloadSingle(id)
  - downloadZip(ids)
  - onProgress(callback)
```

Keep the data layer independent from Vue. The Vue app can remain one frontend
consumer, while the toolbox can call the same logic through plain TypeScript
functions.

Minimum recommended extraction:

- Move pure data helpers into a toolbox-safe module such as
  `src/core/emojiCatalog.ts`.
- Keep Vue refs, computed values, DOM downloads, and UI text outside that module.
- Let web/PWA call the pure module from Vue composables.
- Let the toolbox call the same pure module from its own command handler.

Suggested pure functions:

```ts
function normalizeEmoji(input: Emoji): ToolboxEmojiItem
function getCatalogStats(items: Emoji[]): CatalogStats
function queryEmojis(items: Emoji[], filter: FilterState): Emoji[]
function getBestImageUrl(item: Emoji): string | null
function sanitizeEmojiFileName(name: string): string
```

## 6. Error Handling

Return a structured error instead of throwing directly across the tool boundary.

```ts
interface ToolboxError {
  ok: false
  code:
    | 'CATALOG_LOAD_FAILED'
    | 'CATALOG_INVALID'
    | 'EMOJI_NOT_FOUND'
    | 'NO_IMAGE_URL'
    | 'DOWNLOAD_FAILED'
    | 'ZIP_FAILED'
  message: string
  details?: unknown
}
```

Common cases:

- Dataset fetch fails: ask the user to retry or verify deployment paths.
- Item id does not exist: return `EMOJI_NOT_FOUND`.
- `url_list` is empty: return `NO_IMAGE_URL`.
- Some images fail in batch mode: continue the batch, report failed ids in the
  final response, and keep successful files in the ZIP.

## 7. Deployment Notes

Web/PWA:

- Static output directory: `dist`.
- Cloudflare Pages build command: `npm run build`.
- Cloudflare Pages output directory: `dist`.
- PWA files: `public/manifest.webmanifest`, `public/sw.js`, `public/icons/*`.

## 8. Legal And Compliance Risk

This section is not legal advice. It is an engineering risk checklist for
deciding how to integrate and distribute the tool.

### 8.1 Risk Summary

Code risk: low.

- The project code is MIT licensed in `LICENSE`.
- Reusing or adapting the code is usually fine if the MIT notice is preserved.

Emoji asset risk: medium to high.

- The dataset points to third-party image URLs. The project does not own the
  emoji image copyrights or related rights.
- Downloading for personal study has lower practical risk than redistribution,
  commercial use, packaging assets into another product, or hosting mirrors.
- Bundling the images, re-uploading them, or selling access to them can trigger
  copyright, trademark, platform-rule, and unfair-competition issues.

Platform terms risk: medium to high.

- Douyin's user agreement says the service is licensed for personal,
  revocable, non-transferable, non-exclusive, non-commercial use, and reserves
  ungranted rights.
- The same agreement restricts unauthorized crawling, copying, downloading,
  mirroring, commercial use, and third-party provision of Douyin information or
  content.
- Open-platform agreements also emphasize that platform-provided content,
  software, images, pages, audio, video, and marks are protected intellectual
  property, and that developers must not imply official cooperation without
  written authorization.

Branding risk: medium.

- Avoid using "抖音", "Douyin", official logos, official-style icons, or product
  names in a way that suggests endorsement, official status, authorization, or
  brand affiliation.
- For a toolbox entry, prefer a neutral name such as "Emoji Catalog Helper" or
  "短视频表情目录工具", with a clear disclaimer that it is unofficial.

Privacy/security risk: low in the current app.

- The current implementation is static and does not collect user personal data.
- If the toolbox adds login, analytics, remote logging, or cloud download
  storage, add a privacy notice and minimize collected data.

Availability risk: medium.

- Remote CDN URLs may expire, change, be rate-limited, or stop allowing direct
  fetches.
- The toolbox should treat image URLs as unstable external sources.

### 8.2 Safer Integration Pattern

Use this pattern if you want the lowest-risk practical integration:

- Keep only the catalog metadata in the toolbox.
- Do not bundle or mirror third-party image assets.
- Make downloads user-initiated, not automatic background scraping.
- Show the target count and source domain before batch download.
- Rate-limit batch downloads and keep concurrency low.
- Do not bypass authentication, paywalls, signatures, hotlink protection, or
  rate limits.
- Do not use official Douyin logos or claim official affiliation.
- Add a takedown/contact path in the app or toolbox documentation.
- Keep the tool non-commercial unless you have rights clearance.
- If distributing packaged apps publicly, add a clear unofficial notice and
  review the target store rules for third-party content downloaders.

### 8.3 Suggested Disclaimer Text

```text
本工具为非官方的表情目录与下载辅助工具，仅用于学习、研究和个人整理。
表情图片、名称、来源链接及相关权利归原权利人所有。本工具不拥有这些素材
的版权或商标权，不提供官方授权、品牌代理或商业使用许可。请勿将下载内容
用于商业分发、二次售卖、公开镜像或任何侵犯第三方权益的场景。如权利人认
为相关内容不应展示，请联系维护者处理。
```

### 8.4 Official References Checked

Checked on 2026-05-20:

- Douyin user service agreement:
  https://www.douyin.com/draft/douyin_agreement/douyin_agreement_user.html?id=6773906068725565448
- Douyin open platform developer service agreement:
  https://open.douyin.com/platform/resource/docs/operation-standard/agreement-protocol
- Douyin open platform service agreement:
  https://developer.open-douyin.com/docs/resource/zh-CN/developer/operation-norm/platform-protocol/register-protocol/
- Douyin open platform operation standard:
  https://developer.open-douyin.com/docs/resource/zh-CN/developer/operation-norm/operation-standard
- Douyin SDK developer standard:
  https://developer.open-douyin.com/docs/resource/zh-CN/dop/operation-standard/platform-capabilities/douyin-sdk-developer-standard

## 9. Non-Goals

- Do not implement automated crawling.
- Do not bypass platform technical protections.
- Do not claim official Douyin authorization.
- Do not guarantee URL permanence.
- Do not treat the dataset as a rights-cleared asset library.
