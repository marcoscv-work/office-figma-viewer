# Deploy

Quick installation guide for a Raspberry Pi running Chromium in kiosk mode.

## Directory

Production path:

```text
/home/pi/design-dashboard-carousel
```

Copy the repository contents into that directory.

## Service

Install the systemd service:

```bash
sudo cp deploy/design-dashboard-carousel.service /etc/systemd/system/design-dashboard-carousel.service
sudo systemctl daemon-reload
sudo systemctl enable design-dashboard-carousel.service
sudo systemctl restart design-dashboard-carousel.service
```

Verify:

```bash
systemctl status design-dashboard-carousel.service
journalctl -u design-dashboard-carousel.service -n 50 --no-pager
```

## Kiosk

Edit:

```text
/home/pi/.config/lxsession/LXDE-pi/autostart
```

Recommended contents:

```text
@xset s off
@xset -dpms
@xset s noblank
@chromium-browser --incognito --disable-pinch --overscroll-history-navigation=0 --autoplay-policy=no-user-gesture-required --no-user-gesture-required --noerrdialogs --kiosk http://localhost:7777/index.html
@unclutter -idle 0
```

A reference copy is available at:

```text
deploy/lxde-autostart
```

## URLs

Carousel:

```text
http://localhost:7777/index.html
```

Remote admin:

```text
http://raspberrydesign:7777/admin.html
```

## Configuration

The admin page writes:

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
