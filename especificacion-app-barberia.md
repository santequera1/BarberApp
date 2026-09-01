# Especificación Funcional y Técnica — App de Agendamiento para Barberías

> **Documento de entrada para generación de código asistida por IA (Fable 5 u otro agente).**
> Versión 1.0 — Fase 1: aplicación web (PWA). Fase 2: app móvil nativa.
> País objetivo: Colombia · Moneda: COP · Zona horaria base: `America/Bogota`

---

## 0. Cómo usar este documento

Este archivo está escrito para que un modelo de código pueda implementarlo por módulos, sin ambigüedad. Recomendaciones de uso:

1. **No pidas "hazme la app completa" en un solo prompt.** Divide por los hitos de la sección 14.
2. Entrega este documento como contexto fijo en cada sesión de trabajo del agente.
3. Después de cada hito, exige: migraciones, tests y un README actualizado antes de pasar al siguiente.
4. Las reglas de negocio de la sección 8 son las que más se rompen al generar código automáticamente. Verifícalas con tests explícitos.

---

## 1. Visión general

Plataforma de agendamiento de citas que conecta **clientes** con **barberos** de una o varias barberías. El cliente elige barbería → servicio → barbero → fecha y hora, y recibe una confirmación con **código QR + código alfanumérico de respaldo**. El barbero valida la asistencia escaneando el QR o digitando el código.

### Objetivos del producto

| Objetivo | Métrica de éxito |
|---|---|
| Eliminar el agendamiento por WhatsApp manual | % de citas creadas en la app |
| Reducir inasistencias (no-show) | % de citas validadas vs. agendadas |
| Dar visibilidad de agenda al barbero | Ocupación diaria por barbero |
| Base para monetizar (comisión / suscripción) | Barberías activas por mes |

### Fuera de alcance en la Fase 1

- Facturación electrónica DIAN
- Inventario y venta de productos
- Nómina o liquidación de comisiones a barberos
- Chat en tiempo real cliente–barbero
- App nativa (se aborda en Fase 3)

---

## 2. Roles y permisos

| Rol | Descripción |
|---|---|
| `CLIENTE` | Agenda, reprograma, cancela, califica, usa cupones |
| `BARBERO` | Ve su agenda, valida citas por QR/código, gestiona su horario y portafolio |
| `ADMIN_BARBERIA` | Dueño/administrador de una sede: gestiona barberos, servicios, precios, horarios, cupones, reportes |
| `SUPERADMIN` | Operador de la plataforma: gestiona barberías, planes, moderación, métricas globales |

### Matriz de permisos (resumen)

| Acción | CLIENTE | BARBERO | ADMIN_BARBERIA | SUPERADMIN |
|---|:--:|:--:|:--:|:--:|
| Crear cita | ✅ | ✅ (walk-in) | ✅ | ✅ |
| Ver todas las citas de la sede | ❌ | ❌ | ✅ | ✅ |
| Ver solo sus citas | ✅ | ✅ | — | — |
| Validar cita (QR/código) | ❌ | ✅ | ✅ | ✅ |
| Cancelar cita propia | ✅ | ✅ | ✅ | ✅ |
| Cancelar cita ajena | ❌ | ❌ | ✅ | ✅ |
| Crear/editar servicios y precios | ❌ | ❌ | ✅ | ✅ |
| Crear cupones | ❌ | ❌ | ✅ | ✅ |
| Bloquear horario propio | ❌ | ✅ | ✅ | ✅ |
| Gestionar barberías | ❌ | ❌ | ❌ | ✅ |

> **Nota de diseño:** un usuario puede tener más de un rol (un barbero también puede ser cliente en otra barbería). Modelar roles como tabla relacional, **no** como campo `role` único en `users`.

---

## 3. Módulos funcionales

### 3.1 Autenticación y cuenta

- [ ] Registro con correo + contraseña (con verificación de correo)
- [ ] **Inicio de sesión con Google (OAuth 2.0 / OIDC)**
- [ ] Inicio de sesión con Apple (obligatorio si en Fase 3 se publica en App Store)
- [ ] Inicio de sesión con Facebook *(opcional, baja prioridad)*
- [ ] Recuperación de contraseña por correo
- [ ] Vinculación de cuentas: si el correo de Google ya existe como cuenta local, fusionar y no duplicar
- [ ] Verificación de número de celular por OTP (SMS o WhatsApp) — clave en Colombia para reducir no-shows
- [ ] Cierre de sesión y cierre de sesión en todos los dispositivos
- [ ] Onboarding post-registro: nombre, foto, celular, ciudad, permisos de ubicación y notificaciones
- [ ] Eliminación de cuenta y descarga de datos (Ley 1581 de 2012, Habeas Data)
- [ ] Aceptación versionada de Términos y Política de Privacidad (guardar versión y fecha)

### 3.2 Perfil del cliente

