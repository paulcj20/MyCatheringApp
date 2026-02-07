# MyCathering - Servicio de Catering Premium

## Estructura del Proyecto

Este proyecto es una aplicación Fullstack con:
- **Frontend**: React (Vite) + TypeScript + TailwindCSS + Framer Motion.
- **Backend**: Spring Boot 3.2 + Spring Data JPA + H2 Database (Memoria).

## Requisitos Previos
- Node.js 18+
- Java 17+
- Maven (o IDE con soporte Maven como IntelliJ IDEA)

## Instrucciones de Ejecución

### 1. Iniciar el Backend (API & Base de Datos)
La base de datos H2 es en memoria, por lo que se reinicia cada vez que se detiene la aplicación.

1.  Abre la carpeta `backend` en tu IDE favorito (IntelliJ IDEA es recomendado).
2.  Ejecuta la clase principal: `src/main/java/com/mycathering/api/ApiApplication.java`.
3.  El servidor iniciará en: `http://localhost:8080`.
4.  Consola H2 (Base de Datos): `http://localhost:8080/h2-console`
    - JDBC URL: `jdbc:h2:mem:testdb`
    - User: `sa`
    - Password: `password`

### 2. Iniciar el Frontend (Landing Page)
1.  Abre una terminal en la carpeta `frontend`.
2.  Instala las dependencias (si no lo has hecho):
    ```bash
    npm install
    ```
3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```
4.  Abre tu navegador en `http://localhost:5173`.

## Funcionalidades
- **Landing Page Animada**: Diseño profesional con animaciones suaves.
- **Agenda Web**: Formulario conectado a la API de Spring Boot para guardar reservas.
- **Contacto**: Formulario de contacto y datos.
- **Servicios**: Catálogo visual de servicios.
