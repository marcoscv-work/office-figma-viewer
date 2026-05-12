# Models

Contrato de datos entre Figma y `index.html`.

## Configuración Fija

```js
POLL_MS = 300000
DEFAULT_SECONDS = 15
IMAGE_SCALE = 1
IMAGE_FORMAT = "jpg"
LIGHTS_URL = "ws://designlights.local/ws"
```

`fileKey`, `pageName` y `figmaToken` se leen desde:

```text
/api/carousel-config
```

## Slide

Modelo interno que el HTML construye a partir de cada frame:

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

Node id del frame en Figma. Se usa para pedir la imagen exportada al endpoint `/v1/images/:file_key`.

### `name`

Nombre del frame. Solo entran frames de primer nivel dentro de la página `carousel` cuyo nombre empieza por número.

El orden es numérico ascendente:

```text
1, 2, 3, 4...
```

### `seconds`

Duración del slide en segundos.

Origen en Figma:

```text
Frame
└── Time
    └── Seconds
```

Se lee el primer nodo de texto llamado `Seconds` dentro de un grupo llamado `Time`. El parser extrae el primer número que encuentre.

Fallback:

```js
15
```

### `effect`

Efecto de luz que se dispara al entrar el slide.

Origen en Figma:

```text
Frame
└── Effect
    └── type
```

`type` puede ser una instancia de componente con variante. En ese caso se lee:

```js
node.componentProperties.type.value
```

Si no existe esa propiedad, se lee el primer texto visible dentro de `type`.

Valores normalizados:

```text
none
chase
blends
dancing
```

Cualquier valor no reconocido se convierte en `none`.

### `imageUrl`

URL temporal devuelta por Figma para la imagen exportada.

Parámetros de exportación:

```text
format=jpg
scale=1
contents_only=true
use_absolute_bounds=true
```

Con frames `1920x1080`, la imagen resultante debe ser `1920x1080`.

## Payloads de Luz

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

## Endpoints de Figma

### Leer archivo

```text
GET https://api.figma.com/v1/files/:file_key
X-Figma-Token: <token>
```

Se usa para:

- Encontrar la página `carousel`.
- Leer frames.
- Leer `lastModified`.
- Leer textos `Time > Seconds` y `Effect > type`.

### Exportar imagen

```text
GET https://api.figma.com/v1/images/:file_key?ids=:node_id&format=jpg&scale=1&contents_only=true&use_absolute_bounds=true
X-Figma-Token: <token>
```

Las imágenes se piden una por una para reducir bloqueos y consumo en Chromium antiguo.

## Estados Principales

```text
sin token        Muestra error de configuración con enlace al admin remoto.
cargando         Lee configuración, archivo Figma y exporta imágenes.
listo            Renderiza slides en bucle.
error            Muestra mensaje negro centrado.
admin remoto     Se sirve desde /admin.html.
```

## Ciclo de Carga

```text
1. GET /api/carousel-config.
2. Leer token, fileKey y pageName desde el JSON local.
3. GET /files/:file_key.
4. Buscar la página configurada.
5. Filtrar frames numerados.
6. Ordenar por nombre numérico.
7. Leer seconds y effect.
8. Exportar cada frame como JPG.
9. Renderizar <div class="slide"><img></div>.
10. Iniciar el bucle.
11. Repetir comprobación cada 5 minutos.
```
