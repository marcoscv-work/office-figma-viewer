# Models

Data contract between Figma, the local configuration API, and `public/index.html`.

## Fixed Runtime Values

```js
POLL_MS = 300000
DEFAULT_SECONDS = 15
IMAGE_SCALE = 1
IMAGE_FORMAT = "jpg"
LIGHTS_URL = "ws://designlights.local/ws"
```

`figmaToken`, `fileKey`, and `pageName` are read from:

```text
/api/carousel-config
```

## Local Configuration

Stored on the Raspberry Pi as:

```text
/home/pi/design-dashboard-carousel/carousel-config.json
```

Shape:

```json
{
  "figmaToken": "",
  "fileKey": "BidKDsJvOdDy0xuFXEMg1F",
  "pageName": "carousel"
}
```

The repository version keeps `figmaToken` empty.

## Slide

Internal model built from each Figma frame:

```js
{
  id: "1:2",
  name: "1",
  seconds: 15,
  effect: "none",
  imageUrl: "https://..."
}
```

### `id`

Figma node id for the frame. It is used when requesting the exported image from `/v1/images/:file_key`.

### `name`

Frame name. Only top-level frames inside the configured page whose names start with a number are included.

Order is numeric ascending:

```text
1, 2, 3, 4...
```

### `seconds`

Slide duration in seconds.

Figma structure:

```text
Frame
└── Time
    └── Seconds
```

The parser reads the first text node named `Seconds` inside a group named `Time`, then extracts the first number it finds.

Fallback:

```js
15
```

### `effect`

Light effect triggered when the slide becomes active.

Figma structure:

```text
Frame
└── Effect
    └── type
```

`type` may be a Figma component instance with a variant property. In that case the viewer reads:

```js
node.componentProperties.type.value
```

If that property is missing, the viewer reads the first visible text node inside `type`.

Normalized values:

```text
none
chase
blends
dancing
```

Any unknown value becomes `none`.

### `imageUrl`

Temporary URL returned by Figma for the exported frame image.

Export parameters:

```text
format=jpg
scale=1
contents_only=true
use_absolute_bounds=true
```

For `1920x1080` frames, the resulting image should be `1920x1080`.

## Light Payloads

### Chase

```json
{"on":true,"bri":255,"playlist":{"ps":[6],"dur":[150],"transition":0,"repeat":1,"end":4}}
```

### Blends

```json
{"on":true,"bri":255,"playlist":{"ps":[7],"dur":[150],"transition":0,"repeat":1,"end":4}}
```

### Dancing

```json
{"on":true,"bri":255,"playlist":{"ps":[8],"dur":[150],"transition":0,"repeat":1,"end":4}}
```

## Local API

### Read Configuration

```text
GET /api/carousel-config
```

### Write Configuration

```text
POST /api/carousel-config
Content-Type: application/json
```

Body:

```json
{
  "figmaToken": "",
  "fileKey": "BidKDsJvOdDy0xuFXEMg1F",
  "pageName": "carousel"
}
```

## Figma API

### Read File

```text
GET https://api.figma.com/v1/files/:file_key
X-Figma-Token: <token>
```

Used to:

- Find the configured page.
- Read frames.
- Read `lastModified`.
- Read `Time > Seconds` and `Effect > type`.

### Export Image

```text
GET https://api.figma.com/v1/images/:file_key?ids=:node_id&format=jpg&scale=1&contents_only=true&use_absolute_bounds=true
X-Figma-Token: <token>
```

Images are requested one by one to reduce blocking and memory pressure on older Chromium builds.

## Main States

```text
no token         Shows a configuration error with a clickable admin page link.
loading          Reads local config, Figma file, and exported images.
ready            Renders slides in a loop.
error            Shows a centered black error screen.
remote admin     Served from /admin.html.
```

## Load Cycle

```text
1. GET /api/carousel-config.
2. Read token, fileKey, and pageName from the local JSON config.
3. GET /files/:file_key.
4. Find the configured page.
5. Filter numbered frames.
6. Sort frames by numeric name.
7. Read seconds and effect.
8. Export each frame as JPG.
9. Render <div class="slide"><img></div>.
10. Start the carousel loop.
11. Repeat the check every 5 minutes.
```
