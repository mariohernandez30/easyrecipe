# EasyRecipe

Aplicación para gestionar recetas con una interfaz moderna y reactiva utilizando Preact.

## Estructura del Proyecto

El proyecto se divide en dos partes principales:

- **Backend**: API REST con Express.js
- **Frontend**: Aplicación SPA con Preact

## Requisitos

- [Bun](https://bun.sh/) (v1.0.0 o superior)

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/easyrecipe.git
cd easyrecipe

# Instalar dependencias
bun install
```

## Configuración

El proyecto utiliza archivos `.env` para la configuración:

- `.env`: Configuración para desarrollo
- `.env.production`: Configuración para producción

## Desarrollo

Para ejecutar el proyecto en modo desarrollo:

```bash
bun dev
```

Esto iniciará:

- Servidor de backend en http://localhost:3000
- Servidor de desarrollo de Vite para el frontend en http://localhost:5173

Durante el desarrollo, puedes acceder al frontend a través de:

- http://localhost:5173 (frontend Preact con HMR)
- http://localhost:3000 (backend + frontend legacy)

## Producción

Para ejecutar el proyecto en modo producción:

```bash
# Compila el frontend y sirve la aplicación completa
bun start
```

Este comando:

1. Compila el frontend con Vite
2. Inicia el servidor que sirve tanto la API como la versión compilada del frontend

La aplicación estará disponible en http://localhost:3000

## Migración a Preact

El proyecto está en proceso de migración desde HTML tradicional + JavaScript vanilla hacia una arquitectura moderna con Preact:

- La carpeta `public/` contiene el frontend legacy (HTML + JS)
- La carpeta `frontend/` contiene la nueva aplicación Preact

Durante la transición, ambas versiones están disponibles.

## Scripts Disponibles

- `bun dev`: Inicia el proyecto en modo desarrollo (frontend + backend)
- `bun dev:client`: Inicia solo el servidor de desarrollo del frontend
- `bun dev:server`: Inicia solo el servidor backend
- `bun build`: Compila el frontend para producción
- `bun start`: Compila el frontend e inicia el servidor en modo producción
- `bun lint`: Ejecuta el linter
- `bun lint:fix`: Corrige automáticamente problemas de linting
