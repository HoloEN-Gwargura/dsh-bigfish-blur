/**
 * Host half of the liquid-glass bundle.
 *
 * The window's frosted backdrop is built here instead of being left to the OS:
 * Windows' acrylic material tints unpredictably (a pale yellow cast regardless of
 * what sits behind the window), so the plugin paints the *current desktop
 * wallpaper*, blurred and veiled, underneath the page. This row reads that
 * wallpaper once and publishes it to the page as `--lg-wallpaper` through the
 * supported index-injection table, which both carriers (browser tab and Desktop
 * shell) apply while they render the index.
 *
 * Everything else about the appearance is owned by the Client module.
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** Current desktop wallpaper; Windows keeps this file current, slideshow included. */
const WALLPAPER = join(process.env.APPDATA ?? '', 'Microsoft', 'Windows', 'Themes', 'TranscodedWallpaper')

/** A wallpaper above this size falls back to the stylesheet's own canvas. */
const MAX_BYTES = 14 * 1024 * 1024

/**
 * Read the desktop wallpaper as a data URL.
 * @returns a `data:` URL, or `undefined` when it cannot be read.
 */
function wallpaperUrl() {
  try {
    const bytes = readFileSync(WALLPAPER)
    if (bytes.length === 0 || bytes.length > MAX_BYTES) return undefined
    return `data:image/jpeg;base64,${bytes.toString('base64')}`
  } catch {
    return undefined
  }
}

/**
 * Publish the wallpaper to the page through the index injection table.
 * @param ctx - host Cordis context.
 */
export function apply(ctx) {
  const url = wallpaperUrl()
  if (url === undefined) return
  const css = `:root{--lg-wallpaper:url("${url}")}`
  ctx.effect(
    () =>
      ctx.on('webserver/index-inject', (table) => {
        table.push({ kind: 'style', text: css })
      }),
    'liquid-glass: wallpaper injection',
  )
}
