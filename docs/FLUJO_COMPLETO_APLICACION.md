# 📋 Flujo Completo de la Aplicación Koopay

## 🎯 Visión General

Koopay es una plataforma descentralizada de freelancing que integra pagos blockchain (Stellar), gestión de proyectos basada en milestones, y onboarding Web3 invisible para usuarios tradicionales.

---

## 🔐 1. FLUJO DE AUTENTICACIÓN

### 1.1 Rutas Públicas
- **`/`** - Landing page (marketing público)
- **`/auth/login`** - Página de login
- **`/auth/callback`** - Callback de OAuth (Google/Microsoft)

### 1.2 Proceso de Autenticación

#### Paso 1: Login
- Usuario accede a `/auth/login`
- Opciones disponibles:
  - **Email/Password**: Autenticación tradicional
  - **Google OAuth**: Login con cuenta Google
  - **Microsoft OAuth**: Login con cuenta Microsoft

#### Paso 2: Callback y Creación de Wallet
- Después del login exitoso, redirige a `/auth/callback`
- **Proceso automático**:
  1. Intercambia código OAuth por sesión
  2. **Crea wallet Stellar automáticamente** (invisible para el usuario)
  3. Guarda wallet en `user_metadata.stellar_wallet`
  4. Fondea wallet en testnet si es necesario
  5. Redirige a `/onboarding`

#### Paso 3: Verificación de Organización
- **Middleware** (`lib/supabase/middleware.ts`) verifica:
  - Si usuario está autenticado
  - Si tiene organización asociada
- **Flujo de redirección**:
  - ❌ No autenticado → `/auth/login`
  - ✅ Autenticado sin organización → `/onboarding`
  - ✅ Autenticado con organización → `/platform`

---

## 🚀 2. FLUJO DE ONBOARDING

### 2.1 Estructura del Onboarding

El onboarding es un proceso de **4 pasos** para crear una organización (contractor/provider).

#### Paso 0: Selección de Tipo de Organización
- **Ruta**: `/onboarding` (sin step)
- **Componente**: `OrganizationTypeSelector`
- **Opciones**:
  - **Provider**: Organización que ofrece servicios (freelancer)
  - **Requester**: Organización que solicita servicios (contractor)

#### Paso 1: Tipo Legal
- **Ruta**: `/onboarding?step=1`
- **Componente**: `Step1`
- **Opciones**:
  - **Individual**: Persona física
  - **Company**: Empresa/Organización
- **Datos guardados**: `legal_type` en contexto

#### Paso 2: Información Personal/Empresarial
- **Ruta**: `/onboarding?step=2`
- **Componente**: `Step2`
- **Campos requeridos**:
  - **Individual**:
    - Nombre completo (`legal_name`)
    - ID personal (`legal_id`)
    - Teléfono (opcional)
    - Avatar (opcional)
  - **Company**:
    - Nombre de la empresa (`name`)
    - Nombre legal (`legal_name`)
    - ID empresarial (`legal_id`)
    - Teléfono (opcional)
    - Logo (opcional)
- **Validación**: Zod schema con validaciones específicas

#### Paso 3: Información de Ubicación
- **Ruta**: `/onboarding?step=3`
- **Componente**: `Step3`
- **Campos requeridos**:
  - País (`legal_country_id`)
  - Estado/Provincia (`legal_state`)
  - Ciudad (`legal_city`)
  - Calle (`legal_street_name`)
  - Número (`legal_street_number`)
  - Código postal (`legal_postal_code`)
  - Suite/Piso (opcional)

#### Paso 4: Información de Negocio
- **Ruta**: `/onboarding?step=4`
- **Componente**: `Step4`
- **Campos requeridos**:
  - Bio/Descripción (`bio`)
  - Tipo de negocio (`business_type`)
  - Tipo de industria (`industry_type`)
  - Campos personalizados si aplica

### 2.2 Gestión de Estado

- **Context**: `OnboardingContext` (`lib/contexts/OnboardingContext.tsx`)
- **Características**:
  - Estado acumulativo entre pasos
  - Validación progresiva
  - Manejo de errores
  - Prevención de navegación hacia atrás sin datos