- [ ] Datos personales: nombre, foto, celular, correo, fecha de cumpleaños *(útil para promociones)*
- [ ] Preferencias: barbero favorito, barbería favorita, tipo de corte habitual
- [ ] **Mis citas**: próximas, historial, canceladas
- [ ] **Solicitar reprogramación** de una cita
- [ ] **Cancelar cita** (sujeto a política de cancelación de la barbería)
- [ ] Cupones disponibles y usados
- [ ] Métodos de pago guardados *(estructura lista; en Fase 1 solo "Efectivo")*
- [ ] Preferencias de notificación (push / correo / WhatsApp, activar–desactivar por tipo)
- [ ] Direcciones guardadas *(para futuro servicio a domicilio)*

### 3.3 Perfil del barbero

- [ ] Datos públicos: nombre artístico, foto, biografía corta, años de experiencia
- [ ] **Portafolio de cortes** (galería de imágenes con título, descripción y etiquetas)
- [ ] Servicios que ofrece y su duración individual
- [ ] Especialidades (fade, barba, diseño, color, niños…)
- [ ] Redes sociales (Instagram, TikTok)
- [ ] Calificación promedio y reseñas recibidas
- [ ] **Gestión de disponibilidad**: horario semanal recurrente + excepciones
- [ ] Bloqueos puntuales (almuerzo, cita médica, vacaciones)
- [ ] Estado: activo / inactivo / de vacaciones

### 3.4 Barbería / sede

- [ ] Nombre, logo, descripción, galería de fotos del local
- [ ] **Ubicación**: dirección, ciudad, coordenadas (lat/lng), mapa embebido, botón "Cómo llegar"
- [ ] Horario de atención por día de la semana
- [ ] Días festivos y cierres especiales (cargar calendario de festivos de Colombia)
- [ ] Teléfono y WhatsApp de contacto
- [ ] Barberos asociados
- [ ] Catálogo de servicios y precios
- [ ] Políticas: tiempo mínimo de cancelación, tolerancia de retraso, política de no-show
- [ ] Métodos de pago aceptados

### 3.5 Catálogo de servicios

- [ ] CRUD de servicios: nombre, descripción, **duración en minutos**, precio base, categoría, imagen
- [ ] Precio diferenciado por barbero *(un barbero senior puede cobrar más por el mismo servicio)*
- [ ] Servicios combinados/paquetes (corte + barba con precio y duración propios)
- [ ] Servicio activo/inactivo sin borrarlo (soft delete: los históricos deben conservar el precio de ese momento)
- [ ] **Snapshot de precio en la cita**: la cita guarda el precio cobrado, no una referencia viva al servicio

### 3.6 Búsqueda y descubrimiento

- [ ] Listado de barberías con filtros: ciudad, distancia, calificación, precio, servicio, disponibilidad hoy
- [ ] **Búsqueda por cercanía** usando geolocalización del navegador (con fallback a selección manual de ciudad)
- [ ] Vista de mapa con pines de barberías
- [ ] Búsqueda por nombre de barbería o barbero
- [ ] Galería inspiracional de cortes con filtro por etiqueta → lleva al barbero que lo hizo

### 3.7 Agendamiento (módulo crítico)

**Flujo:** Barbería → Servicio(s) → Barbero (o "cualquiera disponible") → Fecha → Hora → Resumen → Confirmar

- [ ] Motor de disponibilidad que calcula slots libres considerando:
  - horario de la barbería
  - horario del barbero
  - duración total de los servicios seleccionados
  - citas ya existentes
  - bloqueos y excepciones
  - tiempo de preparación/limpieza entre citas (`buffer`, configurable)
  - antelación mínima para reservar (ej. no reservar con menos de 30 min)
  - antelación máxima (ej. no más de 60 días)
- [ ] Opción "Cualquier barbero disponible" → asignación automática por menor carga
- [ ] Selección de múltiples servicios en una misma cita (suma duraciones y precios)
- [ ] Aplicación de cupón antes de confirmar
- [ ] Resumen previo: servicios, barbero, fecha/hora, duración, subtotal, descuento, total, método de pago
- [ ] Notas del cliente para el barbero (campo libre, máx. 300 caracteres)
- [ ] Confirmación → generación de **QR + código de respaldo**
- [ ] **Lista de espera**: si no hay cupo, el cliente se anota y se le notifica si se libera un espacio
- [ ] Cita recurrente *(ej. cada 15 días)* — Fase 2

#### Estados de la cita (máquina de estados)

```
PENDIENTE ──confirmar──> CONFIRMADA ──check-in QR──> EN_CURSO ──finalizar──> COMPLETADA
    │                         │                                                   │
    │                         ├──cliente/barbería cancela──> CANCELADA            └──> CALIFICADA
    │                         ├──solicita cambio──> REPROGRAMACION_SOLICITADA
    │                         │         ├──aprueba──> CONFIRMADA (nueva fecha)
    │                         │         └──rechaza──> CONFIRMADA (fecha original)
    │                         └──no llegó (tras tolerancia)──> NO_ASISTIO
    └──expira sin confirmar──> EXPIRADA
```

