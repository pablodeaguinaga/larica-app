# Cómo funciona el proyecto Larica (para ir aprendiendo)

Esta guía explica **qué hace cada archivo**, **cómo se relacionan** y **qué lenguajes y conceptos se usan**, pensada para alguien que está empezando.

---

## 1. ¿Qué lenguajes de programación hay aquí?

| Extensión | Lenguaje | Para qué se usa |
|-----------|----------|------------------|
| **`.tsx`** | TypeScript + JSX | Lógica y pantallas de la app (componentes React). |
| **`.ts`** | TypeScript | Datos, tipos y utilidades (sin dibujar en pantalla). |
| **`.css`** | CSS | Colores, fuentes, espaciados y tema (incl. modo oscuro). |
| **`.json`** | JSON | Configuración (nombre del proyecto, dependencias, etc.). |

- **TypeScript** es JavaScript con tipos: el navegador no lo entiende directo, así que el proyecto lo “compila” a JavaScript.
- **JSX** es la parte que parece HTML dentro del `.tsx` (por ejemplo `<div>`, `<button>`). React usa eso para construir la interfaz.

---

## 2. Estructura de carpetas (resumen)

```
larica/
├── package.json          ← Lista de dependencias y scripts (npm)
├── src/
│   ├── app/              ← Punto de entrada de la app (Next.js)
│   │   ├── layout.tsx    ← Envuelve toda la app (fuentes, estilos, idioma)
│   │   ├── page.tsx      ← La única “página”: obtiene datos y muestra HomeClient
│   │   └── globals.css   ← Estilos globales y tema (colores café, dark mode)
│   ├── components/       ← Piezas de la interfaz que se reutilizan
│   │   ├── HomeClient.tsx  ← Pantalla principal (lista + mapa + filtros)
│   │   ├── CafeCard.tsx   ← Tarjeta de un café
│   │   ├── RatingStars.tsx ← Estrellas de valoración
│   │   ├── Navbar.tsx      ← Barra superior con logo y total
│   │   └── MapView.tsx     ← Mapa con pins de cafés
│   ├── lib/
│   │   └── data.ts       ← Lista de cafés y tipo “Café”
│   └── utils/
│       └── sheets.ts     ← (Opcional) Leer cafés desde Google Sheets CSV
```

---

## 3. ¿Qué hace cada archivo?

### `src/app/layout.tsx`
- **Rol:** “Marco” de toda la aplicación.
- Define el `<html>` y `<body>`, las fuentes (Geist), los estilos base y el idioma (`lang="es"`).
- Todo lo que ve el usuario pasa por este layout; `children` es el contenido de cada página (aquí solo hay una página).

### `src/app/page.tsx`
- **Rol:** Página principal (home).
- Ordena los cafés por rating y los pasa a `HomeClient`.
- **Flujo:** Lee `cafes` de `@/lib/data` → ordena → renderiza `<HomeClient cafes={sorted} />`.

### `src/app/globals.css`
- **Rol:** Estilos globales y tema.
- Define variables de color (papel, tinta, acento “café”) y un bloque `@media (prefers-color-scheme: dark)` para modo oscuro.
- Tailwind usa estas variables (por ejemplo `bg-coffee-paper`, `text-coffee-ink`).

### `src/lib/data.ts`
- **Rol:** Fuente de datos de cafés.
- Define el **tipo** `Cafe` (id, nombre, coords, ratings, workable) y el **array** `cafes` con todos los locales.
- No dibuja nada; solo exporta datos y tipos para que los usen los componentes.

### `src/components/HomeClient.tsx`
- **Rol:** Pantalla principal con lógica e interfaz.
- Hace: geolocalización, filtro “Solo Workable”, ordenar por rating / flat white / distancia, lista con “Ver más” y mapa.
- Usa: `Navbar`, `CafeCard`, `MapView`; lee tipo `Cafe` y datos de `@/lib/data` (que le llegan por `page.tsx`).

### `src/components/Navbar.tsx`
- **Rol:** Barra superior fija.
- Muestra logo “Larica” y el total de cafés (recibe `total` como prop).

