# 💈 Barber Market — Marketplace de Barberías con Pase QR

Plataforma web y móvil moderna (estilo **Worldcoin App** con **Shadcn UI / Tailwind CSS v4**) para el agendamiento y gestión de citas en barberías multi-sede con validación por código QR, mapa interactivo OpenSource y panel Super Admin.

---

## 🌟 Características Principales

- **Diseño Worldcoin App (Shadcn UI)**:
  - Paleta de alto contraste en negro puro (`#000000`) y gris satinado con acentos **Verde Neón Eléctrico (`#00E575`)**.
  - Tarjetas apiladas estilo billetera (*Stacked Wallet Cards*).
  - Pase Digital VIP tipo credencial con código QR nítido y código de respaldo de 6 caracteres con botón para copiar.
- **Marketplace Multi-Sede**:
  - Registro de múltiples barberías independientes (`/crear-barberia`).
  - Explorador y selector dinámico de sedes en el dashboard del cliente (`/inicio`).
  - Catálogo de servicios y equipo de barberos segmentado por sede.
- **Pase Digital QR Instantáneo**:
  - Renderizado automático del código QR para citas confirmadas y en curso.
  - Integración con **Google Calendar** y **Google Maps**.
- **Panel Super Admin con Mapa OpenStreetMap (`/admin`)**:
  - Métricas de facturación, citas y personal en tiempo real.
  - **Mapa interactivo OpenSource (Leaflet)** con pines geográficos de cada barbería.
  - Control de sedes (Inhabilitar / Activar con 1 clic).
- **Escáner y Panel de Barbero (`/barbero`)**:
  - Lector de cámara con visor láser o ingreso manual de PIN de 6 dígitos.
  - Botón directo de WhatsApp para contacto con el cliente.
  - Métricas de caja del día (cobrado vs esperado).
- **Autenticación Completa + Google OAuth**:
  - Ingreso tradicional por correo y contraseña.
  - Soporte nativo para **"Continuar con Google"** (OAuth 2.0).

---

## 🚀 Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar base de datos y sembrar datos iniciales
npm run db:setup

# 3. Sembrar citas demostrativas de prueba (~100 citas)
npm run db:demo

# 4. Iniciar servidor de desarrollo
npm run dev
# Abre http://localhost:3000
```

---

## 🔑 Cuentas Sembradas para Pruebas

| Rol | Correo | Contraseña |
| :--- | :--- | :--- |
| **Super Admin** | `admin@barberia.app` | `admin123` |
| **Dueño de Barbería** | `dueno@barberia.app` | `dueno123` |
| **Barbero (Centro)** | `rolando@barberia.app` | `barbero123` |
| **Barbero (Bocagrande)** | `jesus@barberia.app` | `barbero123` |
| **Barbero (Manga)** | `angel@barberia.app` | `barbero123` |
| **Cliente Demo** | `cliente@demo.app` | `cliente123` |

---

## 🌐 Configuración de Google OAuth (Google Cloud Console)

Para activar el inicio de sesión con Google:

1. Ingresa a [Google Cloud Console](https://console.cloud.google.com/).
2. Crea un proyecto (ej: `BarberApp`).
3. Ve a **APIs & Services** > **OAuth consent screen** (Pantalla de consentimiento):
   - Tipo de usuario: **External** (Externo).
   - Completa el nombre de la app y correo de soporte.
4. Ve a **Credentials** > **Create Credentials** > **OAuth client ID**:
   - Application type: **Web application**.
   - **Authorized JavaScript origins**: `http://localhost:3000` (y tu dominio de producción).
   - **Authorized redirect URIs**: `http://localhost:3000/api/auth/callback/google` (y `https://tudominio.com/api/auth/callback/google`).
5. Copia el **Client ID** y **Client Secret** en tu archivo `.env`:
   ```env
   GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="tu-client-secret"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

---

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript
- **Estilos**: Tailwind CSS v4 + Radix/Shadcn Icons (`lucide-react`)
- **Mapas**: Leaflet + OpenStreetMap (100% OpenSource)
- **Base de Datos**: Prisma ORM + SQLite (Migrable a PostgreSQL con 1 línea)
- **Seguridad**: JWT en cookies HTTP-only (`jose`) + Bcrypt
- **QR**: `qrcode` + `html5-qrcode` + `canvas-confetti`