Transiciones prohibidas deben lanzar error de dominio, no fallar en silencio.

### 3.8 Validación por QR y código de respaldo

Requisito explícito del proyecto. Diseño propuesto:

- [ ] Al confirmar la cita se genera:
  - **`checkin_token`**: UUID v4 firmado (JWT corto o HMAC) → se codifica en el QR
  - **`codigo_respaldo`**: 6 caracteres alfanuméricos en base32 sin caracteres ambiguos (sin `0`, `O`, `1`, `I`) — ej. `7K4M9X`
- [ ] El QR se muestra en el detalle de la cita, se puede descargar y se envía por correo/WhatsApp
- [ ] Pantalla de escáner para el barbero (cámara web / móvil)
- [ ] **Fallback obligatorio**: campo para digitar el código de respaldo si la cámara falla o no hay permisos
- [ ] Validaciones al escanear:
  - la cita existe y pertenece a esa barbería
  - el estado es `CONFIRMADA`
  - está dentro de la ventana de validación (ej. desde 20 min antes hasta 30 min después de la hora)
  - no ha sido validada antes (**un solo uso**)
- [ ] Respuesta visual clara: ✅ válida (con nombre, servicio, hora) / ⚠️ fuera de horario / ❌ ya usada / ❌ inválida
- [ ] Registro de auditoría: quién validó, cuándo, desde qué dispositivo
- [ ] Rate limiting en el endpoint de validación de código (evitar fuerza bruta sobre 6 caracteres)
- [ ] Modo offline básico: si se pierde la conexión, encolar la validación y sincronizar después

### 3.9 Reprogramación y cancelación

- [ ] Cliente solicita nueva fecha/hora → estado `REPROGRAMACION_SOLICITADA`
- [ ] Configurable por barbería: aprobación manual del barbero **o** reprogramación automática si hay cupo
- [ ] Cancelación por parte del cliente con motivo (lista + campo libre)
- [ ] Política de cancelación: ventana mínima configurable (ej. 2 horas antes)
- [ ] Cancelación tardía → registrar strike en el perfil del cliente
- [ ] Cancelación por parte de la barbería → notificación inmediata + sugerencia de horarios alternativos
- [ ] Al liberarse un cupo, notificar a la lista de espera
- [ ] Contador de no-shows y cancelaciones tardías; posibilidad de bloquear al cliente tras N strikes

### 3.10 Pagos y cupones

- [ ] **Arquitectura de pasarela agnóstica** desde el día uno: interfaz `PaymentProvider` con implementaciones intercambiables
- [ ] Fase 1: único proveedor implementado = `CASH` (efectivo en sede)
- [ ] Estados de pago: `PENDIENTE`, `PAGADO`, `REEMBOLSADO`, `FALLIDO`
- [ ] El barbero marca la cita como pagada al finalizar
- [ ] Preparado para: Wompi, Bold, Mercado Pago, ePayco, PayU, Nequi, Daviplata
- [ ] Registro de transacciones con idempotencia (clave idempotente por intento de pago)
- [ ] **Cupones de descuento**:
  - código único, legible (ej. `PRIMERCORTE20`)
  - tipo: porcentaje o monto fijo
  - vigencia (fecha inicio/fin)
  - límite de usos totales y usos por usuario
  - monto mínimo de compra
  - aplicable a: todos los servicios / servicios específicos / barbería específica / barbero específico
  - solo primera cita (sí/no)
  - activo/inactivo
  - validación atómica al canjear (evitar sobreuso por concurrencia)
- [ ] Historial de cupones canjeados

### 3.11 Notificaciones

| Evento | Cliente | Barbero |
|---|:--:|:--:|
| Cita creada | ✅ | ✅ |
| Recordatorio 24 h antes | ✅ | — |
| Recordatorio 2 h antes | ✅ | ✅ |
| Cita cancelada | ✅ | ✅ |
| Reprogramación solicitada | — | ✅ |
| Reprogramación aprobada/rechazada | ✅ | — |
| Cita validada (check-in) | ✅ | — |
| Cupo liberado (lista de espera) | ✅ | — |
| Solicitud de calificación (2 h después) | ✅ | — |
| Cupón por vencer | ✅ | — |
| Resumen diario de agenda (7 a.m.) | — | ✅ |

- [ ] Canales: **Web Push** (PWA), **correo**, **WhatsApp** *(el canal con mayor tasa de apertura en Colombia)*, SMS como respaldo
- [ ] Centro de notificaciones dentro de la app (bandeja con leídas/no leídas)
- [ ] Preferencias por canal y por tipo de evento
- [ ] Plantillas de mensaje versionadas y en español
- [ ] Cola de envío con reintentos y registro de entregas
- [ ] Respetar zona horaria del usuario; no enviar entre 10 p.m. y 7 a.m.

