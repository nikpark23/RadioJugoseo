/* ============================================================
   js/productos-data.js
   Fuente única de datos de productos, compartida entre la
   Tienda (tienda.js) y el Panel Administrativo (admin.js).
   RF10 - Permite crear, listar y editar productos.
   ============================================================ */

const CLAVE_PRODUCTOS = 'jugoseoProductos';

// RF02: Categorías válidas definidas por el sistema
const CATEGORIAS_VALIDAS = ['Poleras', 'Tazas', 'Eventos'];

const PRODUCTOS_INICIALES = [
  { id: 1, codigo: 'POL001', nombre: 'Polera Jugoseo Classic',   descripcion: 'Polera clásica de algodón con logo de Radio Jugoseo', categoria: 'Poleras',    precio: 19990, stock: 12,  imagen: 'img/polera1.jpg' },
  { id: 2, codigo: 'TAZ001', nombre: 'Vasos Jugoseo Neon',       descripcion: 'Set de vasos con diseño neón de la radio', categoria: 'Tazas',      precio: 6990,  stock: 20,  imagen: 'img/vasos.png' },
  { id: 3, codigo: 'POL002', nombre: 'Poleras Jugoseo Colores',  descripcion: 'Polera de colores vibrantes disponibles en varios tonos', categoria: 'Poleras',    precio: 10000, stock: 8,   imagen: 'img/polera2.png' },
  { id: 4, codigo: 'TAZ002', nombre: 'Taza Jugoseo Classic',     descripcion: 'Taza de cerámica con logo clásico de la estación', categoria: 'Tazas',      precio: 6990,  stock: 50,  imagen: 'img/Taza 1.png' },
  { id: 5, codigo: 'TAZ003', nombre: 'Taza Jugoseo Summer',      descripcion: 'Taza especial edición verano con diseño tropical', categoria: 'Tazas',      precio: 8000,  stock: 5,   imagen: 'img/Taza 2.png' },
  { id: 6, codigo: 'EVT001', nombre: 'Entrada Jugoseo Fest',     descripcion: 'Entrada para el festival anual de Radio Jugoseo', categoria: 'Eventos',    precio: 12000, stock: 100, imagen: 'img/entradas.png' },
];

// Imagen que se usa cuando un producto (nuevo o antiguo) no tiene una definida.
const IMAGEN_PRODUCTO_GENERICA = 'img/producto-generico.png';

function inicializarProductos() {
  if (!localStorage.getItem(CLAVE_PRODUCTOS)) {
    localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(PRODUCTOS_INICIALES));
  }
}

function obtenerProductos() {
  inicializarProductos();
  return JSON.parse(localStorage.getItem(CLAVE_PRODUCTOS));
}

function guardarProductos(listaProductos) {
  localStorage.setItem(CLAVE_PRODUCTOS, JSON.stringify(listaProductos));
}

function generarIdProducto(listaProductos) {
  return listaProductos.length ? Math.max(...listaProductos.map(p => p.id)) + 1 : 1;
}

// RF02: Validar que la categoría sea válida
function esCategoriaValida(categoria) {
  return CATEGORIAS_VALIDAS.includes(categoria);
}
