# Operations

Operational notes for running the carousel on a Raspberry Pi with Chromium in kiosk mode.

## Startup

Kiosk URL:

```text
http://localhost:7777/index.html
```

Service:

```text
design-dashboard-carousel.service
```

## Configuration

Open the remote admin page:

```text
http://raspberrydesign:7777/admin.html
```

Save a Figma token there. The kiosk reads the configuration from the local server.

The token is stored in:

```text
/home/pi/design-dashboard-carousel/carousel-config.json
```

To remove the token, open `admin.html` and click `Clear token`.

## Service Commands

```bash
sudo systemctl status design-dashboard-carousel.service
sudo systemctl restart design-dashboard-carousel.service
sudo systemctl enable design-dashboard-carousel.service
journalctl -u design-dashboard-carousel.service -n 50 --no-pager
```

The service listens at:

```text
http://raspberrydesign:7777
```

## Network Requirements

The Raspberry Pi needs access to:

```text
http://raspberrydesign:7777
https://api.figma.com
https://*.figma.com
ws://designlights.local/ws
```

If the light WebSocket is unavailable, the carousel still works. It simply skips light effects.

## Performance

Current choices:

- `jpg` exports to reduce image weight compared with PNG.
- `scale=1` to keep `1920x1080` output for Full HD frames.
- One-by-one image export requests to avoid long stalls in older Chromium builds.
- Simple `opacity` transitions.
- Progress bar animation through `requestAnimationFrame` with a lightweight fallback.

## Figma Changes

The viewer checks `lastModified` every 5 minutes.

When Figma changes:

```text
1. It reads the file again.
2. It exports images again.
3. It replaces the slide list.
4. It restarts the carousel with the updated slides.
```

## Troubleshooting

### Black screen with "No Figma token is configured"

Open:

```text
http://raspberrydesign:7777/admin.html
```

Save a valid Figma token.

### Token expired or missing access

The token may be revoked, mistyped, expired, or missing access to the file.

Generate a new token in Figma and save it again.

### Configured page is not found

Check that the Figma page name matches the configured value, usually:

```text
carousel
```

Matching ignores case and leading/trailing spaces, but not a different name.

### No slides found

Frames must be top-level children of the configured page and start with a number.

Valid:

```text
1
2
3 Intro
```

Not valid:

```text
Slide 1
Home
```

### Export includes content outside the frame

The image request must include:

```text
use_absolute_bounds=true
contents_only=true
```

This is already configured in `public/index.html`.

### Slide duration does not change

Check that the frame contains:

```text
Time
└── Seconds
```

`Seconds` must be a text node.

### Lights do not trigger

Check:

```text
ws://designlights.local/ws
```

And make sure the frame contains:

```text
Effect
└── type
```

If `type` is a component instance, its variant property must be named `type`.

Supported values:

```text
Chase
Blends
Dancing
```

## Change File or Page

Use the remote admin page:

```text
http://raspberrydesign:7777/admin.html
```

Or edit:

```text
/home/pi/design-dashboard-carousel/carousel-config.json
```

Fields:

```json
{
  "fileKey": "...",
  "pageName": "carousel"
}
```

## Change Refresh Frequency

Edit `public/index.html`:

```js
var POLL_MS = 5 * 60 * 1000;
```

## Change Default Duration

Edit `public/index.html`:

```js
var DEFAULT_SECONDS = 15;
```

## Change Light Payloads

Edit `public/index.html`:

```js
var LIGHTS = {
  chase: '...',
  blends: '...',
  dancing: '...'
};
```
