# Obsidian themes

Four hand-written themes, ordered from least to most designed. Each is a
standalone folder containing `manifest.json` and `theme.css`, with full light
and dark palettes. No plugins are required; Nocturne gains live controls if you
happen to have Style Settings installed.

| Theme | Character | Reading face | Accent |
| --- | --- | --- | --- |
| **Vellum** | Minimal. Warm paper, one ink, hairline rules, no chrome. | Serif (Iowan / Palatino) | Muted bronze |
| **Graphite** | Clean and functional. Cool neutrals, cards, clear structure. | Sans (Inter) | Blue |
| **Meridian** | Editorial. Numbered headings, hanging pull-quotes, framed code. | Serif (Source Serif) | Terracotta + teal |
| **Nocturne** | Layered and configurable. Four elevations, frosted chrome, focus dimming. | Sans (Inter) | Indigo → violet |

## Install

Copy the theme folders into the vault's theme directory:

```sh
cp -R Vellum Graphite Meridian Nocturne ~/.Life/.obsidian/themes/
```

Then in Obsidian: **Settings → Appearance → Themes**, pick one from the
dropdown. If the vault was open while you copied, reload with `Cmd-R` (or
**Reload app without saving** from the command palette) so the list refreshes.

Each theme handles light and dark on its own — switching the base colour scheme
under Appearance swaps palettes without changing themes.

## Fonts

The stacks degrade gracefully, but each theme looks as intended with its first
choice installed:

- **Vellum** — Iowan Old Style (ships with macOS) or Palatino
- **Graphite / Nocturne** — [Inter](https://rsms.me/inter/), JetBrains Mono
- **Meridian** — Source Serif 4, iA Writer Duo

## Nocturne + Style Settings

Nocturne ships a Style Settings schema. With that plugin installed you get live
controls for accent colour, reading width, font size, line height, translucent
sidebars, dimming of inactive panes, link underlines, and reduced motion. Without
the plugin the defaults apply and everything still works.

Extras worth knowing about in Nocturne:

- Two additional callout types — `> [!hypothesis]` and `> [!decision]`
- Extended task states: `- [>]` deferred, `- [-]` dropped, `- [!]` urgent,
  `- [?]` open question, `- [*]` starred
- Fenced code blocks show the language across the top rail

## Editing

Everything is driven by Obsidian's own CSS variables, grouped and commented by
section at the top of each file, so recolouring a theme usually means changing
the palette block and nothing else. The `--color-*-rgb` triplets must stay in
sync with their hex counterparts — callouts, the graph view and canvas colours
read the triplets.