### `src/components/CafeCard.tsx`
- **Rol:** Una tarjeta por café.
- Muestra nombre, estrellas (via `RatingStars`), flat white, workable y distancia (si hay ubicación).
- Al hacer clic, notifica el café seleccionado (`onSelectCafe`) para que el mapa lo resalte.

### `src/components/RatingStars.tsx`
- **Rol:** Convertir un número (ej. 9.2) en estrellas (1–5) y texto.
- Si no hay valor, muestra “— sin calificación”.

### `src/components/MapView.tsx`
- **Rol:** Mapa (Leaflet) con pins por café y opcionalmente ubicación del usuario.
- Colorea pins según el modo (rating, flat white o distancia) y resalta el café seleccionado.

### `src/utils/sheets.ts`
- **Rol:** Alternativa a `data.ts`: descarga un CSV desde Google Sheets y lo convierte al mismo formato `Cafe[]`.
- No se usa en la página actual (la página usa `cafes` de `data.ts`), pero está por si quieres cargar datos desde una hoja en el futuro.

---

## 4. Cómo se relacionan (flujo de la app)

```
1. El usuario abre la app
   ↓
2. Next.js carga layout.tsx (html, body, fuentes, globals.css)
   ↓
3. Se renderiza page.tsx
   → page.tsx lee "cafes" de lib/data.ts
   → Ordena por rating y pasa la lista a HomeClient
   ↓
4. HomeClient.tsx recibe "cafes" y se encarga de todo lo visible:
   → Pide la ubicación del usuario (navegador)
   → Filtra (workable) y ordena (rating / flat white / distancia)
   → Calcula distancias con getDistance()
   ↓
5. HomeClient dibuja:
   → Navbar(total de cafés)
   → Botones (Cerca de mí, Solo Workable, Mejor Rating, Mejor Flat White)
   → Para cada café (los N primeros): CafeCard(café, selección, distancia)
      → CafeCard usa RatingStars para el rating
   → Botón "Ver más cafés..." si hay más de 10
   → MapView(lista de cafés, café seleccionado, ubicación usuario)
```

- **Datos:** `data.ts` → `page.tsx` → `HomeClient` → `CafeCard` / `MapView` / `Navbar`.
- **Interacción:** Clic en una `CafeCard` → `HomeClient` actualiza `selectedCafeId` → `MapView` recibe ese id y resalta el pin.

---

## 5. Conceptos útiles para seguir aprendiendo

- **Componente:** Un trozo de interfaz reutilizable (ej. `CafeCard`, `RatingStars`). Recibe **props** (datos o callbacks) y devuelve JSX.
- **Props:** Datos que un componente padre pasa a un hijo (ej. `cafes`, `total`, `onSelectCafe`). Son de solo lectura para el hijo.
- **Estado (`useState`):** Datos que pueden cambiar con el tiempo (café seleccionado, filtros, cuántos cafés se muestran). Cuando el estado cambia, React vuelve a dibujar lo necesario.
- **Efectos (`useEffect`):** Código que se ejecuta en momentos concretos (al montar, al cambiar filtros), por ejemplo pedir la geolocalización o resetear “Ver más”.
- **"use client":** En Next.js, indica que ese archivo se ejecuta en el navegador (necesario para geolocalización, mapas, clics, etc.). Lo que no lleva "use client" puede ejecutarse primero en el servidor.
- **Importar / exportar:** `import { X } from "@/lib/data"` usa algo que otro archivo exportó con `export`. El `@/` suele apuntar a `src/`.

---

## 6. Dependencias principales (package.json)

- **next** – Framework (páginas, rutas, servidor/cliente).
- **react** / **react-dom** – Librería de interfaz (componentes, estado).
- **leaflet** / **react-leaflet** – Mapas e interactividad del mapa.
- **lucide-react** – Iconos (café, estrella, mapa, etc.).
- **tailwindcss** – Estilos con clases (ej. `rounded-2xl`, `bg-coffee-paper`).
- **typescript** – Tipado estático.
- **papaparse** – Lectura de CSV (usado en `sheets.ts`).

Si quieres, en el siguiente paso podemos bajar al detalle de un solo archivo (por ejemplo solo `HomeClient.tsx` o solo `CafeCard.tsx`) y leerlo línea por línea. Puedes decirme por cuál quieres empezar.
