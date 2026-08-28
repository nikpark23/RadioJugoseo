/* ============================================================
   js/productos-data.js
   Fuente única de datos de productos, compartida entre la
   Tienda (tienda.js) y el Panel Administrativo (admin.js).
   RF10 - Permite crear, listar y editar productos.
   ============================================================ */

const CLAVE_PRODUCTOS = 'jugoseoProductos';

const PRODUCTOS_INICIALES = [
  { id: 1, nombre: 'Polera Jugoseo Classic', categoria: 'Poleras', precio: 14990, stock: 12 },
  { id: 2, nombre: 'Taza Jugoseo Neon',       categoria: 'Tazas',   precio: 6990,  stock: 20 },
  { id: 3, nombre: 'Gorro Jugoseo',           categoria: 'Accesorios', precio: 9990, stock: 8 },
  { id: 4, nombre: 'Sticker Pack Jugoseo',    categoria: 'Accesorios', precio: 3490, stock: 50 },
  { id: 5, nombre: 'Vinilo Jugoseo Sessions', categoria: 'Vinilos', precio: 19990, stock: 5 },
  { id: 6, nombre: 'Entrada Jugoseo Fest',    categoria: 'Eventos', precio: 12000, stock: 3 },
];

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
