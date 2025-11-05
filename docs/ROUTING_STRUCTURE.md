# Estructura de Rutas y Navegación

## Arquitectura Actual

### Rutas Públicas
- `/` - Landing page (marketing público)
- `/auth/login` - Página de login
- `/auth/callback` - Callback de OAuth

### Rutas Protegidas (Requieren Autenticación)
Todas las rutas dentro de `app/(dashboard)/` están protegidas por:
1. **Middleware** (`lib/supabase/middleware.ts`) - Verifica autenticación en el servidor
2. **Layout de Dashboard** (`app/(dashboard)/layout.tsx`) - Verifica autenticación y organización

#### Rutas Protegidas:
- `/platform` - Dashboard principal (lista de proyectos)
- `/projects` - Lista de proyectos
- `/projects/create` - Crear nuevo proyecto
- `/projects/[id]` - Detalle de proyecto
- `/projects/[id]/test-escrow` - Página de testeo de escrow
- `/account` - Configuración de cuenta

### Flujo de Autenticación

1. Usuario no autenticado → Redirigido a `/auth/login`
2. Usuario autenticado sin organización → Redirigido a `/onboarding`
3. Usuario autenticado con organización → Acceso a `/platform`

## Protección de Rutas

### Middleware (`lib/supabase/middleware.ts`)
- Verifica autenticación en todas las rutas excepto las públicas
- Redirige a `/onboarding` si el usuario no tiene organización
- Previene acceso a `/onboarding` si el usuario ya tiene organización

### Layout de Dashboard (`app/(dashboard)/layout.tsx`)
- Verificación adicional de autenticación
- Verificación de organización
- Renderiza `DashboardNavbar` para navegación

## Navegación

### Dashboard Navbar
Incluye:
- Logo (enlace a `/platform`)
- Team Switcher
- Búsqueda
- Botón "Go to account" (`/account`)
- Notificaciones
- Logout

### Mejoras Sugeridas
- Agregar breadcrumbs en páginas de proyecto
- Agregar botón "Home" o "Dashboard" visible en todas las páginas
- Mejorar navegación entre secciones

## Mejores Prácticas

### ✅ Separación Landing/Platform
Es una buena práctica separar:
- **Landing page** (`/`) - Marketing público, SEO, conversión
- **Platform** (`/platform`) - Aplicación protegida, requiere auth

### ✅ Protección en Múltiples Niveles
1. Middleware (servidor) - Primera línea de defensa
2. Layout (servidor) - Verificación adicional
3. Componentes (cliente) - UX mejorada

### ⚠️ Consideraciones
- El middleware protege rutas dinámicamente
- Las rutas dentro de `(dashboard)` heredan la protección del layout
- Las rutas públicas están explícitamente listadas en `PUBLIC_ROUTES`

