# Nano Banana

Bienvenido al proyecto **Nano Banana**. Este repositorio contiene el frontend en React + TypeScript + Vite + Tailwind CSS y el backend en Node.js + Express.

## Requisitos previos
- Node.js 18 o superior
- npm 9 o superior
- Docker (opcional, solo si quieres usar contenedores)

## Clonar el repositorio
```bash
git clone https://github.com/sanluispropublicidad-ai/APP-NANOBANANA.git
cd APP-NANOBANANA
```

## Configurar variables de entorno
1. Copia el archivo `.env.example` a `.env`.
2. Completa los valores:
   - `PROJECT_ID`
   - `LOCATION`
   - `MODEL_NAME`
   - `GOOGLE_APPLICATION_CREDENTIALS` (ruta al archivo JSON del Service Account, **no** lo subas al repositorio). Si vas a usar Docker, coloca el JSON dentro de `backend/` (está ignorado por Git) y apunta la variable a `/app/<nombre-del-archivo>.json`.

## Instalar dependencias (modo local)
### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Ejecutar la aplicación en desarrollo (modo local)
En dos terminales separadas:

### Backend
```bash
cd backend
npm run dev
```

### Frontend
```bash
cd frontend
npm run dev
```

El frontend se abrirá en `http://localhost:5173` y el backend escuchará en `http://localhost:3001`.

## Ejecutar con Docker Compose (opcional)
1. Asegúrate de tener Docker y Docker Compose instalados.
2. Copia `.env.example` a `.env` y configura las variables (recuerda que `GOOGLE_APPLICATION_CREDENTIALS` debe apuntar al archivo dentro del contenedor, por ejemplo `/app/service-account.json`).
3. Si usas credenciales locales, colócalas dentro de `backend/` y asegúrate de que el nombre coincida con la ruta indicada en `.env`.
4. En la raíz del proyecto ejecuta:
   ```bash
   docker-compose up --build
   ```
5. El frontend quedará disponible en `http://localhost:3000` y el backend en `http://localhost:3001`.

Para detener los contenedores utiliza `Ctrl + C` y luego `docker-compose down` si deseas limpiar los servicios.
