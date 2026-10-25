/**
 * Client half of the liquid-glass bundle.
 *
 * The frosted backdrop is painted by the plugin, not by Windows: the Host half
 * injects the current desktop wallpaper as `--lg-wallpaper`, and this sheet blurs
 * it under a milky veil as the page canvas. (Windows' own acrylic material was
 * tried first; on this machine it renders an uncontrollable pale yellow cast that
 * has nothing to do with what sits behind the window.)
 *
 * Surfaces:
 *   - base sheets (frame, sidebar, content column) carry the desktop tint;
 *   - the composer and the transcript use the same airy tint as the sidebar, so
 *     one side of the window is not milkier than the other;
 *   - menus and popovers stay near opaque so text never shows through text.
 *
 * Two rules keep the product's own chrome from turning into lines: horizontal
 * borders and inset hairlines are flattened inside the conversation, and the
 * composer seat gets a soft fade so the scroll viewport's clipped edge disappears.
 */
window.__ModuleLoader__.load({
  id: 'dsh-liquid-glass',
  factory() {
    /** Layer identity for the token overrides (also names the origin in inspection). */
    const PLUGIN_ID = 'dsh-liquid-glass'

    /** Fallback canvas for when the wallpaper could not be read. */
    const AURORA_LIGHT = [
      'radial-gradient(34% 40% at 10% 2%, rgba(64,108,255,0.92) 0%, rgba(64,108,255,0) 62%)',
      'radial-gradient(32% 38% at 94% 0%, rgba(255,84,162,0.78) 0%, rgba(255,84,162,0) 62%)',
      'radial-gradient(38% 42% at 100% 78%, rgba(22,204,182,0.80) 0%, rgba(22,204,182,0) 64%)',
      'radial-gradient(34% 38% at 0% 100%, rgba(255,164,52,0.72) 0%, rgba(255,164,52,0) 62%)',
      'radial-gradient(30% 34% at 44% 26%, rgba(146,104,255,0.72) 0%, rgba(146,104,255,0) 62%)',
      'linear-gradient(145deg, #b9c9ee 0%, #c9b7e8 40%, #a9dcd6 72%, #e8c8d8 100%)',
    ].join(',\n    ')

    const AURORA_DARK = [
      'radial-gradient(34% 40% at 8% 4%, rgba(34,84,206,0.92) 0%, rgba(34,84,206,0) 62%)',
      'radial-gradient(32% 38% at 94% 2%, rgba(122,38,166,0.78) 0%, rgba(122,38,166,0) 62%)',
      'radial-gradient(38% 42% at 98% 80%, rgba(10,140,132,0.66) 0%, rgba(10,140,132,0) 64%)',
      'radial-gradient(34% 38% at 2% 98%, rgba(150,68,24,0.44) 0%, rgba(150,68,24,0) 62%)',
      'linear-gradient(145deg, #080b12 0%, #0a0e17 48%, #070a10 100%)',
    ].join(',\n    ')

    const GLASS_CSS = `
:root {
  --lg-aurora-light: ${AURORA_LIGHT};
  --lg-aurora-dark: ${AURORA_DARK};
  --lg-rim: inset 0 1px 0 rgba(255, 255, 255, 0.34);
  --lg-rim-edge: 0 0 0 0.5px rgba(255, 255, 255, 0.16);
  --lg-lift: 0 1px 3px -1px rgba(16, 24, 44, 0.10);
}

/* ---------- canvas: the desktop wallpaper, blurred, under a milky veil ---------- */
html { background: transparent; }
body { background: transparent; }

body::before {
  content: "";
  position: fixed;
  inset: -8%;
  z-index: -2;
  pointer-events: none;
  background-color: #c9d6ee;
  background-image: var(--lg-wallpaper, var(--lg-aurora-light));
  background-size: cover;
  background-position: center;
  filter: blur(46px) saturate(118%) brightness(1.04);
  transform: scale(1.04);
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: rgba(255, 255, 255, 0.42);
}

body[data-ds-dark-theme]::before {
  background-color: #0a0d14;
  background-image: var(--lg-wallpaper, var(--lg-aurora-dark));
  filter: blur(46px) saturate(110%) brightness(0.72);
}

body[data-ds-dark-theme]::after {
  background: rgba(8, 10, 15, 0.52);
}

/* ---------- the shell ---------- */
/* The frame paints no material of its own: the columns do, so they can differ. */
div:has(> [data-shell-overlay]) { background: transparent; }
html[data-windows-titlebar] div:has(> [data-shell-overlay]) { background: transparent; }

/* Windows draws the content column on a rounded plate over the sidebar; over a
   translucent window that corner reads as a notch, so the plate is squared off. */
html[data-windows-titlebar] div:has(> [data-shell-overlay]) > div:nth-child(2) {
  border-radius: 0;
}

/* The caption strip is already tinted by the native title-bar overlay (it receives
   the measured sidebar fill), so the page must not tint it a second time. */
html[data-windows-titlebar] div:has(> [data-shell-overlay])::before {
  background: transparent !important;
  box-shadow: none !important;
}

/* ---------- nothing in the app draws a horizontal rule ---------- */
/* The product's own sheets are injected after this one, so the flattening has to
   win by importance. Fields keep their borders. */
:is(div, span, button, section, article, p, li, ul, ol, dl, dd, dt, header, footer, aside, nav, main, figure, blockquote, table, td, th),
:is(div, span, button, section, article, p, li, ul, ol, dl, dd, dt, header, footer, aside, nav, main, figure, blockquote, table, td, th)::before,
:is(div, span, button, section, article, p, li, ul, ol, dl, dd, dt, header, footer, aside, nav, main, figure, blockquote, table, td, th)::after {
  border-color: transparent !important;
}

/* The conversation and the composer area additionally lose every shadow and every
   pseudo-element fill: a 1px inset shadow and a filled ::before are the other two
   ways this design paints a hairline. Element shadows themselves are kept: with
   the elevation tokens reduced to plain soft shadows they are what makes a card
   read as a floating pane instead of paper. */
:is([data-conversation-content], [data-composer-seat], [data-composer-dock]) *::before,
:is([data-conversation-content], [data-composer-seat], [data-composer-dock]) *::after {
  background: transparent !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

/* Code and diff plates are glass like everything else 鈥?but they carry text, so
   they frost what is behind them instead of letting it ghost through: the fill
   comes from the (now translucent) code token and the backdrop does the blurring. */
:is([data-conversation-content], [data-conversation-region]) pre,
:is([data-conversation-content], [data-conversation-region]) [data-code-block-banner],
:is([data-conversation-content], [data-conversation-region]) [class*="codeBlock"],
:is([data-conversation-content], [data-conversation-region]) [class*="CodeBlock"],
:is([data-conversation-content], [data-conversation-region]) [class*="codePanel"],
:is([data-conversation-content], [data-conversation-region]) [class*="diffPanel"],
:is([data-conversation-content], [data-conversation-region]) [class*="diffView"] {
  background-image: none !important;
  -webkit-backdrop-filter: blur(34px) saturate(160%);
  backdrop-filter: blur(34px) saturate(160%);
}

/* Inline code stays a *tell*, not a block: a nearly flat fill plus one hairline,
   so it reads as a glass chip instead of a white sticker. */
:is([data-conversation-content], [data-conversation-region]) :not(pre) > code {
  box-shadow: inset 0 0 0 0.5px rgba(255, 255, 255, 0.34);
}

/* The composer seat paints nothing of its own: it inherits the conversation glass,
   so the input area can never look like a separate strip with a top and bottom
   edge. Everything it used to draw (fill, fade, border, shadow) is dropped. */
[data-composer-seat],
[data-composer-seat]:is(:hover, :focus-within) {
  background: none !important;
  border: 0 !important;
  box-shadow: none !important;
  outline: 0 !important;
}

/* The card itself keeps its material. What must disappear is the box *inside* it:
   the editable area paints its own fill and inner shadow, which reads as a second
   rectangle sitting in the card. The draft now sits flush on the card. */
[data-composer-card] :is([data-composer-input], [data-composer-text-ref], [contenteditable="true"], textarea) {
  background: none !important;
  border: 0 !important;
  box-shadow: none !important;
  outline: 0 !important;
}

/* The sidebar foot duplicates the sidebar tint on its own container box, which
   shows up as a lighter block above the account row. The account trigger is the
   anchor (data-collapsed is its own attribute), so the boxes around it drop their
   fill and the column tint shows through evenly. */
/* The pale band above the account row is a scroll fade: a 24px span whose gradient
   lightens the bottom of the session list. Over glass it reads as a separate plate,
   so the fade is removed and the column tint continues straight down. */
div:has(> [data-shell-overlay]) > div:nth-child(1) [class*="_fade"],
div:has(> [data-shell-overlay]) > div:nth-child(1) [class*="_Fade"] {
  background: none !important;
  background-image: none !important;
  opacity: 0 !important;
}

/* The sidebar foot paints its own lighter plate above the account row. The
   account trigger is transparent itself, so the fill lives on one of its
   wrappers — every ancestor of the trigger up to four levels drops it. */
div:has(> [data-shell-overlay]) > div:nth-child(1) :is(
  :has(> button[data-collapsed]),
  :has(> button[data-signed-out]),
  :has(> div > button[data-collapsed]),
  :has(> div > button[data-signed-out]),
  :has(> div > div > button[data-collapsed]),
  :has(> div > div > div > button[data-collapsed]),
  :has(> div > div > div > div > button[data-collapsed])
) {
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
}

div:has(> [data-shell-overlay]) > div:nth-child(1) :is(
  :has(> button[data-collapsed]),
  :has(> div > button[data-collapsed]),
  :has(> div > div > button[data-collapsed]),
  :has(> div > div > div > button[data-collapsed])
)::before,
div:has(> [data-shell-overlay]) > div:nth-child(1) :is(
  :has(> button[data-collapsed]),
  :has(> div > button[data-collapsed]),
  :has(> div > div > button[data-collapsed]),
  :has(> div > div > div > button[data-collapsed])
)::after {
  background: transparent !important;
  background-image: none !important;
}

/* ---------- surfaces that hold a whole page of text must be near opaque ---------- */
/* The settings dialog is a full page of text sitting above the conversation. With
   glass tints it let the chat read straight through, so it is pinned to a solid
   plate (and so are the cards inside it). No backdrop-filter here: a dialog can
   host popovers, and a filter would make it their containing block. */
[role="dialog"],
[role="dialog"] [class*="card"],
[role="dialog"] [class*="Card"] {
  background-color: rgba(247, 250, 254, 0.97) !important;
  background-image: none !important;
}

body[data-ds-dark-theme] [role="dialog"],
body[data-ds-dark-theme] [role="dialog"] [class*="card"],
body[data-ds-dark-theme] [role="dialog"] [class*="Card"] {
  background-color: rgba(22, 25, 31, 0.97) !important;
}

/* Third-party pages built out of the layer tokens inherit this theme's airy values
   and end up as ghosts of themselves. Inside the plugin market's own root the
   layers are raised to real card weight, so the list reads like a list again. */
[data-dsh-market-root],
[data-dsh-market-portal] {
  --dsw-alias-bg-layer-1: rgba(255, 255, 255, 0.55);
  --dsw-alias-bg-layer-2: rgba(255, 255, 255, 0.72);
  --dsw-alias-bg-layer-3: rgba(255, 255, 255, 0.86);
  --dsw-alias-bg-module-platform: rgba(255, 255, 255, 0.45);
}

body[data-ds-dark-theme] [data-dsh-market-root],
body[data-ds-dark-theme] [data-dsh-market-portal] {
  --dsw-alias-bg-layer-1: rgba(30, 34, 42, 0.62);
  --dsw-alias-bg-layer-2: rgba(32, 36, 44, 0.78);
  --dsw-alias-bg-layer-3: rgba(36, 40, 48, 0.88);
  --dsw-alias-bg-module-platform: rgba(30, 34, 42, 0.52);
}

/* ---------- big panels get real frost, not just tint ---------- */
/* Panes that hold a whole page of content (the right sidebar with its document /
   file preview, and third-party full-page UIs) are frosted as well as tinted, so
   whatever sits behind them turns into colour instead of legible text. Dialogs are
   deliberately excluded: they are already 97% and a filter would make them the
   containing block of any popover they open. */
[data-rightbar-col],
[data-dsh-market-root],
[data-dsh-market-portal] {
  -webkit-backdrop-filter: blur(44px) saturate(150%);
  backdrop-filter: blur(44px) saturate(150%);
}

/* The sidebar's search field and its result rows sit on the sidebar tint; give the
   field itself a plate so the placeholder stays readable over a busy wallpaper. */
div:has(> [data-shell-overlay]) :is([role="searchbox"], input[type="search"], input[placeholder]),
[data-shell-overlay] :is([role="searchbox"], input[type="search"], input[placeholder]) {
  background-color: rgba(255, 255, 255, 0.55) !important;
  -webkit-backdrop-filter: blur(28px) saturate(140%);
  backdrop-filter: blur(28px) saturate(140%);
}

body[data-ds-dark-theme] div:has(> [data-shell-overlay]) :is([role="searchbox"], input[type="search"], input[placeholder]),
body[data-ds-dark-theme] [data-shell-overlay] :is([role="searchbox"], input[type="search"], input[placeholder]) {
  background-color: rgba(24, 27, 33, 0.62) !important;
}

/* ---------- liquid-glass controls: paint only ---------- */
/* The deliverables card (the "presented file" plate) defines its own near-white
   fill on its root element. It shows up both inside the transcript and in the
   shell, so the variable is re-pointed everywhere rather than per region. */
body *,
body *::before,
body *::after {
  --deliverable-fill: rgba(255, 255, 255, 0.16) !important;
  --deliverable-hover: rgba(255, 255, 255, 0.26) !important;
  /* The "edited file" change card keeps its own pair of fills. */
  --changes-fill: rgba(255, 255, 255, 0.16) !important;
  --changes-hover: rgba(255, 255, 255, 0.26) !important;
}

body[data-ds-dark-theme] *,
body[data-ds-dark-theme] *::before,
body[data-ds-dark-theme] *::after {
  --deliverable-fill: rgba(255, 255, 255, 0.08) !important;
  --deliverable-hover: rgba(255, 255, 255, 0.14) !important;
  --changes-fill: rgba(255, 255, 255, 0.08) !important;
  --changes-hover: rgba(255, 255, 255, 0.14) !important;
}

/* A capsule with a rim and a lift is only right for the composer's own buttons.
   Wide rows stay perfectly flat: a rim on a wide translucent row reads as a
   stray outline. */
:is([data-composer-card] button, [data-composer-card] [role="button"]) {
  box-shadow: var(--lg-rim), inset 0 -1px 0 rgba(255, 255, 255, 0.22), var(--lg-rim-edge), var(--lg-lift);
  transition: box-shadow 150ms ease, transform 150ms cubic-bezier(0.2, 0.9, 0.2, 1);
}

:is([data-composer-card] button, [data-composer-card] [role="button"]):hover {
  box-shadow: var(--lg-rim), inset 0 -1px 0 rgba(255, 255, 255, 0.30), var(--lg-rim-edge),
    0 4px 12px -2px rgba(16, 24, 44, 0.22);
}

:is([data-composer-card] button, [data-composer-card] [role="button"]):active {
  transform: scale(0.975);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.55), var(--lg-rim-edge),
    0 1px 3px -1px rgba(16, 24, 44, 0.18);
}

:is(button, [role="button"]):not([data-composer-card] *) {
  box-shadow: none;
}

body[data-ds-dark-theme] :is([data-composer-card] button, [data-composer-card] [role="button"]) {
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 0 0 0.5px rgba(255, 255, 255, 0.09),
    0 2px 6px -1px rgba(0, 0, 0, 0.45);
}

/* Fields read as recessed glass (painting only, no filter, no geometry change). */
input:not([type="range"]),
textarea,
select,
[contenteditable="true"] {
  box-shadow: inset 0 1px 2px rgba(16, 24, 44, 0.06), inset 0 -1px 0 rgba(255, 255, 255, 0.40);
}

@media (prefers-reduced-motion: reduce) {
  :is(button, [role="button"]) { transition: none; }
  :is([data-composer-card] button, [data-composer-card] [role="button"]):active { transform: none; }
}

@media (prefers-reduced-transparency: reduce) {
  body::before {
    background-image: none;
    background-color: #f2f4f8;
    filter: none;
    transform: none;
  }
  body[data-ds-dark-theme]::before {
    background-color: #0b0e14;
  }
  body::after { background: transparent; }
}
`

    /**
     * Translucent materials. The chat side and the sidebar are deliberately close:
     * 26% versus 20% white, so the window reads as one sheet of glass, while menus
     * and popovers stay near opaque for legibility.
     */
    const GLASS_TOKENS = {
      '--dsw-alias-bg-base': { light: 'rgba(255, 255, 255, 0.26)', dark: 'rgba(12, 14, 19, 0.34)' },
      '--dsw-alias-bg-layer-1': { light: 'rgba(255, 255, 255, 0.40)', dark: 'rgba(20, 23, 29, 0.48)' },
      '--dsw-alias-bg-layer-2': { light: 'rgba(255, 255, 255, 0.55)', dark: 'rgba(26, 29, 36, 0.60)' },
      '--dsw-alias-bg-layer-3': { light: 'rgba(255, 255, 255, 0.68)', dark: 'rgba(34, 37, 45, 0.72)' },
      '--dsw-alias-bg-overlay': { light: 'rgba(252, 253, 255, 0.92)', dark: 'rgba(22, 25, 32, 0.92)' },
      '--dsw-specific-sidebar-fill': { light: 'rgba(255, 255, 255, 0.20)', dark: 'rgba(6, 8, 12, 0.30)' },
      '--dsw-specific-input-major': { light: 'rgba(228, 234, 243, 0.88)', dark: 'rgba(30, 34, 42, 0.90)' },
      '--dsw-specific-bubble': { light: 'rgba(255, 255, 255, 0.22)', dark: 'rgba(30, 40, 56, 0.42)' },
      '--dsw-alias-button-elevated-fill': { light: 'rgba(255, 255, 255, 0.16)', dark: 'rgba(30, 33, 40, 0.50)' },
      '--dsw-alias-button-floating-fill': { light: 'rgba(255, 255, 255, 0.16)', dark: 'rgba(30, 33, 40, 0.50)' },
      /* The composer's "+" button, the workspace/model chips and the light hover
         fills are the remaining white blobs in the input row. */
      '--dsw-specific-selector': { light: 'rgba(255, 255, 255, 0.16)', dark: 'rgba(30, 33, 40, 0.44)' },
      '--dsw-alias-bg-module-platform': { light: 'rgba(255, 255, 255, 0.36)', dark: 'rgba(30, 33, 40, 0.50)' },
      '--dsw-alias-interactive-bg-hover-solid': { light: 'rgba(255, 255, 255, 0.24)', dark: 'rgba(255, 255, 255, 0.10)' },
      '--dsw-alias-button-ghost-active-fill': { light: 'rgba(255, 255, 255, 0.18)', dark: 'rgba(30, 33, 40, 0.40)' },
      /* Assistant-side rows stay airy, but anything that carries *code* must be
         readable: the diff/code preview sits above the message, so a translucent
         plate lets the message text ghost straight through it. The plate keeps the
         window's cool glass hue instead of paper white. */
      '--dsw-alias-turn-trigger-bg': { light: 'rgba(255, 255, 255, 0.12)', dark: 'rgba(255, 255, 255, 0.08)' },
      '--dsw-alias-markdown-code-block': { light: 'rgba(255, 255, 255, 0.20)', dark: 'rgba(255, 255, 255, 0.10)' },
      '--dsw-alias-markdown-inline-code': { light: 'rgba(255, 255, 255, 0.10)', dark: 'rgba(255, 255, 255, 0.08)' },
      '--dsw-alias-markdown-code-block-banner': { light: 'rgba(255, 255, 255, 0.16)', dark: 'rgba(255, 255, 255, 0.08)' },
      '--dsw-alias-markdown-code-segment-unselected': { light: 'rgba(255, 255, 255, 0.10)', dark: 'rgba(255, 255, 255, 0.06)' },
      '--dsw-alias-markdown-code-segment-selected': { light: 'rgba(255, 255, 255, 0.26)', dark: 'rgba(255, 255, 255, 0.18)' },
      /* Document preview panels (file / diff side panel) need the same readability. */
      '--dsw-alias-bg-document-preview': { light: 'rgba(244, 247, 252, 0.94)', dark: 'rgba(26, 30, 36, 0.94)' },
      '--dsw-menu-surface-fill': { light: 'rgba(249, 251, 255, 0.92)', dark: 'rgba(26, 29, 36, 0.93)' },
      '--dsw-specific-menu': { light: 'rgba(249, 251, 255, 0.93)', dark: 'rgba(26, 29, 36, 0.93)' },
      '--dsw-alias-settings-card-fill': { light: 'rgba(247, 250, 254, 0.90)', dark: 'rgba(26, 29, 36, 0.90)' },
      '--dsw-alias-menu-group-header-fill': { light: 'rgba(249, 251, 255, 0.97)', dark: 'rgba(26, 29, 36, 0.97)' },
      '--dsw-menu-backdrop-filter': { light: 'blur(48px) saturate(180%)', dark: 'blur(48px) saturate(180%)' },
      '--dsw-elevation-soft': {
        light: '0 14px 34px -18px rgba(18, 26, 48, 0.20)',
        dark: '0 14px 34px -18px rgba(0, 0, 0, 0.50)',
      },
      '--dsw-elevation-panel': {
        light: '0 20px 52px -24px rgba(18, 26, 48, 0.24)',
        dark: '0 20px 52px -24px rgba(0, 0, 0, 0.54)',
      },
      '--dsw-elevation-prominent': {
        light: '0 28px 70px -28px rgba(16, 24, 44, 0.28)',
        dark: '0 28px 70px -28px rgba(0, 0, 0, 0.60)',
      },
    }

    /**
     * Mount the glass appearance for exactly the owning plugin lifetime.
     * @param ctx - client Cordis context (the theme service is guaranteed by `inject`).
     */
    function apply(ctx) {
      ctx.effect(() => {
        const tag = document.createElement('style')
        tag.dataset.plugin = PLUGIN_ID
        tag.dataset.pluginCss = `${PLUGIN_ID}/glass.css`
        tag.textContent = GLASS_CSS
        document.head.appendChild(tag)
        return () => {
          tag.remove()
        }
      }, `${PLUGIN_ID}: glass stylesheet`)

      ctx.effect(() => ctx.theme.overrideTokens(PLUGIN_ID, GLASS_TOKENS), `${PLUGIN_ID}: glass materials`)
    }

    /** `theme` must be live before any override or sheet lands on the document. */
    const inject = ['theme']

    return { apply, inject }
  },
})