### 3.12 Calificaciones y reseñas

- [ ] Solo puede calificar quien tiene una cita en estado `COMPLETADA`
- [ ] Calificación 1–5 estrellas + comentario opcional + foto del resultado (opcional)
- [ ] Subcalificaciones: puntualidad, calidad, atención, limpieza
- [ ] Respuesta del barbero/barbería a la reseña
- [ ] Reporte y moderación de reseñas ofensivas
- [ ] Cálculo de promedio ponderado (evitar que una sola reseña defina la nota)

### 3.13 Panel del barbero

- [ ] Vista de agenda: día / semana (tipo calendario)
- [ ] Próxima cita destacada con botón de check-in
- [ ] Escáner QR de acceso rápido
- [ ] Registro de cita walk-in (cliente que llega sin reserva)
- [ ] Marcar cita como completada / no asistió
- [ ] Bloquear franjas horarias
- [ ] Estadísticas personales: citas del mes, ingresos estimados, ocupación, servicios más vendidos, tasa de no-show

### 3.14 Panel de administración de la barbería

- [ ] Dashboard: citas de hoy, ingresos del día/semana/mes, ocupación por barbero
- [ ] Gestión de barberos (invitar por correo, activar/desactivar, asignar servicios)
- [ ] Gestión de servicios y precios
- [ ] Gestión de horarios y festivos
- [ ] Gestión de cupones
- [ ] Vista de agenda consolidada de todos los barberos
- [ ] Reportes exportables a CSV/Excel: citas, ingresos, no-shows, clientes frecuentes
- [ ] Configuración de políticas (cancelación, buffer, antelación, tolerancia)
- [ ] Multi-sede: una marca con varias barberías

### 3.15 Panel de superadministrador

- [ ] Alta y baja de barberías
- [ ] Métricas globales de la plataforma
- [ ] Moderación de contenido (fotos, reseñas)
- [ ] Registro de auditoría del sistema
- [ ] Banderas de funcionalidad (feature flags) para activar módulos por barbería

---

## 4. Requisitos no funcionales

| Categoría | Requisito |
|---|---|
| **Idioma** | Español (Colombia) como idioma base; arquitectura i18n lista desde el inicio |
| **Zona horaria** | Guardar todo en UTC; presentar en `America/Bogota`; nunca operar con horas locales en la base de datos |
| **Moneda** | COP, guardada como **entero en pesos** (no decimales flotantes) |
| **Responsive** | Mobile-first; el 80 % del tráfico será celular |
| **PWA** | Instalable, con service worker y funcionamiento offline básico |
| **Rendimiento** | LCP < 2.5 s en 4G; la vista de disponibilidad debe responder en < 500 ms |
| **Accesibilidad** | WCAG 2.1 nivel AA: contraste, navegación por teclado, etiquetas ARIA |
| **Disponibilidad** | 99.5 % objetivo |
| **Datos personales** | Cumplimiento de Ley 1581 de 2012 (Habeas Data): consentimiento explícito, derecho de supresión |
| **Escalabilidad** | Lógica de negocio desacoplada de la UI para reutilizarla en la app nativa |

---

## 5. Stack tecnológico recomendado

Criterio de selección: **madurez, documentación abundante y alta densidad en los datos de entrenamiento de los modelos de código**. Un stack popular y bien tipado produce mucho mejor código generado que uno exótico.

### 5.1 Recomendación principal

