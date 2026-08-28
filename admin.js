/* ============================================================
   js/admin.js
   RF09 - Panel de Control Interno con menú lateral
   RF10 - Mantenedores Administrativos (crear, listar, editar
          productos y usuarios/radioescuchas)
   RNF02 - Todo sin recargar la página
   ============================================================ */

const CLAVE_RADIOESCUCHAS_ADMIN = 'jugoseoRadioescuchas';

let productosAdmin = [];
let radioescuchasAdmin = [];

// ---------------------------------------------------------
// RF09: Navegación entre secciones del panel (sin recargar)
// ---------------------------------------------------------
function cambiarSeccionAdmin(seccion) {
  document.querySelectorAll('.jugoseo-admin-seccion').forEach(el => el.classList.add('d-none'));
  document.getElementById(`seccion-${seccion}`).classList.remove('d-none');

  document.querySelectorAll('.jugoseo-admin-link').forEach(link => {
    link.classList.toggle('active', link.dataset.seccion === seccion);
  });

  if (seccion === 'dashboard') renderizarDashboard();
  if (seccion === 'productos') renderizarTablaProductos();
  if (seccion === 'radioescuchas') renderizarTablaRadioescuchas();
}

// ---------------------------------------------------------
// Dashboard: resumen rápido
// ---------------------------------------------------------
function renderizarDashboard() {
  document.getElementById('statProductos').textContent = productosAdmin.length;
  document.getElementById('statStockBajo').textContent = productosAdmin.filter(p => p.stock <= 5).length;
  document.getElementById('statRadioescuchas').textContent = radioescuchasAdmin.length;

  const conteoTipos = radioescuchasAdmin.reduce((acc, r) => {
    acc[r.tipo] = (acc[r.tipo] || 0) + 1;
    return acc;
  }, {});
  document.getElementById('statSociosVip').textContent = conteoTipos['Socio VIP'] || 0;
}

// ---------------------------------------------------------
// RF10: Mantenedor de Productos
// ---------------------------------------------------------
function renderizarTablaProductos() {
  const cuerpo = document.getElementById('cuerpoTablaProductos');
  cuerpo.innerHTML = '';

  if (productosAdmin.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="5" class="text-center jugoseo-card-texto py-3">Sin productos aún.</td></tr>';
    return;
  }

  productosAdmin.forEach(producto => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${producto.nombre}</td>
      <td>${producto.categoria}</td>
      <td>$${producto.precio.toLocaleString('es-CL')}</td>
      <td>${producto.stock}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-light me-1" onclick="abrirFormularioProducto(${producto.id})">Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${producto.id})">Eliminar</button>
      </td>`;
    cuerpo.appendChild(fila);
  });
}

function abrirFormularioProducto(id = null) {
  const form = document.getElementById('formProducto');
  form.reset();
  document.getElementById('productoIdEditando').value = '';

  if (id !== null) {
    const producto = productosAdmin.find(p => p.id === id);
    document.getElementById('modalProductoLabel').textContent = 'Editar producto';
    document.getElementById('productoIdEditando').value = producto.id;
    document.getElementById('productoNombre').value = producto.nombre;
    document.getElementById('productoCategoria').value = producto.categoria;
    document.getElementById('productoPrecio').value = producto.precio;
    document.getElementById('productoStock').value = producto.stock;
  } else {
    document.getElementById('modalProductoLabel').textContent = 'Nuevo producto';
  }

  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto')).show();
}

function guardarProductoAdmin(evento) {
  evento.preventDefault();

  const idEditando = document.getElementById('productoIdEditando').value;
  const nombre = document.getElementById('productoNombre').value.trim();
  const categoria = document.getElementById('productoCategoria').value.trim();
  const precio = parseInt(document.getElementById('productoPrecio').value, 10);
  const stock = parseInt(document.getElementById('productoStock').value, 10);

  if (!nombre || !categoria || isNaN(precio) || precio < 0 || isNaN(stock) || stock < 0) {
    mostrarToastAdmin('Revisa los datos del producto: todos los campos son obligatorios y deben ser válidos.', 'error');
    return;
  }

  if (idEditando) {
    const producto = productosAdmin.find(p => p.id === parseInt(idEditando, 10));
    producto.nombre = nombre;
    producto.categoria = categoria;
    producto.precio = precio;
    producto.stock = stock;
    mostrarToastAdmin('Producto actualizado.', 'exito');
  } else {
    productosAdmin.push({ id: generarIdProducto(productosAdmin), nombre, categoria, precio, stock });
    mostrarToastAdmin('Producto creado.', 'exito');
  }

  guardarProductos(productosAdmin);
  renderizarTablaProductos();
  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto')).hide();
}

function eliminarProducto(id) {
  productosAdmin = productosAdmin.filter(p => p.id !== id);
  guardarProductos(productosAdmin);
  renderizarTablaProductos();
  mostrarToastAdmin('Producto eliminado.', 'info');
}

// ---------------------------------------------------------
// RF10: Mantenedor de Radioescuchas / Socios
// ---------------------------------------------------------
function guardarRadioescuchasAdmin() {
  localStorage.setItem(CLAVE_RADIOESCUCHAS_ADMIN, JSON.stringify(radioescuchasAdmin));
}

function renderizarTablaRadioescuchas() {
  const cuerpo = document.getElementById('cuerpoTablaRadioescuchas');
  cuerpo.innerHTML = '';

  if (radioescuchasAdmin.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="6" class="text-center jugoseo-card-texto py-3">Aún no hay radioescuchas registrados.</td></tr>';
    return;
  }

  radioescuchasAdmin.forEach((persona, indice) => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td>${persona.nombre} ${persona.apellido}</td>
      <td>${persona.correo}</td>
      <td>${persona.run}</td>
      <td>${persona.region} / ${persona.comuna}</td>
      <td>${persona.tipo}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-outline-light me-1" onclick="abrirFormularioRadioescucha(${indice})">Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarRadioescucha(${indice})">Eliminar</button>
      </td>`;
    cuerpo.appendChild(fila);
  });
}

