# mkserve

Serve a local markdown directory as a browsable docs site with a compact file tree and a built-in markdown viewer.

## What it does

- serves all `.md` and `.markdown` files in a directory and nested directories
- shows a compact sidebar tree for navigation
- supports rendered and raw markdown views
- syntax-highlights raw markdown and code blocks
- supports relative local assets inside markdown
- supports in-document anchor navigation
- supports light/dark preview mode
- copies full markdown or individual code blocks

## Requirements

- Bun 1.3+

## Install

```bash
bun install
bun link
```

The `bun link` step exposes `mkserve` globally on your machine.

## Usage

Serve the current directory:

```bash
mkserve ./
```

Serve a different directory:

```bash
mkserve ../docs
```

Serve on a different port:

```bash
mkserve ./ --port 4000
```

Show help:

```bash
mkserve --help
```

By default, mkserve runs on:

```text
http://127.0.0.1:4321
```

## Recommended structure

Example docs folder:

```text
docs/
  README.md
  getting-started.md
  architecture/
    overview.md
  assets/
    diagram.png
    hero.svg
```

If your markdown files reference local images or other local files, keep them in `./assets` or another relative folder inside the served root.

Example markdown:

```md
![Architecture](./assets/diagram.png)

[Open SVG](./assets/hero.svg)
```

mkserve will resolve those relative links and serve them from the same root directory.

## Features

- render view for normal reading
- raw view for source inspection
- syntax-highlighted markdown source
- copy markdown button
- copy code button on fenced code blocks
- compact tree navigation for nested docs
- heading anchor navigation from table of contents links
- preview light/dark mode for documents and SVG readability

## Development

Run the HTTP adapter directly from the repo root:

```bash
bun run dev
```

Run the CLI directly:

```bash
bun run cli -- ./
```

## License

MIT. See `LICENSE`.
