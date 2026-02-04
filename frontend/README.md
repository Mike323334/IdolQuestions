# Frontend - IdolQuestions

Aplicación React con Vite para crear y tomar cuestionarios.

## 🚀 Inicio Rápido

### Instalar dependencias

```bash
npm install
```

### Configurar variables de entorno

Crea un archivo `.env` en esta carpeta:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_stripe_publishable_key_aqui
VITE_API_URL=http://localhost:8000
```

### Ejecutar en desarrollo

```bash
npm run dev
# o
npm start
```

La aplicación estará disponible en `http://localhost:3000`

### Construir para producción

```bash
npm run build
```

Los archivos de producción estarán en la carpeta `dist/`

### Previsualizar build de producción

```bash
npm run preview
```

## 🛠️ Tecnologías

- **Vite** - Build tool rápido y moderno (reemplaza Create React App)
- **React 19** - Biblioteca UI
- **TypeScript** - Tipado estático
- **Material-UI** - Componentes UI
- **Stripe** - Procesamiento de pagos
- **React Router** - Navegación
- **i18next** - Internacionalización

## 📝 Por qué Vite en lugar de CRACO?

**CRACO** se usaba para:
- Personalizar la configuración de webpack de Create React App
- Agregar polyfills de Node.js (crypto, buffer, stream, etc.) para `threads-api`

**Vite** es mejor porque:
- ⚡ **Mucho más rápido** - Hot Module Replacement instantáneo
- 🎯 **Configuración más simple** - Menos archivos de configuración
- 📦 **Builds más rápidos** - Usa esbuild para compilación
- 🔧 **Mejor soporte para TypeScript** - Sin configuración adicional
- 🎨 **Mejor DX** - Mejor experiencia de desarrollo

Los polyfills de Node.js se manejan con `vite-plugin-node-polyfills`, que es más eficiente que la configuración manual de webpack.

## 🔧 Configuración

### Variables de Entorno

Vite usa el prefijo `VITE_` para variables de entorno accesibles en el cliente:

- `VITE_STRIPE_PUBLISHABLE_KEY` - Clave pública de Stripe
- `VITE_API_URL` - URL del backend API

Acceder en el código:
```typescript
import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
```

### Polyfills

Los polyfills de Node.js están configurados en `vite.config.ts` para soportar `threads-api`:
- `crypto` → `crypto-browserify`
- `buffer` → `buffer`
- `stream` → `stream-browserify`
- `process` → `process/browser`
- `vm` → `vm-browserify`

## 📁 Estructura

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas de la aplicación
│   ├── contexts/      # React Contexts
│   ├── services/      # Servicios API
│   ├── i18n/          # Traducciones
│   └── theme.ts       # Tema Material-UI
├── public/            # Archivos estáticos
├── index.html         # HTML principal (Vite)
├── vite.config.ts     # Configuración de Vite
└── tsconfig.json      # Configuración TypeScript
```
