# TurnoListo

TurnoListo es un SaaS de reservas para negocios locales del Perú: barberías, consultorios y estudios. El cliente elige servicio, día y hora. El negocio ve las citas en un panel.

Este repositorio es el proyecto del curso de despliegue continuo con Vercel. En esta fase no hay base de datos: los negocios viven en archivos JSON y las reservas nuevas se guardan en memoria.

## Requisitos

- Node.js 20 o superior
- npm

## Cómo correrlo

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

| Comando | Para qué sirve |
| --- | --- |
| `npm run dev` | Levanta la app en local |
| `npm run build` | Genera la versión de producción |
| `npm start` | Sirve esa versión |
| `npm run lint` | Revisa el código con ESLint |
| `npm test` | Corre los tests una vez |
| `npm run test:watch` | Corre los tests y se queda escuchando |
| `npm run generar:reservas` | Vuelve a crear `content/reservas.json` (2,000 citas) |
| `npm run generar:imagenes` | Vuelve a crear las imágenes de la portada |

`DATA_MODE=mock` es el modo del curso. `DATA_MODE=supabase` deja preparada la otra implementación, pero no está activada.

## Estructura

```
content/negocios/     Un JSON por negocio. De aquí sale la portada y /[slug]
content/reservas.json Citas de ejemplo para el panel
src/app/              Páginas y rutas de la API
src/lib/datos/        Interfaz Repositorio, mock y Supabase
src/lib/availability.ts  Horas libres, sin depender de la web
public/imagenes/      Imágenes de la portada
```

## Páginas

- `/` portada, beneficios y la grilla de negocios
- `/{slug}` ficha pública para reservar
- `/panel` tabla de reservas de todos los negocios

## API

- `POST /api/reservas` crea una cita
- `GET /api/disponibilidad?slug=...&fecha=...&servicio=...` devuelve las horas libres
- `GET /api/health` estado del despliegue
- `GET /api/panel/reservas` lista las citas. Pide el header `x-admin-key`

## Cómo agregar tu negocio

El ejercicio de Pull Request está en [content/negocios/README.md](content/negocios/README.md). Copias un JSON, cambias los datos y abres el PR. Con eso aparece una página nueva.

## Datos de prueba

Hay tres locales de Lima:

- Barbería Don Lucho, en Surquillo
- Consultorio Dental Sonrisa, en San Borja
- Estudio Yoga Miraflores, en Miraflores

La clave del panel de ejemplo está en `.env.example` (`NEXT_PUBLIC_ADMIN_KEY`).

## Notas

Cambios en la documentación del proyecto.

Clona el repositorio antes de correr `npm install`.

Si la portada abre en el navegador, la instalación ya funciona.

Listo para la primera sesión.