| Capa | Tecnología | Por qué |
|---|---|---|
| **Lenguaje** | TypeScript (modo `strict`) | El tipado le da al modelo una red de seguridad: los errores salen en compilación, no en producción |
| **Framework web** | **Next.js 15 (App Router)** + React 19 | Server Components, rutas API, SSR para SEO de las barberías, despliegue trivial |
| **Estilos** | Tailwind CSS v4 | Estándar de facto; los modelos lo generan con mucha precisión |
| **Componentes UI** | **shadcn/ui** (Radix + Tailwind) | Código en tu repo, no dependencia opaca; accesible por defecto; ideal para que el agente lo modifique |
| **Estado servidor** | TanStack Query | Caché, revalidación y estados de carga sin reinventar |
| **Estado cliente** | Zustand | Mínimo y suficiente |
| **Formularios** | React Hook Form + **Zod** | Un mismo esquema Zod valida cliente y servidor |
| **Base de datos** | **PostgreSQL** | Transacciones serias, restricciones de exclusión para evitar citas solapadas, PostGIS para geo |
| **ORM** | **Prisma** (alternativa: Drizzle) | Esquema declarativo + migraciones; excelente para generación asistida |
| **Autenticación** | **Auth.js (NextAuth v5)** con proveedor Google + credenciales | OAuth de Google resuelto, sesiones con JWT o base de datos |
| **Almacenamiento** | Cloudinary o UploadThing | Transformación y optimización de imágenes de cortes sin código propio |
| **Correo** | Resend + React Email | Plantillas como componentes React |
| **WhatsApp** | WhatsApp Cloud API (Meta) | Canal de mayor apertura en Colombia |
| **Push web** | Web Push API + VAPID | Nativo del navegador, sin costo |
| **Mapas** | Google Maps Platform o Mapbox GL | Autocompletado de direcciones + mapa |
| **QR** | `qrcode` (generar) + `@zxing/browser` o `html5-qrcode` (escanear) | Escaneo desde navegador sin app nativa |
| **Tareas programadas** | Vercel Cron / Inngest / BullMQ + Redis | Recordatorios y expiración de citas |
| **Validación** | Zod | Fuente única de verdad de los esquemas |
| **Fechas** | `date-fns` + `date-fns-tz` o Temporal API | Manejo explícito de zona horaria |
| **Tests** | Vitest (unitarios) + Playwright (E2E) | Obliga al agente a demostrar que funciona |
| **Calidad** | ESLint + Prettier + Husky + lint-staged | Barrera automática contra código descuidado |
| **Observabilidad** | Sentry + Vercel Analytics | Errores en producción con traza |
| **Hosting** | Vercel (app) + Neon o Supabase (Postgres) | Despliegue continuo desde Git |
| **Monorepo** | Turborepo | Prepara el terreno para compartir lógica con la app nativa |

### 5.2 Alternativa "todo en uno" (más rápida de arrancar)

Si priorizas velocidad sobre control: **Next.js + Supabase** (Postgres + Auth con Google + Storage + Realtime + Edge Functions + Row Level Security). Reduce mucho el código de infraestructura, a costa de acoplarte a un proveedor.

### 5.3 Alternativa con backend separado

Si prevés múltiples clientes (web + móvil + panel interno) y un equipo creciendo: **NestJS + Prisma + PostgreSQL** como API REST/GraphQL, y Next.js solo como frontend. Más código, más limpio a largo plazo.

> **Mi recomendación para tu caso:** empieza con **5.1 en un monorepo Turborepo**. Es el punto de equilibrio: robusto, portable a móvil, y no te amarra a un único proveedor.

### 5.4 Ruta hacia la app nativa (Fase 3)

- **Expo (React Native)** dentro del mismo monorepo
- Compartir: tipos TypeScript, esquemas Zod, cliente de API, lógica de negocio pura
- No compartir: componentes de UI (reescribir con NativeWind o Tamagui)
- Notificaciones: Expo Notifications sobre FCM/APNs
- Escáner QR: `expo-camera` (mucho más confiable que el escaneo web)
- Regla clave desde ahora: **toda la lógica vive en el backend, la web es un cliente más**

---

## 6. Arquitectura

```
┌──────────────────────────────────────────────────────────┐
│  CLIENTES                                                │
│  Web PWA (Next.js)  ·  App móvil Expo (Fase 3)           │
└───────────────────────────┬──────────────────────────────┘
                            │ HTTPS / JSON
┌───────────────────────────▼──────────────────────────────┐
│  CAPA API  (Route Handlers / tRPC / NestJS)              │
│  Autenticación · Autorización · Validación Zod           │
├──────────────────────────────────────────────────────────┤
│  CAPA DE DOMINIO  (lógica pura, testeable, sin framework)│
│  MotorDisponibilidad · MáquinaEstadosCita ·              │
│  ValidadorCupones · ServicioCheckIn · CalculadoraPrecios │
├──────────────────────────────────────────────────────────┤
│  CAPA DE DATOS  (Prisma → PostgreSQL)                    │
├──────────────────────────────────────────────────────────┤
│  SERVICIOS EXTERNOS (tras interfaces / adaptadores)      │
│  PaymentProvider · NotificationChannel · StorageProvider │
│  · MapsProvider                                          │
└──────────────────────────────────────────────────────────┘
```

**Principio no negociable:** el motor de disponibilidad y la máquina de estados de la cita deben ser **funciones puras** en `packages/core`, con tests propios, sin importar React ni Prisma. Es lo que garantiza que la app nativa reutilice el 100 % de esa lógica.

---

## 7. Modelo de datos

Entidades principales (nombres en inglés para el código, etiquetas en español para la UI):

