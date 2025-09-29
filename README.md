# APP NANOBANANA

Aplicación full-stack para generación y edición de imágenes con Vertex AI (modelo `gemini-2.5-flash-image-preview`). El proyecto se construirá en cinco fases siguiendo la guía del repositorio.

## Estructura del proyecto

```
APP-NANOBANANA/
├── frontend/           # Aplicación React + Vite + Tailwind CSS
│   ├── src/components/
│   ├── src/pages/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/            # API Node.js + Express
│   ├── routes/
│   ├── package.json
│   └── server.js
├── docker-compose.yml
├── .env.example
└── README.md
```

## Dependencias principales previstas

- **Frontend:** React, TypeScript, Vite, Tailwind CSS.
- **Backend:** Node.js, Express, utilidades para Vertex AI y manejo de archivos.
- **AI:** Google Vertex AI (`gemini-2.5-flash-image-preview`).

## Configuración inicial

1. Duplica `.env.example` como `.env` y ajusta los valores necesarios.
2. Proporciona un archivo de credenciales de servicio de Google Cloud y apunta `GOOGLE_APPLICATION_CREDENTIALS` al path correspondiente.
3. Instala dependencias cuando se definan en cada paquete (`npm install` en `frontend/` y `backend/`).

## Ejecución con Docker Compose

El archivo `docker-compose.yml` permite levantar backend y frontend de forma coordinada. Ejecuta:

```bash
docker compose up --build
```

El frontend se servirá en `http://localhost:5173` y el backend en `http://localhost:4000` (configurable vía variables de entorno).

## Roadmap de desarrollo

1. **infra-base** (fase actual): estructura inicial, configuración de entorno y tooling.
2. **backend-generate:** endpoint `/api/generate` para generación de imágenes desde prompt.
3. **backend-edit:** rutas de edición, mezcla y operaciones locales sobre imágenes.
4. **frontend-base:** UI fundamental de generación y visualización.
5. **frontend-advanced:** características avanzadas, galería e historial.

Cada fase se implementará en ramas independientes con su respectivo Pull Request antes de fusionar en `main`.
