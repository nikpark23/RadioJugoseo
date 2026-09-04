/* ============================================================
   js/tienda.js
   RF02 - Catálogo de Merchandising (arreglo en JS)
   RF03 - Carrito con Subtotales, Total y localStorage
   RNF02 - Mensajes dinámicos sin recargar la página
   RNF05 - Persistencia local del carrito
   ============================================================ */

const CLAVE_CARRITO = 'jugoseoCarrito';

// ---------------------------------------------------------
// RF02: Catálogo de productos (fuente compartida: productos-data.js)
// ---------------------------------------------------------
let PRODUCTOS = [];

let carrito = [];

// ---------------------------------------------------------
// Utilidades
// ---------------------------------------------------------
function formatearCLP(valor) {
  return valor.toLocaleString('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });
}

function buscarProducto(id) {
  return PRODUCTOS.find(p => p.id === id);
}

// RNF02: mensajes/sugerencias en tiempo real sin recargar (toast de Bootstrap)
function mostrarToast(mensaje, tipo = 'exito') {
  const contenedor = document.getElementById('toastContenedor');
  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center border-0 jugoseo-toast jugoseo-toast-${tipo}`;
  toastEl.setAttribute('role', 'alert');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>`;
  contenedor.appendChild(toastEl);
  const toastBootstrap = new bootstrap.Toast(toastEl, { delay: 2600 });
  toastBootstrap.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// ---------------------------------------------------------
// RNF05 / persistencia: cargar y guardar el carrito
// ---------------------------------------------------------
function cargarCarrito() {
  const guardado = localStorage.getItem(CLAVE_CARRITO);
  carrito = guardado ? JSON.parse(guardado) : [];
}

function guardarCarrito() {
  localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
}

// ---------------------------------------------------------
// RF02: Renderizar el catálogo de productos
// ---------------------------------------------------------
function renderizarProductos() {
  const grid = document.getElementById('gridProductos');
  grid.innerHTML = '';

  PRODUCTOS.forEach(producto => {
    const agotado = producto.stock === 0;
    const pocasUnidades = producto.stock > 0 && producto.stock <= 5;

    const col = document.createElement('div');
    col.className = 'col-sm-6 col-lg-4 col-xl-3';
    col.innerHTML = `
      <div class="jugoseo-card d-flex flex-column h-100">
       <img src="${producto.imagen || IMAGEN_PRODUCTO_GENERICA}" alt="${producto.nombre}" class="jugoseo-card-img" loading="lazy">
        <span class="jugoseo-badge mb-2 d-inline-block">${producto.categoria}</span>
        <div class="jugoseo-card-titulo">${producto.nombre}</div>
        <p class="jugoseo-card-texto mb-1">
          ${agotado ? '<span class="text-danger fw-semibold">Agotado</span>' : `Stock: ${producto.stock}${pocasUnidades ? ' · ¡últimas unidades!' : ''}`}
        </p>
        <div class="d-flex justify-content-between align-items-center mt-2 mb-2">
          <span class="jugoseo-card-precio">${formatearCLP(producto.precio)}</span>
        </div>
        <div class="d-flex gap-2 mt-auto">
          <input type="number" class="form-control jugoseo-input jugoseo-qty-input"
                 id="cantidad-${producto.id}" min="1" max="${producto.stock}" value="1"
                 ${agotado ? 'disabled' : ''} aria-label="Cantidad de ${producto.nombre}">
          <button class="btn jugoseo-btn-login flex-grow-1" ${agotado ? 'disabled' : ''}
                  onclick="agregarAlCarrito(${producto.id})">
            ${agotado ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>`;
    grid.appendChild(col);
  });
}

// ---------------------------------------------------------
// RF03: Agregar al carrito con validación de stock
// ---------------------------------------------------------
function agregarAlCarrito(idProducto) {
  const producto = buscarProducto(idProducto);
  const inputCantidad = document.getElementById(`cantidad-${idProducto}`);
  let cantidad = parseInt(inputCantidad.value, 10);

  if (isNaN(cantidad) || cantidad < 1) {
    mostrarToast('Ingresa una cantidad válida.', 'error');
    return;
  }

  const itemExistente = carrito.find(i => i.id === idProducto);
  const cantidadEnCarrito = itemExistente ? itemExistente.cantidad : 0;

  if (cantidad + cantidadEnCarrito > producto.stock) {
    mostrarToast(`Solo quedan ${producto.stock} unidades de "${producto.nombre}".`, 'error');
    return;
  }

  if (itemExistente) {
    itemExistente.cantidad += cantidad;
  } else {
    carrito.push({ id: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad });
  }

  guardarCarrito();
  renderizarCarrito();
  mostrarToast(`"${producto.nombre}" se agregó al carrito.`, 'exito');
}

// ---------------------------------------------------------
// RF03: Modificar cantidad / eliminar / vaciar
// ---------------------------------------------------------
function cambiarCantidad(idProducto, delta) {
  const item = carrito.find(i => i.id === idProducto);
  const producto = buscarProducto(idProducto);
  if (!item) return;

  const nuevaCantidad = item.cantidad + delta;

  if (nuevaCantidad < 1) {
    eliminarDelCarrito(idProducto);
    return;
  }
  if (nuevaCantidad > producto.stock) {
    mostrarToast(`Solo quedan ${producto.stock} unidades de "${producto.nombre}".`, 'error');
    return;
  }

  item.cantidad = nuevaCantidad;
  guardarCarrito();
  renderizarCarrito();
}

function eliminarDelCarrito(idProducto) {
  carrito = carrito.filter(i => i.id !== idProducto);
  guardarCarrito();
  renderizarCarrito();
  mostrarToast('Producto eliminado del carrito.', 'info');
}

function vaciarCarrito() {
  if (carrito.length === 0) return;
  carrito = [];
  guardarCarrito();
  renderizarCarrito();
  mostrarToast('Carrito vaciado.', 'info');
}

// ---------------------------------------------------------
// RF03: Renderizar carrito con subtotales y total general
// ---------------------------------------------------------
function renderizarCarrito() {
  const lista = document.getElementById('listaCarrito');
  const totalEl = document.getElementById('totalCarrito');
  const contadorEl = document.getElementById('contadorCarrito');

  lista.innerHTML = '';

  if (carrito.length === 0) {
    lista.innerHTML = '<p class="jugoseo-card-texto text-center py-4 mb-0">Tu carrito está vacío.</p>';
  }

  let total = 0;

  carrito.forEach(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;

    const fila = document.createElement('div');
    fila.className = 'jugoseo-carrito-item d-flex align-items-center gap-2';
    fila.innerHTML = `
      <div class="flex-grow-1">
        <div class="jugoseo-card-titulo" style="font-size: 0.95rem;">${item.nombre}</div>
        <div class="jugoseo-card-texto">${formatearCLP(item.precio)} c/u</div>
      </div>
      <div class="d-flex align-items-center gap-1">
        <button class="jugoseo-btn-qty" onclick="cambiarCantidad(${item.id}, -1)" aria-label="Restar unidad">−</button>
        <span class="jugoseo-qty-valor">${item.cantidad}</span>
        <button class="jugoseo-btn-qty" onclick="cambiarCantidad(${item.id}, 1)" aria-label="Sumar unidad">+</button>
      </div>
      <div class="jugoseo-card-precio text-end" style="min-width: 90px;">${formatearCLP(subtotal)}</div>
      <button class="jugoseo-btn-eliminar" onclick="eliminarDelCarrito(${item.id})" aria-label="Eliminar producto">✕</button>
    `;
    lista.appendChild(fila);
  });

  totalEl.textContent = formatearCLP(total);

  const totalUnidades = carrito.reduce((acc, i) => acc + i.cantidad, 0);
  contadorEl.textContent = totalUnidades;
  contadorEl.classList.toggle('d-none', totalUnidades === 0);
}

// ---------------------------------------------------------
// Inicio
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  PRODUCTOS = obtenerProductos();
  cargarCarrito();
  renderizarProductos();
  renderizarCarrito();

  document.getElementById('btnVaciarCarrito').addEventListener('click', vaciarCarrito);
});
