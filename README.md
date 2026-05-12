# Design Dashboard Carousel

Visualizador de slides para una pantalla controlada por Raspberry/Chromium.

El proyecto se sirve con un servidor Node pequeño en la Raspberry, sin build ni dependencias externas. Lee una página concreta de Figma, exporta sus frames como imágenes JPG y los muestra en bucle con una barra azul de progreso.

## Uso

URL del kiosko:

```text
http://localhost:7777/index.html
```

Configuración remota:

```text
http://raspberrydesign:7777/admin.html
```

Pega el token en el campo visible y pulsa `Guardar`. El token queda guardado en `carousel-config.json` dentro de la Raspberry.

## Raspberry

Directorio de despliegue:

```text
/home/pi/design-dashboard-carousel
```

Servicio systemd:

```text
design-dashboard-carousel.service
```

Comandos útiles:

```bash
sudo systemctl status design-dashboard-carousel.service
sudo systemctl restart design-dashboard-carousel.service
journalctl -u design-dashboard-carousel.service -n 50 --no-pager
```

## Figma

Archivo:

```text
https://www.figma.com/design/BidKDsJvOdDy0xuFXEMg1F/Design-Dashboard
```

Página esperada:

```text
carousel
```

Dentro de esa página, cada slide debe ser un frame de primer nivel con nombre numérico:

```text
1
2
3
4
```

El orden del carrusel se calcula por ese número.

Cada frame se exporta con estos parámetros de Figma:

```text
format=jpg
scale=1
contents_only=true
use_absolute_bounds=true
```

Con frames de `1920x1080`, `scale=1` mantiene la salida final en `1920x1080`. `use_absolute_bounds=true` evita que Figma exporte contenido que sobresale fuera del área del frame.

## Tiempo de Slide

Cada frame puede incluir:

```text
Time
└── Seconds
```

`Seconds` debe ser un texto con el número de segundos. Ejemplos válidos:

```text
15
15s
15 seconds
```

Si no existe, está vacío o no se puede leer, el carrusel usa `15` segundos.

## Efectos de Luz

Cada frame puede incluir:

```text
Effect
└── type
```

Valores soportados:

```text
none
Chase
Blends
Dancing
```

`none` no envía nada. Los demás envían un payload por WebSocket a:

`type` puede ser una instancia/variant component de Figma. El HTML lee primero `componentProperties.type.value` y, si no existe, usa el texto hijo visible.

```text
ws://designlights.local/ws
```

## Refresco

El HTML comprueba cambios en Figma cada 5 minutos usando `lastModified`.

Si detecta cambios, vuelve a leer los frames y refresca las imágenes exportadas.

## Errores Visibles

El carrusel muestra pantalla negra con mensaje cuando:

- No hay token configurado.
- El token ha caducado o no tiene permisos.
- No existe la página `carousel`.
- No hay frames numerados.
- Figma no devuelve imágenes exportables.

## Archivos

```text
server.js              Servidor HTTP en puerto 7777 + API de configuración.
carousel-config.json   Token, file key y página de Figma.
public/index.html      Carrusel del kiosko.
public/admin.html      Configuración remota.
DEPLOY.md              Instalación de systemd y autostart.
README.md              Guía de uso.
MODELS.md              Contrato de datos y estructura esperada en Figma.
OPS.md                 Operación en Raspberry/Chromium y solución de problemas.
```

## Notas

- No hay seguridad en la pantalla de administración; está pensada para entorno controlado.
- El token no se guarda en el código, solo en `carousel-config.json` en la Raspberry.
- La transición entre slides es una opacidad simple para consumir pocos recursos.
- La barra azul inferior mide `8px` y se adapta a la duración de cada slide.
