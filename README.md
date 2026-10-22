# Lumière — tienda de películas

Lumière es una tienda de películas con catálogo dinámico, búsqueda, cesta y perfil local. Usa Vite, React, Tailwind CSS, iconos de Lucide y la [Studio Ghibli API](https://ghibliapi.vercel.app/). Funciona sin base de datos ni servidor propio.

## Iniciar en Windows / PowerShell

```powershell
cd C:\Users\cirez\p3Movies
npm install
Copy-Item .env.example .env
npm run dev
```

Abre la dirección local que muestre Vite (normalmente `http://localhost:5173/`). Para verificar el proyecto usa `npm test` y `npm run build`.

## Pantallas y funciones

- **Inicio:** presentación de la tienda y selección de películas obtenidas de la API.
- **Catálogo:** películas, búsqueda, filtros, ordenación, detalles y cesta.
- **Registro:** valida nombre, correo, contraseña, confirmación y consentimiento. Guarda únicamente el nombre en este navegador para mostrar un perfil local; el correo y la contraseña no se guardan ni se envían. No se crea una cuenta en línea.
- **Cesta:** guarda únicamente títulos seleccionados en el almacenamiento local del navegador. Los precios son informativos y todavía no hay compra ni renta en línea.

## API y seguridad

La API pública `https://ghibliapi.vercel.app/films` no requiere clave. Su URL se configura mediante `VITE_GHIBLI_API_URL` en `.env`; el archivo está ignorado por Git y `.env.example` sirve como plantilla para quien clone el proyecto. **No pongas claves secretas en variables `VITE_`**: Vite las incluye en el código del navegador. Si más adelante se usa una API que exige una clave privada, haría falta un servidor/proxy para protegerla.

Los datos y las imágenes se muestran con fines educativos. Este sitio no está afiliado con Studio Ghibli ni TMDb.
