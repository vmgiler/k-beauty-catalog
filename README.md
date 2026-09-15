# K-Beauty Catalog

Catálogo estático de cosméticos K-Beauty con carrito de compras en el navegador.

## Ejecutar localmente

Abre `index.html` directamente en el navegador. También puedes servir la carpeta con cualquier servidor estático, por ejemplo:

```bash
python -m http.server 8000
```

Después visita <http://localhost:8000>.

## Publicar en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub.
2. En **Settings > Pages**, selecciona **GitHub Actions** como fuente.
3. El workflow incluido publicará automáticamente el contenido de la rama `main`.

## Estructura

- `index.html`: estructura HTML de la página.
- `styles.css`: estilos del catálogo y de la vista de impresión.
- `products.js`: datos de los productos y sus existencias.
- `app.js`: lógica del catálogo, carrito, persistencia e impresión.
- `media/`: imágenes de los productos.
- `.github/workflows/pages.yml`: despliegue en GitHub Pages.

## Nota sobre acceso a los datos

Este proyecto es un sitio estático. El navegador necesita descargar `products.js` para mostrar el catálogo, por lo que ese archivo y sus datos pueden ser consultados directamente por cualquier visitante. GitHub Pages no permite ocultar archivos estáticos ni controlar su acceso desde el cliente.

Si los datos deben mantenerse privados, será necesario moverlos a un backend con autenticación y servir el catálogo mediante una API protegida.