### 2.3 Finalización del Onboarding

Al completar el paso 4:
1. **Valida** todos los campos requeridos
2. **Crea organización** en tabla `organizations`
3. **Crea relación** en `user_organization` (rol: `owner`, status: `active`)
4. **Sube avatar/logo** a Supabase Storage (bucket: `organizations`)
5. **Actualiza** organización con URL del avatar
6. **Redirige** a `/platform`

---

## 🏠 3. DASHBOARD PRINCIPAL (`/platform`)

### 3.1 Componentes Principales

#### ProfileCard
- Muestra información de la organización actual
- Avatar/logo
- Nombre y tipo de organización

#### CreateProjectCard
- Botón para crear nuevo proyecto
- Redirige a `/projects/create`

#### DonutChart
- **⚠️ ACTUALMENTE MOCKED**: Muestra estadísticas de proyectos
- Debería mostrar datos reales de la base de datos

#### ProjectsSection
- **⚠️ ACTUALMENTE MOCKED**: Lista de proyectos con datos hardcodeados
- Debería mostrar proyectos reales desde Supabase
- Estados: `in_progress`, `done`, `canceled`

### 3.2 Navegación

- **DashboardNavbar**: Barra de navegación superior
  - Logo (link a `/platform`)
  - Team Switcher (cambiar entre organizaciones)
  - Búsqueda (funcionalidad pendiente)
  - Botón "Go to account" (`/account`)
  - Notificaciones (pendiente)
  - Logout

---

## 📁 4. GESTIÓN DE PROYECTOS

### 4.1 Crear Proyecto (`/projects/create`)

#### Formulario de Creación

**Sección Izquierda:**
1. **Detalles del Proyecto** (`ProjectDetailsForm`):
   - Título del proyecto
   - Descripción
   - Monto total (USD)
   - Fecha de entrega esperada

2. **Asignación de Colaborador** (`ProjectCollaborator`):
   - Botón para seleccionar freelancer
   - Modal: `CollaboratorAssignmentModal`
   - Muestra freelancer seleccionado

**Sección Derecha:**
3. **Milestones** (`ProjectMilestones`):
   - Lista de milestones del proyecto
   - Cada milestone tiene:
     - Título
     - Descripción
     - Porcentaje del total
     - Fecha límite
   - Botones: Agregar, Editar, Eliminar
   - Modal: `MilestoneEditModal`

#### Proceso de Creación

Al hacer clic en "Create Project":

1. **Validación**:
   - Título, descripción, fecha requeridos
   - Términos aceptados
   - Freelancer asignado
   - Milestones definidos

2. **Creación de Escrow en Stellar**:
   - Obtiene wallet del contractor (desde `user_metadata.stellar_wallet`)
   - **⚠️ TEMPORAL**: Usa el mismo wallet como freelancer (debería obtener el wallet del freelancer)
   - Llama a `createEscrow()` para obtener transacción sin firmar
   - Firma transacción con secret key
   - Envía transacción usando `sendTransaction()` del SDK
   - Obtiene `contractId` del escrow

3. **Guardado en Supabase**:
   - Crea proyecto en tabla `projects`:
     - `contractor_id`: ID del usuario actual
     - `freelancer_id`: ID del freelancer seleccionado
     - `title`, `description`, `total_amount`, `expected_delivery_date`
     - `status`: `"active"`
     - `contract_id`: ID del contrato de escrow
   - Crea milestones en tabla `milestones`:
     - `project_id`: ID del proyecto creado
     - `title`, `description`, `percentage`
     - `status`: `"pending"`

4. **Generación de Contrato PDF**:
   - Obtiene perfiles de contractor y freelancer
   - Genera PDF usando `@react-pdf/renderer`
   - Sube PDF a Supabase Storage
   - Actualiza proyecto con `contract_url`

5. **Redirección**:
   - Redirige a `/projects/[id]` (página de detalle del proyecto)

