# Operations

Notas para operar el carrusel en una Raspberry con Chromium.

## Arranque

URL del kiosko:

```text
http://localhost:7777/index.html
```

Servidor:

```text
design-dashboard-carousel.service
```

## Configuración

Abrir:

```text
http://raspberrydesign:7777/admin.html
```

Guardar el token de Figma. El kiosko leerá la configuración desde el servidor local.

El token queda en:

```text
/home/pi/design-dashboard-carousel/carousel-config.json
```

Para borrar el token, entrar en `admin.html` y pulsar `Borrar token`.

## Servicio

```bash
sudo systemctl status design-dashboard-carousel.service
sudo systemctl restart design-dashboard-carousel.service
sudo systemctl enable design-dashboard-carousel.service
journalctl -u design-dashboard-carousel.service -n 50 --no-pager
```

El servicio escucha en:

```text
http://raspberrydesign:7777
```

## Requisitos de Red

La Raspberry necesita acceso a:

```text
http://raspberrydesign:7777
https://api.figma.com
https://*.figma.com
ws://designlights.local/ws
```

Si las luces no están disponibles, el carrusel sigue funcionando. Solo no enviará efectos.

## Rendimiento

Decisiones actuales:

- `jpg` para reducir peso frente a PNG.
- `scale=1` para mantener `1920x1080` en frames Full HD.
- Exportación de imágenes una por una para evitar bloqueos largos en Chromium antiguo.
- Transición por `opacity`, sin animaciones pesadas.
- Barra de progreso con `requestAnimationFrame` y fallback ligero para Chromium antiguo.

## Cambios en Figma

El HTML comprueba `lastModified` cada 5 minutos.

Cuando Figma cambia:

```text
1. Vuelve a leer el archivo.
2. Vuelve a exportar imágenes.
3. Sustituye el listado de slides.
4. Reinicia el carrusel con las nuevas slides.
```

## Problemas Comunes

### Se queda en negro con "No hay token"

Entra en:

```text
http://raspberrydesign:7777/admin.html
```

Guarda un token válido de Figma.

### Dice que el token ha caducado

El token no tiene acceso al archivo, se ha revocado o está mal pegado.

Genera uno nuevo en Figma y guárdalo otra vez.

### No encuentra la página `carousel`

Comprueba que la página se llame exactamente:

```text
carousel
```

La comparación ignora mayúsculas y espacios extremos, pero no nombres distintos.

### No encuentra slides

Los frames deben estar directamente dentro de la página `carousel` y empezar por número.

Válido:

```text
1
2
3 Intro
```

No válido:

```text
Slide 1
Home
```

### La imagen sale con contenido de fuera del frame

La exportación debe incluir:

```text
use_absolute_bounds=true
contents_only=true
```

Esto ya está configurado en `public/index.html`.

### El tiempo no cambia

Comprueba que dentro del frame exista:

```text
Time
└── Seconds
```

`Seconds` debe ser un nodo de texto.

### Las luces no se disparan

Comprueba:

```text
ws://designlights.local/ws
```

Y que el frame tenga:

```text
Effect
└── type
```

Si `type` es una instancia de componente, su variant property debe llamarse `type`.

Con uno de estos valores:

```text
Chase
Blends
Dancing
```

## Cambiar Archivo o Página

Usar el admin remoto:

```text
http://raspberrydesign:7777/admin.html
```

O editar:

```text
/home/pi/design-dashboard-carousel/carousel-config.json
```

Campos:

```json
{
  "fileKey": "...",
  "pageName": "carousel"
}
```

## Cambiar Frecuencia de Refresco

Editar en `public/index.html`:

```js
var POLL_MS = 5 * 60 * 1000;
```

## Cambiar Duración por Defecto

Editar en `public/index.html`:

```js
var DEFAULT_SECONDS = 15;
```

## Cambiar Payloads de Luz

Editar en `public/index.html`:

```js
var LIGHTS = {
  chase: '...',
  blends: '...',
  dancing: '...'
};
```
