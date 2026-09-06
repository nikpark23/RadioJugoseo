/* ============================================================
   js/admin.js
   RF09 - Panel de Control Interno con menú lateral
   RF10 - Mantenedores Administrativos (crear, listar, editar
          productos y usuarios/radioescuchas)
   RNF02 - Todo sin recargar la página
   ============================================================ */

const CLAVE_RADIOESCUCHAS_ADMIN = 'jugoseoRadioescuchas';

// ---------------------------------------------------------
// RF05: Tipos de usuario implementados
// Nota: El sistema utiliza "Socio VIP" y "Radioescucha Oficial" 
// como tipos de usuario, consistentes entre registro y admin
// ---------------------------------------------------------

// ---------------------------------------------------------
// RF06: Datos de Región -> Comunas (subset representativo)
// ---------------------------------------------------------
const REGIONES_COMUNAS_ADMIN = {
  'Región Metropolitana': ['Santiago', 'Providencia', 'Ñuñoa', 'Maipú', 'Puente Alto'],
  'Valparaíso':            ['Valparaíso', 'Viña del Mar', 'Quilpué', 'San Antonio', 'Los Andes'],
  "O'Higgins":             ['Rancagua', 'San Fernando', 'Rengo', 'Machalí'],
  'Maule':                 ['Talca', 'Curicó', 'Linares', 'Constitución'],
  'Biobío':                ['Concepción', 'Talcahuano', 'Los Ángeles', 'Chillán'],
  'Araucanía':             ['Temuco', 'Villarrica', 'Angol', 'Pucón'],
  'Los Lagos':             ['Puerto Montt', 'Osorno', 'Castro', 'Puerto Varas'],
  'Antofagasta':           ['Antofagasta', 'Calama', 'Tocopilla'],
  'Coquimbo':              ['La Serena', 'Coquimbo', 'Ovalle'],
};

let productosAdmin = [];
let radioescuchasAdmin = [];

// ---------------------------------------------------------
// RF06: Poblar el select de Región y reaccionar a cambios (Admin)
// ---------------------------------------------------------
function poblarRegionesAdmin() {
  const selectRegion = document.getElementById('radioescuchaRegion');
  if (!selectRegion) return;
  
  selectRegion.innerHTML = '<option value="" selected disabled>Selecciona una región</option>';
  Object.keys(REGIONES_COMUNAS_ADMIN).forEach(region => {
    const opcion = document.createElement('option');
    opcion.value = region;
    opcion.textContent = region;
    selectRegion.appendChild(opcion);
  });
}

