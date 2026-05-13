# Office Figma Viewer

Slide carousel for an office display driven by a Raspberry Pi kiosk browser.

The app runs through a small dependency-free Node server. It reads a configured Figma file, exports numbered frames from a page as clipped JPG images, and displays them in sequence with a blue progress bar.

## Usage

Kiosk URL:

```text
http://localhost:7777/index.html
```

Remote admin page:

```text
http://raspberrydesign:7777/admin.html
```

Paste a Figma personal access token into the admin page and click `Save`. The token is stored in `carousel-config.json` on the Raspberry Pi, not in the repository.

## Raspberry Pi

Deployment directory:

```text
/home/pi/design-dashboard-carousel
```

systemd service:

```text
design-dashboard-carousel.service
```

Useful commands:

```bash
sudo systemctl status design-dashboard-carousel.service
sudo systemctl restart design-dashboard-carousel.service
journalctl -u design-dashboard-carousel.service -n 50 --no-pager
```

## Figma

Configured file:

```text
https://www.figma.com/design/BidKDsJvOdDy0xuFXEMg1F/Design-Dashboard
```

Expected page:

```text
carousel
```

Each slide must be a top-level frame on that page with a numeric name:

```text
1
2
3
4
```

The carousel order is based on those numeric frame names.

Each frame is exported with these Figma image parameters:

```text
format=jpg
scale=1
contents_only=true
use_absolute_bounds=true
```

For `1920x1080` frames, `scale=1` keeps the exported image at `1920x1080`. `use_absolute_bounds=true` prevents content outside the frame bounds from being included in the export.

## Slide Duration

Each frame may include:

```text
Time
└── Seconds
```

`Seconds` must be a text node containing the number of seconds. Valid examples:

```text
15
15s
15 seconds
```

If the value is missing, empty, or unreadable, the carousel uses `15` seconds.

## Light Effects

Each frame may include:

```text
Effect
└── type
```

Supported values:

```text
none
Chase
Blends
Dancing
```

`none` sends nothing. The other values send a payload through WebSocket:

```text
ws://designlights.local/ws
```

`type` may be a Figma component instance with a variant property. The viewer reads `componentProperties.type.value` first and falls back to the visible child text.

## Refresh

The viewer checks Figma every 5 minutes using the file `lastModified` value.

When a change is detected, it reloads the frames and refreshes the exported images.

## Visible Errors

The carousel shows a black error screen when:

- No token is configured.
- The token is expired or does not have access.
- The configured Figma page does not exist.
- No numbered frames are found.
- Figma does not return exportable images.

## Files

```text
server.js              HTTP server on port 7777 + configuration API.
carousel-config.json   Empty default config; local deployments store the real token here.
public/index.html      Kiosk carousel.
public/admin.html      Remote configuration page.
DEPLOY.md              systemd and kiosk autostart installation notes.
README.md              Usage guide.
MODELS.md              Data contract and expected Figma structure.
OPS.md                 Operations and troubleshooting.
```

## Notes

- The admin page has no authentication. It is intended for a controlled local network.
- The Figma token must not be committed. Keep it only in the Raspberry Pi `carousel-config.json`.
- Slide transitions use a simple opacity fade for low resource usage.
- The bottom progress bar is `8px` high and adapts to each slide duration.