### 4.2 Detalle de Proyecto (`/projects/[id]`)

#### Componentes Principales

1. **ProjectOverview**:
   - Título y descripción del proyecto
   - Monto total

2. **CurrentMilestone**:
   - Muestra el milestone actual (primer milestone pendiente)
   - Checkbox para marcar como completado
   - Fecha de entrega esperada
   - Monto del milestone

3. **MilestonesTimeline**:
   - Timeline visual horizontal
   - Iconos según estado:
     - ✅ Completado
     - 🔄 En progreso (actual)
     - ⏳ Pendiente
   - Muestra porcentaje y monto de cada milestone

4. **ProjectProgress**:
   - Barra de progreso del proyecto
   - Porcentaje calculado según milestones completados

5. **EscrowInfoCard**:
   - Muestra información del escrow si existe
   - Link a `/projects/[id]/test-escrow`

#### Funcionalidades

- **Ver Contrato**: Abre PDF del contrato en nueva pestaña
- **Completar Milestone**:
  - Marca milestone como completado
  - Actualiza estado en base de datos
  - **⚠️ PENDIENTE**: Liberar pago del escrow automáticamente

### 4.3 Página de Testeo de Escrow (`/projects/[id]/test-escrow`)

#### Propósito
Página de desarrollo/debugging para visualizar detalles del escrow.

#### Información Mostrada

1. **Información del Proyecto**:
   - ID, título, descripción, monto total

2. **Detalles del Escrow**:
   - Contract ID (con botón para copiar)
   - Tipo de escrow (`multi-release`)
   - Título y descripción del escrow
   - Roles (contractor, freelancer)
   - Milestones del escrow (con montos en USDC)
   - Datos raw del escrow (JSON para debugging)

3. **Enlaces Externos**:
   - Ver en Stellar Explorer (testnet)
   - Detecta si es contrato Soroban (`C...`) o cuenta Stellar (`G...`)

---

## 💾 5. ESTRUCTURA DE BASE DE DATOS

### 5.1 Tablas Principales

#### `organizations`
- Información de organizaciones (contractors/providers)
- Campos: `id`, `type`, `legal_type`, `name`, `legal_name`, `legal_id`, `bio`, `avatar_url`, dirección completa, `business_type`, `industry_type`

#### `user_organization`
- Relación muchos-a-muchos entre usuarios y organizaciones
- Campos: `user_id`, `organization_id`, `email`, `role`, `status`, `joined_at`

#### `projects`
- Proyectos creados
- Campos: `id`, `contractor_id`, `freelancer_id`, `title`, `description`, `total_amount`, `expected_delivery_date`, `status`, `contract_id`, `contract_url`

#### `milestones`
- Milestones de proyectos
- Campos: `id`, `project_id`, `title`, `description`, `percentage`, `status`, `created_at`

#### `profiles`
- Perfiles de usuarios
- Campos: `id`, `email`, y otros datos del usuario

#### `contractor_profiles`
- Perfiles específicos de contractors
- Campos relacionados con información legal y de negocio

#### `freelancer_profiles`
- Perfiles específicos de freelancers
- Campos relacionados con habilidades y experiencia

### 5.2 Storage Buckets

- **`organizations`**: Avatares/logos de organizaciones
- **`contracts`**: PDFs de contratos generados

---

## 🔗 6. INTEGRACIÓN CON STELLAR

### 6.1 Wallet Management

- **Creación Automática**: Al hacer login con OAuth, se crea wallet Stellar automáticamente
- **Almacenamiento**: Wallet guardado en `user_metadata.stellar_wallet`
- **Network**: Testnet (configurado en variables de entorno)

### 6.2 TrustlessWork Integration

- **SDK**: `@trustless-work/escrow` v3.0.0
- **Provider**: `TrustlessWorkProvider` envuelve la aplicación
- **Funcionalidades**:
  - Creación de escrow multi-release
  - Firma de transacciones
  - Envío de transacciones
  - Obtención de detalles del escrow

### 6.3 Flujo de Escrow