```
User                 id, email, phone, name, avatarUrl, emailVerifiedAt,
                     phoneVerifiedAt, birthDate, status, createdAt
Account              id, userId, provider(google|credentials|apple),
                     providerAccountId          # Auth.js
UserRole             id, userId, role, barbershopId?      # roles múltiples

Barbershop           id, name, slug, description, logoUrl, phone, whatsapp,
                     address, city, lat, lng, timezone, status, ownerId
BarbershopHours      id, barbershopId, dayOfWeek(0-6), openTime, closeTime, isClosed
BarbershopClosure    id, barbershopId, date, reason        # festivos y cierres
BarbershopSettings   id, barbershopId, minBookingNotice, maxBookingHorizon,
                     cancellationWindow, bufferMinutes, lateTolerance,
                     autoApproveReschedule, maxStrikes

Barber               id, userId, barbershopId, displayName, bio, experienceYears,
                     specialties[], instagram, rating, status
BarberSchedule       id, barberId, dayOfWeek, startTime, endTime
BarberTimeOff        id, barberId, startsAt, endsAt, reason
BarberService        id, barberId, serviceId, customPrice?, customDuration?
PortfolioItem        id, barberId, imageUrl, title, description, tags[], order

Service              id, barbershopId, name, description, durationMinutes,
                     basePrice, category, imageUrl, isActive, sortOrder

Appointment          id, code, clientId, barberId, barbershopId,
                     startsAt, endsAt, status, subtotal, discountAmount, total,
                     couponId?, clientNotes, createdAt, cancelledAt,
                     cancelledBy, cancellationReason
AppointmentService   id, appointmentId, serviceId, nameSnapshot,
                     priceSnapshot, durationSnapshot     # precio congelado
AppointmentCheckin   id, appointmentId, checkinToken(unique), backupCode(unique),
                     usedAt, validatedByUserId, deviceInfo, expiresAt
RescheduleRequest    id, appointmentId, requestedStartsAt, status,
                     requestedBy, respondedBy, respondedAt
Waitlist             id, clientId, barbershopId, barberId?, serviceIds[],
                     desiredDate, timeRangeStart, timeRangeEnd, status

Payment              id, appointmentId, provider, providerRef, amount,
                     currency, status, idempotencyKey, paidAt
PaymentMethod        id, userId, provider, token, last4, brand, isDefault

Coupon               id, barbershopId?, code(unique), type(PERCENT|FIXED), value,
                     minPurchase, maxUses, maxUsesPerUser, usedCount,
                     validFrom, validUntil, firstAppointmentOnly,
                     appliesToServiceIds[], isActive
CouponRedemption     id, couponId, userId, appointmentId, discountApplied, redeemedAt

Review               id, appointmentId(unique), clientId, barberId, rating,
                     punctuality, quality, attention, cleanliness,
                     comment, photoUrl, reply, replyAt, status
Notification         id, userId, type, title, body, data, channel,
                     readAt, sentAt, deliveryStatus
NotificationPref     id, userId, eventType, push, email, whatsapp, sms
AuditLog             id, actorId, action, entity, entityId, metadata, ip, createdAt
```

### Restricciones críticas en base de datos

```sql
-- Evitar solapamiento de citas del mismo barbero a nivel de MOTOR, no de aplicación
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Appointment"
ADD CONSTRAINT no_overlapping_appointments
EXCLUDE USING gist (
  "barberId" WITH =,
  tstzrange("startsAt", "endsAt") WITH &&
) WHERE (status IN ('PENDIENTE','CONFIRMADA','EN_CURSO'));
```

> Esta restricción es **la pieza más importante del esquema**. Sin ella, dos clientes que reservan el mismo segundo generan doble reserva. La validación en el código de aplicación no es suficiente.

Otras restricciones: `UNIQUE` en `Coupon.code`, `AppointmentCheckin.backupCode`, `Review.appointmentId`; índices en `(barberId, startsAt)`, `(barbershopId, startsAt)`, `(clientId, status)`; índice GiST en `(lat, lng)` o PostGIS para búsqueda por cercanía.

---

## 8. Reglas de negocio (verificar con tests)

1. Una cita nunca puede solaparse con otra del mismo barbero en estado activo.
2. La duración de la cita = suma de duraciones de sus servicios + `bufferMinutes`.
3. No se puede reservar con menos de `minBookingNotice` minutos de anticipación.
4. No se puede reservar más allá de `maxBookingHorizon` días.
5. No se puede reservar fuera del horario de la barbería **ni** del barbero.
6. No se puede reservar en días de cierre ni durante bloqueos del barbero.
7. Cancelar dentro de `cancellationWindow` cuenta como cancelación tardía → strike.
8. Un cliente con `strikes >= maxStrikes` no puede reservar hasta que el admin lo libere.
9. El código de check-in es de **un solo uso** y solo válido en su ventana temporal.
10. Un cupón no puede superar `maxUses` ni `maxUsesPerUser`, y el canje debe ser atómico.
11. El descuento nunca puede dejar el total por debajo de cero.
12. Solo se califica una cita `COMPLETADA`, y una sola vez.
13. Si el barbero se desactiva, sus citas futuras deben reasignarse o cancelarse explícitamente.
14. Cambiar el precio de un servicio **no** altera el precio de citas ya creadas.
15. Todas las horas se guardan en UTC; toda comparación se hace en la zona horaria de la barbería.