function abrirFormularioRadioescucha(indice = null) {
  const form = document.getElementById('formRadioescucha');
  form.reset();
  document.getElementById('radioescuchaIndiceEditando').value = '';

  if (indice !== null) {
    const persona = radioescuchasAdmin[indice];
    document.getElementById('modalRadioescuchaLabel').textContent = 'Editar radioescucha';
    document.getElementById('radioescuchaIndiceEditando').value = indice;
    document.getElementById('radioescuchaNombre').value = persona.nombre;
    document.getElementById('radioescuchaApellido').value = persona.apellido;
    document.getElementById('radioescuchaCorreo').value = persona.correo;
    document.getElementById('radioescuchaRun').value = persona.run;
    document.getElementById('radioescuchaRegion').value = persona.region;
    document.getElementById('radioescuchaComuna').value = persona.comuna;
    document.getElementById('radioescuchaTipo').value = persona.tipo;
  } else {
    document.getElementById('modalRadioescuchaLabel').textContent = 'Nuevo radioescucha';
  }

  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRadioescucha')).show();
}

function guardarRadioescuchaAdmin(evento) {
  evento.preventDefault();

  const indiceEditando = document.getElementById('radioescuchaIndiceEditando').value;
  const datos = {
    nombre: document.getElementById('radioescuchaNombre').value.trim(),
    apellido: document.getElementById('radioescuchaApellido').value.trim(),
    correo: document.getElementById('radioescuchaCorreo').value.trim(),
    run: document.getElementById('radioescuchaRun').value.trim().toUpperCase(),
    region: document.getElementById('radioescuchaRegion').value.trim(),
    comuna: document.getElementById('radioescuchaComuna').value.trim(),
    tipo: document.getElementById('radioescuchaTipo').value,
  };

  if (!datos.nombre || !datos.apellido || !datos.correo || !datos.run) {
    mostrarToastAdmin('Nombre, apellido, correo y RUN son obligatorios.', 'error');
    return;
  }

  if (indiceEditando !== '') {
    radioescuchasAdmin[parseInt(indiceEditando, 10)] = datos;
    mostrarToastAdmin('Radioescucha actualizado.', 'exito');
  } else {
    radioescuchasAdmin.push(datos);
    mostrarToastAdmin('Radioescucha creado.', 'exito');
  }

  guardarRadioescuchasAdmin();
  renderizarTablaRadioescuchas();
  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRadioescucha')).hide();
}

function eliminarRadioescucha(indice) {
  radioescuchasAdmin.splice(indice, 1);
  guardarRadioescuchasAdmin();
  renderizarTablaRadioescuchas();
  mostrarToastAdmin('Radioescucha eliminado.', 'info');
}

// ---------------------------------------------------------
// Notificaciones (mismo patrón usado en el resto del sitio)
// ---------------------------------------------------------
function mostrarToastAdmin(mensaje, tipo = 'exito') {
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
// Inicio
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  productosAdmin = obtenerProductos();
  radioescuchasAdmin = JSON.parse(localStorage.getItem(CLAVE_RADIOESCUCHAS_ADMIN)) || [];

  document.querySelectorAll('.jugoseo-admin-link').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      cambiarSeccionAdmin(link.dataset.seccion);
    });
  });

  document.getElementById('btnNuevoProducto').addEventListener('click', () => abrirFormularioProducto(null));
  document.getElementById('formProducto').addEventListener('submit', guardarProductoAdmin);

  document.getElementById('btnNuevoRadioescucha').addEventListener('click', () => abrirFormularioRadioescucha(null));
  document.getElementById('formRadioescucha').addEventListener('submit', guardarRadioescuchaAdmin);

  cambiarSeccionAdmin('dashboard');
});