1. **Inicialización**:
   - Contractor crea proyecto con milestones
   - Se crea escrow en Stellar con los milestones
   - Se guarda `contract_id` en la base de datos

2. **Fondeo** (Pendiente):
   - Contractor debe fondear el escrow con USDC
   - **⚠️ NO IMPLEMENTADO**: Flujo de fondeo automático

3. **Liberación de Pagos** (Pendiente):
   - Cuando milestone se completa, debería liberarse el pago
   - **⚠️ NO IMPLEMENTADO**: Liberación automática de pagos

---

## ⚠️ 7. FUNCIONALIDADES PENDIENTES O INCOMPLETAS

### 7.1 Críticas (Seguridad y Funcionalidad Core)

#### ❌ Row Level Security (RLS)
- **Estado**: No implementado
- **Impacto**: CRÍTICO - Cualquier usuario puede acceder a datos de otros
- **Acción**: Implementar políticas RLS en Supabase para todas las tablas

#### ❌ Validación de Milestones
- **Estado**: Parcial
- **Problemas**:
  - No valida que la suma de porcentajes sea 100%
  - No valida fechas de milestones
  - No valida que haya al menos un milestone
- **Acción**: Agregar validación en frontend y backend

#### ❌ Integración Completa de Escrow
- **Estado**: Parcial
- **Falta**:
  - Obtener wallet del freelancer (actualmente usa el mismo wallet del contractor)
  - Flujo de fondeo del escrow
  - Liberación automática de pagos al completar milestones
  - Manejo de errores en transacciones blockchain

#### ❌ Datos Reales en Dashboard
- **Estado**: Mocked
- **Problemas**:
  - `DonutChart` muestra datos hardcodeados
  - `ProjectsSection` muestra proyectos mockeados
- **Acción**: Conectar con datos reales de Supabase

### 7.2 Importantes (Mejoras de UX)

#### ⚠️ Sistema de Notificaciones
- **Estado**: No implementado
- **UI**: Botón de notificaciones existe pero no funciona
- **Acción**: Implementar sistema de notificaciones en tiempo real

#### ⚠️ Búsqueda de Perfiles
- **Estado**: UI existe pero no funcional
- **Acción**: Implementar búsqueda de freelancers/contractors

#### ⚠️ Gestión de Cuenta (`/account`)
- **Estado**: Ruta existe pero contenido pendiente
- **Acción**: Implementar página de configuración de cuenta

#### ⚠️ Team Switcher
- **Estado**: UI existe pero funcionalidad limitada
- **Acción**: Permitir cambiar entre organizaciones del usuario

### 7.3 Mejoras Futuras

#### 📋 Funcionalidades Adicionales
- **Subida de evidencia** para milestones
- **Comentarios** en milestones
- **Chat en tiempo real** entre contractor y freelancer
- **Sistema de disputas** con resolución comunitaria
- **Tracking de tiempo** automático
- **Analytics** de proyectos
- **Sistema de reputación** descentralizado
- **Soporte multi-wallet** (MetaMask, WalletConnect)
- **Matching de proyectos** con IA

---

## 🛠️ 8. ARQUITECTURA TÉCNICA

### 8.1 Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS, Shadcn UI, Radix UI
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Blockchain**: Stellar Network, TrustlessWork SDK
- **Validación**: Zod
- **Estado**: Zustand (global store), React Context (onboarding)
- **Formularios**: React Hook Form

### 8.2 Estructura de Archivos

