# AGENTS.md — LectureDoc2

Instructions for AI coding agents. Humans: see [README.md](README.md).

LectureDoc2 is the **browser runtime** of LectureDoc2 slide decks: the CSS and
ES modules a finished deck loads, plus fonts, icons and third-party assets. It
contains no Node code at runtime. Everything that runs at authoring time (MyST
→ HTML, PDF, publishing) lives in
[LectureDoc2Author](https://github.com/Delors/LectureDoc2Author).

## Layout

- `src/` — the sources: `ld.css` (declares the cascade layers `normalize,
  common, theme, utilities, ui, behavior` and imports everything), `ld.js`,
  `css/`, `js/`
- `components/` — web components (timeline, group assignment, …)
- `ext/` — fonts, icons, third-party assets
- `dist/` — build output of `pnpm build`; never edit it
- `SVGs.md` — how SVG drawings have to be written for the runtime

## Commands

```sh
pnpm build        # bundle src/ into dist/ (minified)
pnpm fmt:check    # prettier
pnpm lint:css     # stylelint
pnpm lint:js      # eslint
```

## Conventions

- Colours come from `--color`, `--background-color`, `--accent-color` and the
  variables derived from them in `src/css/theme.css`, switched per
  `[data-theme]`.
- `src/css/core/behavior.css` is the core of the runtime; changes there are
  likely to break LectureDoc2's JavaScript.

## Skills

Task-specific instructions, in the Agent Skills format (`SKILL.md` with
`name`/`description` frontmatter):

| task | skill |
| --- | --- |
| create, convert or review an SVG drawing for slides | [`skills/lecturedoc2-svg/SKILL.md`](skills/lecturedoc2-svg/SKILL.md) |
