import { loadHlsMpegts } from './loadHlsMpegts'

export type AttachStreamOptions = {
  /**
   * Đếm từ lúc bắt đầu attach (trước await libs). Hết giờ → onExhausted + cleanup.
   * Camera Live dùng 12000.
   */
  loadTimeoutMs?: number
  /** Gộp vào tham số thứ 2 của `mpegts.createPlayer` (vd. stashInitialSize cho live FLV). */
  mpegtsPlayerConfig?: { stashInitialSize?: number; lazyLoad?: boolean; enableWorker?: boolean }
  /** Mỗi lần thử một URL trong danh sách (để UI debug / state). */
  onPlayableSource?: (source: string) => void
}

/**
 * Gắn HLS / WS-FLV / MP4 vào phần tử video (sau khi đã có danh sách URL từ getWebPlayableStreamCandidates).
 * Dùng dynamic import hls.js + mpegts.js — không kéo vào chunk route.
 */
export async function attachStreamToVideoElement(
  videoEl: HTMLVideoElement,
  playableCandidates: string[],
  isDisposed: () => boolean,
  onExhausted: () => void,
  options?: AttachStreamOptions,
): Promise<() => void> {
  if (playableCandidates.length === 0) {
    onExhausted()
    return () => {}
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let hls: any = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let player: any = null

  let loadTimeoutId: ReturnType<typeof setTimeout> | null = null
  const clearLoadTimeout = () => {
    if (loadTimeoutId) {
      clearTimeout(loadTimeoutId)
      loadTimeoutId = null
    }
  }

  const cleanupCurrent = () => {
    if (hls) {
      hls.destroy()
      hls = null
    }
    if (player) {
      player.pause()
      player.unload()
      player.detachMediaElement()
      player.destroy()
      player = null
    }
    videoEl.removeAttribute('src')
    videoEl.load()
  }

  const mpegtsBase = {
    enableWorker: true,
    lazyLoad: false as const,
    ...options?.mpegtsPlayerConfig,
  }

  if (options?.loadTimeoutMs != null && options.loadTimeoutMs > 0) {
    loadTimeoutId = setTimeout(() => {
      if (isDisposed()) return
      clearLoadTimeout()
      onExhausted()
      cleanupCurrent()
    }, options.loadTimeoutMs)
  }

  let HlsCtor: Awaited<ReturnType<typeof loadHlsMpegts>>['Hls']
  let mpegtsLib: Awaited<ReturnType<typeof loadHlsMpegts>>['mpegts']
  try {
    const libs = await loadHlsMpegts()
    HlsCtor = libs.Hls
    mpegtsLib = libs.mpegts
  } catch {
    clearLoadTimeout()
    onExhausted()
    return () => {}
  }

  if (isDisposed()) {
    clearLoadTimeout()
    return () => {}
  }

  const trySourceAt = (index: number) => {
    if (isDisposed()) return
    if (index >= playableCandidates.length) {
      clearLoadTimeout()
      onExhausted()
      return
    }
    const source = playableCandidates[index]
    options?.onPlayableSource?.(source)
    cleanupCurrent()

    const isHlsStream = source.includes('.m3u8')
    const isWsStream = source.startsWith('ws://') || source.startsWith('wss://')
    const isMp4Stream = source.includes('.mp4')

    if (isHlsStream) {
      if (HlsCtor.isSupported()) {
        hls = new HlsCtor({ enableWorker: true, lowLatencyMode: true })
        hls.loadSource(source)
        hls.attachMedia(videoEl)
        hls.on(HlsCtor.Events.MANIFEST_PARSED, () => {
          clearLoadTimeout()
          const playResult = videoEl.play()
          if (playResult && typeof playResult.then === 'function') {
            playResult.catch(() => {})
          }
        })
        hls.on(HlsCtor.Events.ERROR, (_: unknown, data: { fatal?: boolean }) => {
          if (!data?.fatal) return
          cleanupCurrent()
          trySourceAt(index + 1)
        })
        return
      }

      if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
        videoEl.src = source
        const playResult = videoEl.play()
        if (playResult && typeof playResult.then === 'function') {
          playResult.catch(() => trySourceAt(index + 1))
        }
        return
      }

      trySourceAt(index + 1)
      return
    }

    if (isWsStream && mpegtsLib.isSupported()) {
      player = mpegtsLib.createPlayer(
        { type: 'flv', url: source, isLive: true, hasAudio: false },
        mpegtsBase,
      )
      player.attachMediaElement(videoEl)
      player.load()
      const playResult = player.play()
      if (playResult && typeof playResult.then === 'function') {
        playResult
          .then(() => {
            clearLoadTimeout()
          })
          .catch(() => trySourceAt(index + 1))
      }
      player.on(mpegtsLib.Events.ERROR, () => {
        clearLoadTimeout()
        cleanupCurrent()
        trySourceAt(index + 1)
      })
      return
    }

    if (isMp4Stream) {
      videoEl.src = source
      const playResult = videoEl.play()
      if (playResult && typeof playResult.then === 'function') {
        playResult.catch(() => trySourceAt(index + 1))
      }
      videoEl.onerror = () => {
        videoEl.onerror = null
        trySourceAt(index + 1)
      }
      return
    }

    trySourceAt(index + 1)
  }

  try {
    trySourceAt(0)
  } catch {
    clearLoadTimeout()
    onExhausted()
  }

  return () => {
    clearLoadTimeout()
    cleanupCurrent()
  }
}