```
app/
├── (dashboard)/          # Rutas protegidas del dashboard
│   ├── platform/        # Dashboard principal
│   ├── projects/         # Gestión de proyectos
│   └── account/          # Configuración de cuenta
├── (landing)/            # Landing page pública
├── auth/                 # Autenticación
│   ├── login/           # Página de login
│   └── callback/        # Callback OAuth
├── onboarding/          # Flujo de onboarding
└── trustless/          # Página de testing

lib/
├── hooks/               # Custom hooks
│   ├── useProjectCreationNew.ts
│   ├── useProjectPage.ts
│   ├── useProjectMilestones.ts
│   ├── useStellarWallet.ts
│   └── useEscrowDetails.ts
├── contexts/           # React Contexts
│   └── OnboardingContext.tsx
├── stores/              # Zustand stores
│   └── globalStore.ts
├── supabase/           # Clientes Supabase
│   ├── client.ts       # Cliente del lado del cliente
│   ├── server.ts       # Cliente del lado del servidor
│   ├── middleware.ts    # Middleware de autenticación
│   └── types/          # Tipos generados
└── stellar/            # Integración Stellar
    ├── wallet.ts       # Gestión de wallets
    ├── trustless.ts    # Funciones de escrow
    └── http.ts         # Cliente HTTP

components/
├── ui/                 # Componentes base (Shadcn)
├── milestone-icons/    # Iconos de milestones
├── providers/         # Providers (TrustlessWork, etc.)
└── [componentes específicos]

scripts/
└── *.sql              # Migraciones de base de datos
```

### 8.3 Protección de Rutas

1. **Middleware** (`lib/supabase/middleware.ts`):
   - Verifica autenticación en todas las rutas
   - Redirige según estado de autenticación y organización

2. **Layout de Dashboard** (`app/(dashboard)/layout.tsx`):
   - Verificación adicional de autenticación
   - Verificación de organización
   - Renderiza `DashboardNavbar`

---

## 📊 9. ESTADO ACTUAL DEL PROYECTO

### ✅ Completado

- ✅ Sistema de autenticación (Email/Password + OAuth)
- ✅ Creación automática de wallets Stellar
- ✅ Flujo completo de onboarding (4 pasos)
- ✅ Creación de proyectos con milestones
- ✅ Integración básica con TrustlessWork
- ✅ Generación de contratos PDF
- ✅ Visualización de proyectos y milestones
- ✅ UI/UX responsive con dark theme
- ✅ Subida de archivos (avatars, logos, contratos)
- ✅ Estructura de base de datos completa

### 🔄 En Progreso / Parcial

- 🔄 Integración de escrow (creación funciona, fondeo y liberación pendientes)
- 🔄 Validación de milestones (parcial)
- 🔄 Datos reales en dashboard (parcialmente mocked)

### ❌ Pendiente

- ❌ Row Level Security (RLS)
- ❌ Sistema de notificaciones
- ❌ Búsqueda de perfiles
- ❌ Página de configuración de cuenta
- ❌ Liberación automática de pagos
- ❌ Flujo de fondeo de escrow
- ❌ Obtener wallet del freelancer correctamente

---

## 🎯 10. PRÓXIMOS PASOS RECOMENDADOS

### Prioridad Alta (Seguridad y Funcionalidad Core)

1. **Implementar RLS** en todas las tablas de Supabase
2. **Completar validación de milestones** (suma 100%, fechas, etc.)
3. **Implementar fondeo de escrow** cuando se crea proyecto
4. **Implementar liberación automática** de pagos al completar milestones
5. **Obtener wallet del freelancer** desde su perfil

### Prioridad Media (UX y Funcionalidades)

6. **Reemplazar datos mockeados** en dashboard con datos reales
7. **Implementar sistema de notificaciones** básico
8. **Implementar búsqueda de perfiles** funcional
9. **Completar página de configuración de cuenta**
10. **Mejorar manejo de errores** en transacciones blockchain

### Prioridad Baja (Mejoras y Features)

11. **Subida de evidencia** para milestones
12. **Sistema de comentarios** en proyectos
13. **Chat en tiempo real** entre partes
14. **Analytics** de proyectos
15. **Sistema de reputación**

---

## 📝 Notas Finales

- El proyecto tiene una **base sólida** con arquitectura bien estructurada
- Las funcionalidades core están **parcialmente implementadas**
- Las **limitaciones principales** son de seguridad (RLS) y completitud de features
- El código sigue **buenas prácticas** y está bien organizado
- La integración con Stellar está **funcional pero incompleta**

**Estado General**: MVP funcional con funcionalidades core implementadas, pero requiere trabajo en seguridad y completitud de features para ser production-ready.

