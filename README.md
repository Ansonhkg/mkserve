# mkserve

Turn any local markdown folder into a browsable docs site.

<video src="./assets/video.mp4" poster="./assets/icon.jpeg" controls muted playsinline width="100%"></video>

If the video does not render on your GitHub client, open [`assets/video.mp4`](./assets/video.mp4) directly.

## Install

```bash
bun install
bun link
```

## Usage

```bash
mkserve ./
mkserve ../docs --port 4000
mkserve --help
```

## Assets

Keep local images and files inside the served root, for example `./assets`.

```md
![Diagram](./assets/diagram.png)
```

## License

MIT
