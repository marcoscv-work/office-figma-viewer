# Deploy

Guía rápida para instalar el visor en una Raspberry en modo kiosko.

## Directorio

Ruta usada en producción:

```text
/home/pi/design-dashboard-carousel
```

Copiar el contenido del repositorio a esa carpeta.

## Servicio

Instalar el servicio systemd:

```bash
sudo cp deploy/design-dashboard-carousel.service /etc/systemd/system/design-dashboard-carousel.service
sudo systemctl daemon-reload
sudo systemctl enable design-dashboard-carousel.service
sudo systemctl restart design-dashboard-carousel.service
```

Verificar:

```bash
systemctl status design-dashboard-carousel.service
journalctl -u design-dashboard-carousel.service -n 50 --no-pager
```

## Kiosko

Editar:

```text
/home/pi/.config/lxsession/LXDE-pi/autostart
```

Contenido recomendado:

```text
@xset s off
@xset -dpms
@xset s noblank
@chromium-browser --incognito --disable-pinch --overscroll-history-navigation=0 --autoplay-policy=no-user-gesture-required --no-user-gesture-required --noerrdialogs --kiosk http://localhost:7777/index.html
@unclutter -idle 0
```

Hay una copia de referencia en:

```text
deploy/lxde-autostart
```

## URLs

Carrusel:

```text
http://localhost:7777/index.html
```

Admin remoto:

```text
http://raspberrydesign:7777/admin.html
```

## Configuración

El admin guarda:

```text
/home/pi/design-dashboard-carousel/carousel-config.json
```

Formato:

```json
{
  "figmaToken": "",
  "fileKey": "BidKDsJvOdDy0xuFXEMg1F",
  "pageName": "carousel"
}
```