---

## 9. Endpoints principales de la API

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/google                    # OAuth
POST   /api/auth/verify-phone
POST   /api/auth/forgot-password

GET    /api/barbershops                    ?city=&lat=&lng=&radius=&service=&q=
GET    /api/barbershops/:slug
GET    /api/barbershops/:id/barbers
GET    /api/barbershops/:id/services

GET    /api/barbers/:id
GET    /api/barbers/:id/portfolio
GET    /api/barbers/:id/reviews

GET    /api/availability                   ?barbershopId=&barberId=&serviceIds=&date=
                                           → [{ start, end, barberId }]

POST   /api/appointments                   # crear
GET    /api/appointments                   ?status=&from=&to=
GET    /api/appointments/:id
PATCH  /api/appointments/:id/cancel
POST   /api/appointments/:id/reschedule
POST   /api/appointments/:id/reschedule/:reqId/respond
GET    /api/appointments/:id/qr            # imagen PNG/SVG del QR

POST   /api/checkin/scan                   { token }
POST   /api/checkin/code                   { backupCode }        # rate-limited
PATCH  /api/appointments/:id/complete
PATCH  /api/appointments/:id/no-show

POST   /api/coupons/validate               { code, barbershopId, serviceIds, total }
POST   /api/reviews
GET    /api/notifications
PATCH  /api/notifications/:id/read
PUT    /api/me/notification-preferences

# Panel barbería
GET    /api/admin/dashboard
CRUD   /api/admin/services
CRUD   /api/admin/barbers
CRUD   /api/admin/coupons
GET    /api/admin/reports/appointments     ?format=csv
PUT    /api/admin/settings
```

---

## 10. Seguridad

- [ ] Autorización verificada **en el servidor** en cada endpoint (nunca confiar en el rol del cliente)
- [ ] Row Level Security si se usa Supabase
- [ ] Rate limiting: login, OTP, validación de código de respaldo, creación de citas
- [ ] Protección CSRF en formularios con sesión por cookie
- [ ] Sanitización de entradas (bio, reseñas, notas) contra XSS
- [ ] Validación de subida de imágenes: tipo MIME real, tamaño máximo, análisis de contenido
- [ ] Secretos en variables de entorno, nunca en el repositorio; `.env.example` documentado
- [ ] Tokens de check-in firmados con HMAC y con expiración
- [ ] Registro de auditoría en acciones sensibles
- [ ] Cabeceras de seguridad: CSP, HSTS, X-Frame-Options
- [ ] Contraseñas con Argon2id o bcrypt (coste ≥ 12)
- [ ] Sin datos de tarjetas en tu base de datos: siempre tokenización de la pasarela

---

## 11. Diseño y experiencia de usuario

Mientras consigues la referencia visual, deja fijados estos parámetros para que el agente no improvise:

- **Mobile-first**, ancho base 375 px
- Sistema de diseño con tokens: colores, tipografía, espaciado, radios, sombras
- Modo claro y oscuro
- Estados obligatorios en cada vista: cargando (skeleton), vacío, error, éxito
- Máximo **3 toques** desde el inicio hasta la selección de horario
- El QR debe verse a pantalla completa con brillo aumentado
- Feedback háptico y sonoro al escanear correctamente
- Textos en español neutro-colombiano, tuteo, sin jerga técnica

> Cuando tengas la guía visual, se agrega como sección 11.1 con los tokens exactos (paleta, tipografías, componentes) y se le entrega al agente junto con este documento.

---

## 12. Datos semilla para desarrollo

Pídele al agente un script de `seed` con: 3 barberías en Cartagena, 8 barberos, 12 servicios con precios reales del mercado colombiano, 30 clientes, 100 citas en distintos estados, 5 cupones y 40 reseñas. Sin esto no se puede probar nada de forma realista.

---

## 13. Criterios de aceptación del MVP

El MVP está listo cuando:

1. Un cliente se registra con Google y completa su perfil.
2. Encuentra una barbería por cercanía y ve sus servicios y precios.
3. Agenda una cita eligiendo servicio, barbero y horario, sin ver horarios ocupados.
4. Aplica un cupón y el total se recalcula correctamente.
5. Recibe correo y notificación push con QR y código de respaldo.
6. Solicita reprogramar y el barbero aprueba desde su panel.
7. El barbero escanea el QR y la cita pasa a `EN_CURSO`.
8. Con la cámara desactivada, el barbero digita el código de respaldo y funciona igual.
9. Un segundo intento de usar el mismo código es rechazado.
10. El barbero marca la cita como completada y registra el pago en efectivo.
11. El cliente recibe la solicitud de calificación y deja una reseña.
12. El admin ve el ingreso del día y exporta el reporte.
13. Dos reservas simultáneas del mismo slot: solo una tiene éxito.
14. La suite de tests pasa completa y la app instala como PWA.

---

## 14. Plan de implementación por hitos

Entrega cada hito al agente como una tarea cerrada, con este documento como contexto.

| Hito | Contenido | Entregable |
|---|---|---|
| **H0** | Monorepo, TypeScript, ESLint, Prettier, CI, `.env.example`, README | Repo que compila y despliega un "hola mundo" |
| **H1** | Esquema Prisma completo + migraciones + restricción de exclusión + seed | `npx prisma migrate dev` corre limpio y hay datos |
| **H2** | Auth.js con Google + credenciales, roles, middleware de autorización, verificación de celular | Login funcional con los 4 roles |
| **H3** | CRUD de barberías, barberos, servicios, horarios (panel admin) | Panel admin operativo |
| **H4** | **Motor de disponibilidad** en `packages/core` con tests exhaustivos | Función pura + suite de tests verde |
| **H5** | Flujo de agendamiento completo + máquina de estados + endpoint de disponibilidad | Cliente puede reservar |
| **H6** | Generación de QR + código de respaldo + escáner + validación + auditoría | Check-in funcionando en móvil |
| **H7** | Reprogramación, cancelación, políticas, strikes, lista de espera | Ciclo de vida completo de la cita |
| **H8** | Cupones + capa de pagos con proveedor `CASH` | Descuentos aplicables |
| **H9** | Notificaciones: push, correo, WhatsApp, cron de recordatorios, preferencias | Recordatorios llegando |
| **H10** | Portafolio de imágenes, búsqueda, mapa, geolocalización | Descubrimiento funcionando |
| **H11** | Reseñas y calificaciones | Ciclo social cerrado |
| **H12** | Dashboards, reportes, exportación CSV | Métricas para el dueño |
| **H13** | PWA, accesibilidad, rendimiento, Sentry, E2E con Playwright | MVP listo para producción |
| **H14** | *(Fase 3)* App Expo compartiendo `packages/core` | App nativa |

### Cómo redactar cada prompt para el agente

```
CONTEXTO: [adjuntar este documento]
HITO ACTUAL: H4 — Motor de disponibilidad
UBICACIÓN: packages/core/src/availability/
ENTRADA: barbershopId, barberId?, serviceIds[], date, settings
SALIDA: Slot[] { start: Date, end: Date, barberId: string }
DEBE CONSIDERAR: [reglas 2 a 6 de la sección 8]
RESTRICCIONES: función pura, sin dependencias de Prisma ni React,
               todas las fechas en UTC, tipado estricto
