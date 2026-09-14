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

- `index.html`: aplicación completa del catálogo.
- `*.jpg` y `*.png`: imágenes de productos y composiciones del catálogo.
- `.github/workflows/pages.yml`: despliegue en GitHub Pages.