function actualizarComunasAdmin() {
  const region = document.getElementById('radioescuchaRegion').value;
  const selectComuna = document.getElementById('radioescuchaComuna');
  if (!selectComuna) return;

  selectComuna.innerHTML = '<option value="" selected disabled>Selecciona una comuna</option>';

  if (region && REGIONES_COMUNAS_ADMIN[region]) {
    if (REGIONES_COMUNAS_ADMIN[region].length === 0) {
      selectComuna.disabled = true;
      mostrarToastAdmin('No hay comunas disponibles para esta región.', 'error');
      return;
    }
    selectComuna.disabled = false;
    REGIONES_COMUNAS_ADMIN[region].forEach(comuna => {
      const opcion = document.createElement('option');
      opcion.value = comuna;
      opcion.textContent = comuna;
      selectComuna.appendChild(opcion);
    });
  } else {
    selectComuna.disabled = true;
  }
}

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
    cuerpo.innerHTML = '<tr><td colspan="6" class="text-center jugoseo-card-texto py-3">Sin productos aún.</td></tr>';
    return;
  }

  productosAdmin.forEach(producto => {
    const fila = document.createElement('tr');
    fila.innerHTML = `
      <td><img src="${producto.imagen || IMAGEN_PRODUCTO_GENERICA}" alt="${producto.nombre}" style="width:42px;height:42px;object-fit:cover;border-radius:6px;" class="me-2"></td>
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
    document.getElementById('productoImagen').value = producto.imagen || '';
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
  const imagen = document.getElementById('productoImagen').value.trim();

  // RF02: Validación de longitud del nombre (máximo 100 caracteres)
  if (nombre.length > 100) {
    mostrarToastAdmin('El nombre del producto no puede superar los 100 caracteres.', 'error');
    return;
  }

  // RF02: Validación de categoría predefinida
  if (!esCategoriaValida(categoria)) {
    mostrarToastAdmin('La categoría seleccionada no es válida.', 'error');
    return;
  }

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
    producto.imagen = imagen;
    mostrarToastAdmin('Producto actualizado.', 'exito');
  } else {
    productosAdmin.push({ id: generarIdProducto(productosAdmin), nombre, categoria, precio, stock, imagen });
    mostrarToastAdmin('Producto creado. Ya está disponible en la Tienda.', 'exito');
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
  try {
    localStorage.setItem(CLAVE_RADIOESCUCHAS_ADMIN, JSON.stringify(radioescuchasAdmin));
    return true;
  } catch (error) {
    console.error('Error al acceder a localStorage:', error);
    return false;
  }
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
  
  poblarRegionesAdmin();
  document.getElementById('radioescuchaComuna').disabled = true;

  if (indice !== null) {
    const persona = radioescuchasAdmin[indice];
    document.getElementById('modalRadioescuchaLabel').textContent = 'Editar radioescucha';
    document.getElementById('radioescuchaIndiceEditando').value = indice;
    document.getElementById('radioescuchaNombre').value = persona.nombre;
    document.getElementById('radioescuchaApellido').value = persona.apellido;
    document.getElementById('radioescuchaCorreo').value = persona.correo;
    document.getElementById('radioescuchaRun').value = persona.run;
    document.getElementById('radioescuchaRegion').value = persona.region;
    document.getElementById('radioescuchaTipo').value = persona.tipo;
    document.getElementById('radioescuchaFechaNacimiento').value = persona.fechaNacimiento || '';
    document.getElementById('radioescuchaDireccion').value = persona.direccion || '';
    document.getElementById('radioescuchaPassword').value = '';
    
    // Actualizar comunas según la región y seleccionar la comuna
    actualizarComunasAdmin();
    document.getElementById('radioescuchaComuna').value = persona.comuna;
  } else {
    document.getElementById('modalRadioescuchaLabel').textContent = 'Nuevo radioescucha';
  }

  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalRadioescucha')).show();
}

function guardarRadioescuchaAdmin(evento) {
  evento.preventDefault();

  const indiceEditando = document.getElementById('radioescuchaIndiceEditando').value;
  const passwordIngresada = document.getElementById('radioescuchaPassword').value;
  const datos = {
    nombre: document.getElementById('radioescuchaNombre').value.trim(),
    apellido: document.getElementById('radioescuchaApellido').value.trim(),
    correo: document.getElementById('radioescuchaCorreo').value.trim().toLowerCase(),
    run: document.getElementById('radioescuchaRun').value.trim().toUpperCase(),
    region: document.getElementById('radioescuchaRegion').value,
    comuna: document.getElementById('radioescuchaComuna').value,
    tipo: document.getElementById('radioescuchaTipo').value,
    fechaNacimiento: document.getElementById('radioescuchaFechaNacimiento').value || null,
    direccion: document.getElementById('radioescuchaDireccion').value.trim() || null,
  };

  if (!datos.nombre || !datos.apellido || !datos.correo || !datos.run) {
    mostrarToastAdmin('Nombre, apellido, correo y RUN son obligatorios.', 'error');
    return;
  }

  // Validaciones de longitud máxima
  if (datos.nombre.length > 50) {
    mostrarToastAdmin('El nombre no puede superar 50 caracteres.', 'error');
    return;
  }
  if (datos.apellido.length > 100) {
    mostrarToastAdmin('El apellido no puede superar 100 caracteres.', 'error');
    return;
  }
  if (datos.correo.length > 100) {
    mostrarToastAdmin('El correo no puede superar 100 caracteres.', 'error');
    return;
  }
  if (!validarDominioCorreoAdmin(datos.correo)) {
    mostrarToastAdmin('El correo debe pertenecer a @duoc.cl, @profesor.duoc.cl o @gmail.com.', 'error');
    return;
  }
  if (datos.direccion && datos.direccion.length > 300) {
    mostrarToastAdmin('La dirección no puede superar 300 caracteres.', 'error');
    return;
  }

  if (passwordIngresada && (passwordIngresada.length < 4 || passwordIngresada.length > 10)) {
    mostrarToastAdmin('La contraseña debe tener entre 4 y 10 caracteres.', 'error');
    return;
  }

  if (indiceEditando !== '') {
    // Edición: si dejó la contraseña vacía, se mantiene la que ya tenía.
    datos.password = passwordIngresada || radioescuchasAdmin[parseInt(indiceEditando, 10)].password;
    if (!datos.password) {
      mostrarToastAdmin('Esta cuenta aún no tiene contraseña; ingresa una para que pueda iniciar sesión.', 'error');
      return;
    }
    radioescuchasAdmin[parseInt(indiceEditando, 10)] = datos;
    mostrarToastAdmin('Radioescucha actualizado.', 'exito');
  } else {
    // Creación: la contraseña es obligatoria para que la cuenta pueda hacer login.
    if (!passwordIngresada) {
      mostrarToastAdmin('Debes ingresar una contraseña para que la cuenta pueda iniciar sesión.', 'error');
      return;
    }
    const correoDuplicado = radioescuchasAdmin.some(r => (r.correo || '').toLowerCase() === datos.correo);
    if (correoDuplicado) {
      mostrarToastAdmin('Ya existe un radioescucha registrado con ese correo.', 'error');
      return;
    }
    const runDuplicado = radioescuchasAdmin.some(r => (r.run || '').toUpperCase() === datos.run);
    if (runDuplicado) {
      mostrarToastAdmin('Ya existe un radioescucha registrado con ese RUN.', 'error');
      return;
    }
    datos.password = passwordIngresada;
    radioescuchasAdmin.push(datos);
    mostrarToastAdmin('Radioescucha creado.', 'exito');
  }

  if (!guardarRadioescuchasAdmin()) {
    mostrarToastAdmin('No es posible guardar los cambios localmente. Verifica que tu navegador permita el almacenamiento local.', 'error');
    return;
  }
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
// RF: Validación de dominios de correo autorizados
// ---------------------------------------------------------
function validarDominioCorreoAdmin(correo) {
  const dominiosAutorizados = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
  const dominio = correo.substring(correo.lastIndexOf('@'));
  return dominiosAutorizados.includes(dominio);
}

// ---------------------------------------------------------
// RF02: Validar que la categoría sea válida (importado de productos-data.js)
// ---------------------------------------------------------
function esCategoriaValida(categoria) {
  if (typeof CATEGORIAS_VALIDAS !== 'undefined') {
    return CATEGORIAS_VALIDAS.includes(categoria);
  }
  // Fallback por compatibilidad si CATEGORIAS_VALIDAS no está disponible
  return ['Poleras', 'Tazas', 'Eventos'].includes(categoria);
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
  
  // Event listener para actualizar comunas cuando cambia la región en el modal
  document.getElementById('radioescuchaRegion').addEventListener('change', actualizarComunasAdmin);

  cambiarSeccionAdmin('dashboard');
});
