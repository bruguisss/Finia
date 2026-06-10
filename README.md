# Finia — Finanzas Personales

App de finanzas personales para importar y analizar tus extractos de Revolut con categorización automática por IA.

## Stack

- **Frontend:** React + Vite + Tailwind CSS + Recharts
- **Backend:** Node.js + Express
- **Base de datos:** SQLite (better-sqlite3)
- **IA:** Claude Haiku (Anthropic) para categorización automática

---

## Desarrollo local

### 1. Prerrequisitos

- Node.js 18+
- npm 9+

### 2. Clonar e instalar

```bash
git clone <tu-repo>
cd finia
npm install          # instala concurrently en la raíz
cd server && npm install && cd ..
cd client && npm install && cd ..
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env
```

Edita `.env` y añade tu API key de Anthropic:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
PORT=3001
NODE_ENV=development
```

Obtén tu clave en: https://console.anthropic.com/

### 4. Arrancar en desarrollo

```bash
npm run dev
```

Esto lanza:
- Backend en `http://localhost:3001`
- Frontend en `http://localhost:5173` (con proxy a la API)

---

## Deploy en Render.com

### Pasos

1. **Sube el código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/tu-usuario/finia.git
   git push -u origin main
   ```

2. **Crea un nuevo Web Service en Render:**
   - Ve a https://dashboard.render.com
   - "New" → "Web Service"
   - Conecta tu repositorio de GitHub
   - Render detectará el `render.yaml` automáticamente

3. **Añade la API key como variable de entorno secreta:**
   - En el dashboard de Render, ve a "Environment"
   - Añade `ANTHROPIC_API_KEY` con tu clave

4. **Persistent disk:**
   - El `render.yaml` ya configura un disco de 1 GB para la base de datos SQLite
   - La base de datos se guardará en `/opt/render/project/src/server/data/finia.db`

5. **Deploy automático** — Render redesplegará con cada push a `main`.

---

## Importar extracto de Revolut

1. Abre Revolut (app o web)
2. Ve a tu cuenta → Extracto
3. Selecciona el período que quieres importar
4. Exporta en formato **CSV**
5. En Finia, haz click en "Importar CSV" y sube el archivo

Las transacciones se categorizarán automáticamente con IA. Puedes editar cualquier categoría haciendo click en ella en la tabla de transacciones.

---

## Estructura del proyecto

```
finia/
├── server/             Backend Express
│   ├── index.js        Entrada
│   ├── db.js           SQLite + migraciones
│   ├── routes/         API endpoints
│   └── services/       CSV parser + IA
└── client/             Frontend React
    └── src/
        ├── pages/      Dashboard, Transacciones, Análisis, Presupuestos
        └── components/ Componentes reutilizables
```
