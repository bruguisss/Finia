# Finia — Finanzas Personales

App de finanzas personales para importar y analizar tus extractos de Revolut con categorización automática por IA.

## Stack

- **Frontend:** React + Vite + Tailwind CSS + Recharts
- **Backend:** Node.js + Express
- **Base de datos:** PostgreSQL (pg)
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

Edita `.env` y añade tu API key de Anthropic y la conexión a PostgreSQL:

```
ANTHROPIC_API_KEY=sk-ant-api03-...
PORT=3001
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/finia
MCP_API_KEY=elige-una-clave-secreta-larga
```

Obtén tu clave en: https://console.anthropic.com/

Necesitas una base de datos PostgreSQL local (o remota) accesible mediante `DATABASE_URL`. Las tablas se crean automáticamente al arrancar el servidor.

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

4. **Base de datos PostgreSQL:**
   - El `render.yaml` ya define una base de datos PostgreSQL gratuita (`finia-db`) y conecta `DATABASE_URL` automáticamente al servicio web
   - Las tablas se crean automáticamente al arrancar el servidor (`server/db-migrate.js`)

5. **Deploy automático** — Render redesplegará con cada push a `main`.

---

## Servidor MCP (Model Context Protocol)

Finia expone un servidor MCP que permite a un asistente de IA (como Claude) consultar y modificar tus finanzas mediante herramientas:

- `add_transaction` — añade una transacción manual (ingreso o gasto)
- `delete_transaction` — borra una transacción por su ID
- `get_summary` — resumen financiero del mes actual o de un mes concreto
- `get_transactions` — lista las transacciones recientes (con filtros opcionales)
- `add_debt` — registra una deuda (dinero que debes o que te deben)
- `get_debts` — lista las deudas pendientes
- `update_budget` — crea o actualiza el presupuesto mensual de una categoría

### Configuración

Define `MCP_API_KEY` en tu `.env` (o en las variables de entorno de Render) con una cadena larga y aleatoria. El servidor MCP se monta en `/mcp/<MCP_API_KEY>` — esa ruta actúa como el secreto (claude.ai no permite enviar cabeceras personalizadas como `x-api-key` en sus conectores personalizados, así que la autenticación va en la propia URL). Cualquier petición a `/mcp/<valor incorrecto>` responde `404`.

Genera una clave aleatoria, por ejemplo:
```bash
openssl rand -hex 32
```

### Conectar con claude.ai

1. En claude.ai, ve a **Configuración → Conectores → Añadir conector personalizado**.
2. Introduce la URL completa incluyendo tu clave: `https://tu-app.onrender.com/mcp/<MCP_API_KEY>` (o `http://localhost:3001/mcp/<MCP_API_KEY>` en local).
3. Guarda y activa el conector — las herramientas de Finia aparecerán disponibles en tus conversaciones.

No compartas esa URL: quien la tenga puede usar las herramientas (añadir transacciones, deudas, etc.).

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
│   ├── db.js           Conexión PostgreSQL (pg Pool)
│   ├── db-migrate.js   Creación de tablas
│   ├── routes/         API endpoints (incluye /mcp)
│   ├── mcp/            Servidor MCP (herramientas para asistentes IA)
│   └── services/       CSV parser + IA
└── client/             Frontend React
    └── src/
        ├── pages/      Dashboard, Transacciones, Análisis, Presupuestos
        └── components/ Componentes reutilizables
```
