/** Dynamic import — tách khỏi main bundle; chỉ tải khi cần phát stream. */
export async function loadHlsMpegts() {
  const [{ default: Hls }, { default: mpegts }] = await Promise.all([
    import('hls.js'),
    import('mpegts.js'),
  ])
  return { Hls, mpegts }
}