ENTREGABLES: implementación + tests Vitest que cubran al menos
             estos casos: [listar casos borde]
NO HAGAS: no modifiques el esquema de base de datos,
          no toques otros módulos
```

### Casos borde que el agente suele ignorar

- Cita que cruza el cierre de la barbería
- Cambio de horario del barbero con citas ya agendadas
- Día festivo colombiano en medio de la semana
- Dos clientes reservando el mismo slot en el mismo segundo
- Cupón que expira entre que se aplica y se confirma la cita
- Cliente en zona horaria distinta a la de la barbería
- Barbero eliminado con citas futuras pendientes
- Escaneo del QR con el celular sin conexión
- Servicio cuya duración cambia después de agendada la cita
- Cita a las 11:45 p.m. que termina al día siguiente

---

## 15. Costos operativos estimados (mensual, etapa inicial)

| Servicio | Rango |
|---|---|
| Hosting (Vercel Pro) | USD 20 |
| PostgreSQL (Neon/Supabase) | USD 0 – 25 |
| Almacenamiento de imágenes | USD 0 – 20 |
| Correo (Resend) | USD 0 – 20 |
| WhatsApp Cloud API | Por conversación iniciada por el negocio |
| Google Maps | USD 0 – 30 (con crédito mensual gratuito) |
| Sentry | USD 0 – 26 |
| Dominio | ~USD 15 / año |

Con volumen bajo, la mayor parte cae en las capas gratuitas.

---

## 16. Preguntas abiertas por resolver

1. ¿Es una app para **una sola barbería** o un marketplace de varias? Cambia el modelo de negocio y parte del esquema.
2. ¿Quién paga: la barbería (suscripción), el cliente (comisión), o es gratis al inicio?
3. ¿Se requiere depósito o anticipo para reducir no-shows?
4. ¿El barbero es empleado o arrienda la silla? Afecta la lógica de comisiones futura.
5. ¿Hay servicio a domicilio en el roadmap?
6. ¿Nombre y dominio de la plataforma?
7. ¿Se integrará con Google Calendar del barbero?

---

*Documento vivo. Actualízalo al cerrar cada hito y vuelve a entregarlo como contexto en la siguiente sesión de generación de código.*
