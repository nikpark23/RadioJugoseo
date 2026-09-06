/* ============================================================
   js/admin.js
   RF09 - Panel de Control Interno con menú lateral
   RF10 - Mantenedores Administrativos (crear, listar, editar
          productos y usuarios/radioescuchas)
   RNF02 - Todo sin recargar la página
   ============================================================ */

const CLAVE_RADIOESCUCHAS_ADMIN = 'jugoseoRadioescuchas';
const CLAVE_PEDIDOS_ADMIN = 'jugoseoPedidos';

// ---------------------------------------------------------
// RF09: Estados permitidos para pedidos
// ---------------------------------------------------------
const ESTADOS_PEDIDO = ['Pendiente', 'En preparación', 'Enviado', 'Entregado'];

// ---------------------------------------------------------
// RF09: Datos iniciales de pedidos simulados
// ---------------------------------------------------------
const PEDIDOS_INICIALES = [
  {
    id: 1,
    cliente: 'Juan Pérez',
    productos: [
      { nombre: 'Polera Jugoseo Classic', cantidad: 2, precio: 19990 },
      { nombre: 'Taza Jugoseo Classic', cantidad: 1, precio: 6990 }
    ],
    total: 46970,
    fecha: '2024-01-15',
    estado: 'Pendiente'
  },
  {
    id: 2,
    cliente: 'María García',
    productos: [
      { nombre: 'Vasos Jugoseo Neon', cantidad: 1, precio: 6990 }
    ],
    total: 6990,
    fecha: '2024-01-14',
    estado: 'En preparación'
  },
  {
    id: 3,
    cliente: 'Carlos López',
    productos: [
      { nombre: 'Entrada Jugoseo Fest', cantidad: 3, precio: 12000 }
    ],
    total: 36000,
    fecha: '2024-01-13',
    estado: 'Enviado'
  }
];

// ---------------------------------------------------------
// RF05: Tipos de usuario implementados
// Nota: El sistema utiliza "Socio VIP" y "Radioescucha Oficial" 
// como tipos de usuario, consistentes entre registro y admin
// ---------------------------------------------------------

//Agregar inicio de sesion de los usuarios de arriba (Maria garcia como vendedor y juan perez como cliente) con sus respectivos correos y contraseñas. Si ya existen en la pagina, que solamente los remplaces.
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
let pedidosAdmin = [];

// ---------------------------------------------------------
// RF09: Funciones para gestión de pedidos
// ---------------------------------------------------------
function inicializarPedidos() {
  if (!localStorage.getItem(CLAVE_PEDIDOS_ADMIN)) {
    localStorage.setItem(CLAVE_PEDIDOS_ADMIN, JSON.stringify(PEDIDOS_INICIALES));
  }
}

function obtenerPedidos() {
  inicializarPedidos();
  return JSON.parse(localStorage.getItem(CLAVE_PEDIDOS_ADMIN));
}

function guardarPedidos(listaPedidos) {
  localStorage.setItem(CLAVE_PEDIDOS_ADMIN, JSON.stringify(listaPedidos));
}

function generarIdPedido(listaPedidos) {
  return listaPedidos.length ? Math.max(...listaPedidos.map(p => p.id)) + 1 : 1;
}

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
  const rol = obtenerRolUsuario();
  
  // RF09: Validar que el Vendedor no acceda a secciones prohibidas
  if (rol === 'Vendedor' && (seccion === 'radioescuchas' || seccion === 'gestion-usuarios')) {
    mostrarToastAdmin('No tienes permiso para acceder a esta sección.', 'error');
    return;
  }
  
  document.querySelectorAll('.jugoseo-admin-seccion').forEach(el => el.classList.add('d-none'));
  const seccionObjetivo = document.getElementById(`seccion-${seccion}`);
  
  if (seccionObjetivo) {
    seccionObjetivo.classList.remove('d-none');
  } else {
    console.error(`Sección ${seccion} no encontrada`);
    return;
  }

  document.querySelectorAll('.jugoseo-admin-link').forEach(link => {
    link.classList.toggle('active', link.dataset.seccion === seccion);
  });

  if (seccion === 'dashboard') renderizarDashboard();
  if (seccion === 'productos') renderizarTablaProductos();
  if (seccion === 'radioescuchas') renderizarTablaRadioescuchas();
  if (seccion === 'pedidos') renderizarTablaPedidos();
  if (seccion === 'gestion-usuarios') renderizarTablaUsuarios();
}

// ---------------------------------------------------------
// Dashboard: resumen rápido
// ---------------------------------------------------------
function renderizarDashboard() {
  const rol = obtenerRolUsuario();
  
  document.getElementById('statProductos').textContent = productosAdmin.length;
  document.getElementById('statStockBajo').textContent = productosAdmin.filter(p => p.stock <= 5).length;
  document.getElementById('statPedidos').textContent = pedidosAdmin.length;

  // RF09: Vendedor no ve estadísticas de radioescuchas
  if (rol === 'Administrador') {
    document.getElementById('statRadioescuchas').textContent = radioescuchasAdmin.length;
    
    const conteoTipos = radioescuchasAdmin.reduce((acc, r) => {
      acc[r.tipo] = (acc[r.tipo] || 0) + 1;
      return acc;
    }, {});
    document.getElementById('statSociosVip').textContent = conteoTipos['Socio VIP'] || 0;
    
    // Mostrar cards de radioescuchas
    document.getElementById('statRadioescuchas').parentElement.parentElement.classList.remove('d-none');
    document.getElementById('statSociosVip').parentElement.parentElement.classList.remove('d-none');
  } else if (rol === 'Vendedor') {
    // Ocultar cards de radioescuchas para Vendedor
    document.getElementById('statRadioescuchas').parentElement.parentElement.classList.add('d-none');
    document.getElementById('statSociosVip').parentElement.parentElement.classList.add('d-none');
  }
}

// ---------------------------------------------------------
// RF10: Mantenedor de Productos
// ---------------------------------------------------------
function renderizarTablaProductos() {
  const cuerpo = document.getElementById('cuerpoTablaProductos');
  cuerpo.innerHTML = '';
  const rol = obtenerRolUsuario();

  if (productosAdmin.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="7" class="text-center jugoseo-card-texto py-3">Sin productos aún.</td></tr>';
    return;
  }

  productosAdmin.forEach(producto => {
    const fila = document.createElement('tr');
    
    // RF09: Controles diferenciados por rol
    let accionesHtml = '';
    if (rol === 'Administrador') {
      accionesHtml = `
        <button class="btn btn-sm btn-outline-light me-1" onclick="abrirFormularioProducto(${producto.id})">Editar</button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminarProducto(${producto.id})">Eliminar</button>
      `;
    } else if (rol === 'Vendedor') {
      // Vendedor solo puede editar stock
      accionesHtml = `
        <button class="btn btn-sm btn-outline-light" onclick="abrirFormularioStock(${producto.id})">Editar Stock</button>
      `;
    }

    // RF10: Indicador visual de stock crítico (≤5 productos)
    const stockCritico = producto.stock <= 5;
    const stockHtml = stockCritico 
      ? `<span class="badge bg-danger jugoseo-badge">${producto.stock} ⚠️</span>`
      : `${producto.stock}`;

    fila.innerHTML = `
      <td><img src="${producto.imagen || IMAGEN_PRODUCTO_GENERICA}" alt="${producto.nombre}" style="width:42px;height:42px;object-fit:cover;border-radius:6px;" class="me-2"></td>
      <td>${producto.codigo}</td>
      <td>${producto.nombre}</td>
      <td>${producto.categoria}</td>
      <td>$${producto.precio.toLocaleString('es-CL')}</td>
      <td>${stockHtml}</td>
      <td class="text-end">${accionesHtml}</td>`;
    cuerpo.appendChild(fila);
  });

  // RF09: Ocultar botón "Nuevo producto" para Vendedor
  const btnNuevoProducto = document.getElementById('btnNuevoProducto');
  if (btnNuevoProducto) {
    btnNuevoProducto.classList.toggle('d-none', rol === 'Vendedor');
  }
}

function abrirFormularioProducto(id = null) {
  const form = document.getElementById('formProducto');
  form.reset();
  document.getElementById('productoIdEditando').value = '';
  const rol = obtenerRolUsuario();

  // RF09: Vendedor no puede crear productos, solo editar stock
  if (rol === 'Vendedor' && id === null) {
    mostrarToastAdmin('Solo el Administrador puede crear nuevos productos.', 'error');
    return;
  }

  if (id !== null) {
    const producto = productosAdmin.find(p => p.id === id);
    
    if (rol === 'Vendedor') {
      // Vendedor solo edita stock
      document.getElementById('modalProductoLabel').textContent = 'Editar Stock';
      document.getElementById('productoIdEditando').value = producto.id;
      document.getElementById('productoStock').value = producto.stock;
      
      // Deshabilitar otros campos para Vendedor
      document.getElementById('productoCodigo').disabled = true;
      document.getElementById('productoNombre').disabled = true;
      document.getElementById('productoDescripcion').disabled = true;
      document.getElementById('productoCategoria').disabled = true;
      document.getElementById('productoPrecio').disabled = true;
      document.getElementById('productoImagen').disabled = true;
    } else {
      // Administrador edita todo
      document.getElementById('modalProductoLabel').textContent = 'Editar producto';
      document.getElementById('productoIdEditando').value = producto.id;
      document.getElementById('productoCodigo').value = producto.codigo;
      document.getElementById('productoNombre').value = producto.nombre;
      document.getElementById('productoDescripcion').value = producto.descripcion || '';
      document.getElementById('productoCategoria').value = producto.categoria;
      document.getElementById('productoPrecio').value = producto.precio;
      document.getElementById('productoStock').value = producto.stock;
      document.getElementById('productoImagen').value = producto.imagen || '';
      
      // Habilitar todos los campos
      document.getElementById('productoCodigo').disabled = false;
      document.getElementById('productoNombre').disabled = false;
      document.getElementById('productoDescripcion').disabled = false;
      document.getElementById('productoCategoria').disabled = false;
      document.getElementById('productoPrecio').disabled = false;
      document.getElementById('productoImagen').disabled = false;
    }
  } else {
    document.getElementById('modalProductoLabel').textContent = 'Nuevo producto';
    
    // Habilitar todos los campos para nuevo producto
    document.getElementById('productoCodigo').disabled = false;
    document.getElementById('productoNombre').disabled = false;
    document.getElementById('productoDescripcion').disabled = false;
    document.getElementById('productoCategoria').disabled = false;
    document.getElementById('productoPrecio').disabled = false;
    document.getElementById('productoImagen').disabled = false;
  }

  bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto')).show();
}

function guardarProductoAdmin(evento) {
  evento.preventDefault();

  const idEditando = document.getElementById('productoIdEditando').value;
  const rol = obtenerRolUsuario();
  
  const codigo = document.getElementById('productoCodigo').value.trim();
  const nombre = document.getElementById('productoNombre').value.trim();
  const descripcion = document.getElementById('productoDescripcion').value.trim();
  const categoria = document.getElementById('productoCategoria').value.trim();
  const precio = parseInt(document.getElementById('productoPrecio').value, 10);
  const stock = parseInt(document.getElementById('productoStock').value, 10);
  const imagen = document.getElementById('productoImagen').value.trim();

  // RF09: Vendedor solo puede editar stock
  if (rol === 'Vendedor') {
    if (!idEditando) {
      mostrarToastAdmin('Solo el Administrador puede crear productos.', 'error');
      return;
    }
    
    if (isNaN(stock) || stock < 0) {
      mostrarToastAdmin('El stock debe ser un número mayor o igual a 0.', 'error');
      return;
    }

    const producto = productosAdmin.find(p => p.id === parseInt(idEditando, 10));
    if (producto) {
      producto.stock = stock;
      guardarProductos(productosAdmin);
      renderizarTablaProductos();
      mostrarToastAdmin('Stock actualizado.', 'exito');
    }
    bootstrap.Modal.getOrCreateInstance(document.getElementById('modalProducto')).hide();
    return;
  }

  // RF10: Validación de código (mínimo 3 caracteres)
  if (!codigo || codigo.length < 3) {
    mostrarToastAdmin('El código debe tener al menos 3 caracteres.', 'error');
    return;
  }

  // RF10: Validación de código único
  const codigoDuplicado = productosAdmin.some(p => 
    p.codigo === codigo && p.id !== parseInt(idEditando || '0', 10)
  );
  if (codigoDuplicado) {
    mostrarToastAdmin('Ya existe un producto con ese código.', 'error');
    return;
  }

  // RF02: Validación de longitud del nombre (máximo 100 caracteres)
  if (nombre.length > 100) {
    mostrarToastAdmin('El nombre del producto no puede superar los 100 caracteres.', 'error');
    return;
  }

  // RF10: Validación de longitud de descripción (máximo 500 caracteres)
  if (descripcion.length > 500) {
    mostrarToastAdmin('La descripción no puede superar los 500 caracteres.', 'error');
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
    producto.codigo = codigo;
    producto.nombre = nombre;
    producto.descripcion = descripcion;
    producto.categoria = categoria;
    producto.precio = precio;
    producto.stock = stock;
    producto.imagen = imagen;
    mostrarToastAdmin('Producto actualizado.', 'exito');
  } else {
    productosAdmin.push({ id: generarIdProducto(productosAdmin), codigo, nombre, descripcion, categoria, precio, stock, imagen });
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
// RF09: Edición de stock para Vendedor
// ---------------------------------------------------------
function abrirFormularioStock(id) {
  const producto = productosAdmin.find(p => p.id === id);
  if (!producto) return;

  const nuevoStock = prompt(`Ingrese el nuevo stock para "${producto.nombre}":`, producto.stock);
  
  if (nuevoStock === null) return; // Usuario canceló
  
  const stockNumerico = parseInt(nuevoStock, 10);
  
  if (isNaN(stockNumerico) || stockNumerico < 0) {
    mostrarToastAdmin('El stock debe ser un número mayor o igual a 0.', 'error');
    return;
  }

  producto.stock = stockNumerico;
  guardarProductos(productosAdmin);
  renderizarTablaProductos();
  mostrarToastAdmin(`Stock de "${producto.nombre}" actualizado a ${stockNumerico}.`, 'exito');
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
    rol: 'Cliente',
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
    // Mantener fechaCreación original
    datos.fechaCreacion = radioescuchasAdmin[parseInt(indiceEditando, 10)].fechaCreacion;
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
    datos.fechaCreacion = new Date().toISOString();
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
// RF10: Gestión de Usuarios
// ---------------------------------------------------------
const ROLES_DISPONIBLES = ['Cliente', 'Vendedor', 'Administrador'];

function cambiarRolUsuario(indice, nuevoRol, evento) {
  if (evento) {
    evento.preventDefault();
    evento.stopPropagation();
  }

  const usuario = radioescuchasAdmin[indice];
  if (!usuario) return;

  const rolActual = usuario.rol || 'Cliente';

  if (nuevoRol === rolActual) {
    mostrarToastAdmin('El usuario ya tiene ese rol.', 'info');
    return;
  }

  // Confirmar cambio
  if (!confirm(`¿Estás seguro de cambiar el rol de ${usuario.nombre} ${usuario.apellido} de "${rolActual}" a "${nuevoRol}"?`)) {
    return;
  }

  // Guardar el nuevo rol
  radioescuchasAdmin[indice].rol = nuevoRol;
  guardarRadioescuchasAdmin();
  
  // Actualizar la tabla
  renderizarTablaUsuarios();
  mostrarToastAdmin(`Rol de ${usuario.nombre} ${usuario.apellido} cambiado a "${nuevoRol}".`, 'exito');
}
function renderizarTablaUsuarios() {
  const cuerpo = document.getElementById('cuerpoTablaUsuarios');
  cuerpo.innerHTML = '';

  if (radioescuchasAdmin.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="5" class="text-center jugoseo-card-texto py-3">Aún no hay usuarios registrados.</td></tr>';
    return;
  }

  radioescuchasAdmin.forEach((usuario, indice) => {
    const fila = document.createElement('tr');
    
    // Formatear fecha de creación
    let fechaFormateada = 'No disponible';
    if (usuario.fechaCreacion) {
      const fecha = new Date(usuario.fechaCreacion);
      fechaFormateada = fecha.toLocaleDateString('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    const rolActual = usuario.rol || 'Cliente';
    
    fila.innerHTML = `
      <td>${usuario.run}</td>
      <td>${usuario.nombre} ${usuario.apellido}</td>
      <td>${usuario.correo}</td>
      <td>
        <div class="dropdown">
          <button class="btn btn-sm jugoseo-badge dropdown-toggle" type="button" 
                  data-bs-toggle="dropdown" aria-expanded="false" 
                  data-bs-boundary="viewport" data-bs-flip="true">
            ${rolActual}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="#" onclick="cambiarRolUsuario(${indice}, 'Cliente', event)">Cliente</a></li>
            <li><a class="dropdown-item" href="#" onclick="cambiarRolUsuario(${indice}, 'Vendedor', event)">Vendedor</a></li>
            <li><a class="dropdown-item" href="#" onclick="cambiarRolUsuario(${indice}, 'Administrador', event)">Administrador</a></li>
          </ul>
        </div>
      </td>
      <td>${fechaFormateada}</td>`;
    cuerpo.appendChild(fila);
  });
}

// ---------------------------------------------------------
// RF09: Mantenedor de Pedidos
// ---------------------------------------------------------
function formatearProductosPedido(productos) {
  return productos.map(p => `${p.cantidad}x ${p.nombre}`).join(', ');
}

function renderizarTablaPedidos() {
  const cuerpo = document.getElementById('cuerpoTablaPedidos');
  cuerpo.innerHTML = '';
  const rol = obtenerRolUsuario();

  if (pedidosAdmin.length === 0) {
    cuerpo.innerHTML = '<tr><td colspan="7" class="text-center jugoseo-card-texto py-3">Aún no hay pedidos registrados.</td></tr>';
    return;
  }

  pedidosAdmin.forEach(pedido => {
    const fila = document.createElement('tr');
    
    // RF09: Solo Vendedor puede cambiar estado de pedidos
    let accionesHtml = '';
    if (rol === 'Vendedor') {
      accionesHtml = `
        <select class="form-select form-select-sm jugoseo-input" style="width: auto;" onchange="cambiarEstadoPedido(${pedido.id}, this.value)">
          ${ESTADOS_PEDIDO.map(estado => 
            `<option value="${estado}" ${pedido.estado === estado ? 'selected' : ''}>${estado}</option>`
          ).join('')}
        </select>
      `;
    } else if (rol === 'Administrador') {
      // Administrador solo ve el estado, no puede cambiarlo
      accionesHtml = '<span class="text-muted">Solo lectura</span>';
    }

    fila.innerHTML = `
      <td>${pedido.id}</td>
      <td>${pedido.cliente}</td>
      <td><small>${formatearProductosPedido(pedido.productos)}</small></td>
      <td>$${pedido.total.toLocaleString('es-CL')}</td>
      <td>${pedido.fecha}</td>
      <td><span class="badge jugoseo-badge">${pedido.estado}</span></td>
      <td class="text-end">${accionesHtml}</td>`;
    cuerpo.appendChild(fila);
  });
}

function cambiarEstadoPedido(idPedido, nuevoEstado) {
  // RF09: Validar que el estado sea permitido
  if (!ESTADOS_PEDIDO.includes(nuevoEstado)) {
    mostrarToastAdmin('Estado no permitido.', 'error');
    renderizarTablaPedidos();
    return;
  }

  const pedido = pedidosAdmin.find(p => p.id === idPedido);
  if (!pedido) {
    mostrarToastAdmin('Pedido no encontrado.', 'error');
    return;
  }

  pedido.estado = nuevoEstado;
  guardarPedidos(pedidosAdmin);
  mostrarToastAdmin(`Estado del pedido #${idPedido} actualizado a "${nuevoEstado}".`, 'exito');
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
// RF09: Obtener rol del usuario actual
// ---------------------------------------------------------
function obtenerRolUsuario() {
  const sesion = JSON.parse(sessionStorage.getItem('jugoseoUsuario') || 'null');
  return sesion ? sesion.rol : null;
}

// ---------------------------------------------------------
// RF09: Configurar menú según rol
// ---------------------------------------------------------
function configurarMenuPorRol() {
  const rol = obtenerRolUsuario();
  const linkDashboard = document.getElementById('linkDashboard');
  const linkProductos = document.getElementById('linkProductos');
  const linkPedidos = document.getElementById('linkPedidos');
  const linkRadioescuchas = document.getElementById('linkRadioescuchas');
  const linkGestionUsuarios = document.getElementById('linkGestionUsuarios');
  const tituloPanel = document.getElementById('tituloPanel');
  const seccionRadioescuchas = document.getElementById('seccion-radioescuchas');
  const seccionGestionUsuarios = document.getElementById('seccion-gestion-usuarios');
  const btnNuevoRadioescucha = document.getElementById('btnNuevoRadioescucha');
  
  if (rol === 'Vendedor') {
    // Panel exclusivo para Vendedor
    if (tituloPanel) {
      tituloPanel.textContent = 'Panel de Ventas';
    }
    
    // Mostrar solo las opciones del Vendedor
    if (linkDashboard) linkDashboard.classList.remove('d-none');
    if (linkProductos) linkProductos.classList.remove('d-none');
    if (linkPedidos) linkPedidos.classList.remove('d-none');
    
    // Ocultar Radioescuchas y Gestión de usuarios para Vendedor
    if (linkRadioescuchas) linkRadioescuchas.classList.add('d-none');
    if (linkGestionUsuarios) linkGestionUsuarios.classList.add('d-none');
    
    // RF09: Vendedor no puede acceder a sección de radioescuchas ni gestión de usuarios
    if (seccionRadioescuchas) seccionRadioescuchas.classList.add('d-none');
    if (seccionGestionUsuarios) seccionGestionUsuarios.classList.add('d-none');
    if (btnNuevoRadioescucha) btnNuevoRadioescucha.classList.add('d-none');
    
    // Asegurar que el panel principal sea visible
    const panelLayout = document.querySelector('.jugoseo-admin-layout');
    if (panelLayout) panelLayout.classList.remove('d-none');
    
    // Forzar que se muestre el dashboard del Vendedor
    cambiarSeccionAdmin('dashboard');
    
  } else if (rol === 'Administrador') {
    // Panel exclusivo para Administrador
    if (tituloPanel) {
      tituloPanel.textContent = 'Panel Administrativo';
    }
    
    // Mostrar todas las opciones del Administrador
    if (linkDashboard) linkDashboard.classList.remove('d-none');
    if (linkProductos) linkProductos.classList.remove('d-none');
    if (linkPedidos) linkPedidos.classList.remove('d-none');
    if (linkRadioescuchas) linkRadioescuchas.classList.remove('d-none');
    if (linkGestionUsuarios) linkGestionUsuarios.classList.remove('d-none');
    
    // Mostrar sección de radioescuchas y gestión de usuarios
    if (seccionRadioescuchas) seccionRadioescuchas.classList.remove('d-none');
    if (seccionGestionUsuarios) seccionGestionUsuarios.classList.remove('d-none');
    if (btnNuevoRadioescucha) btnNuevoRadioescucha.classList.remove('d-none');
    
    // Asegurar que el panel principal sea visible
    const panelLayout = document.querySelector('.jugoseo-admin-layout');
    if (panelLayout) panelLayout.classList.remove('d-none');
    
    // Forzar que se muestre el dashboard del Administrador
    cambiarSeccionAdmin('dashboard');
  }
}

// ---------------------------------------------------------
// Inicio
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  productosAdmin = obtenerProductos();
  radioescuchasAdmin = JSON.parse(localStorage.getItem(CLAVE_RADIOESCUCHAS_ADMIN)) || [];
  
  // Migración: Agregar campo 'rol' y 'fechaCreacion' a usuarios existentes que no lo tengan
  radioescuchasAdmin = radioescuchasAdmin.map(usuario => {
    if (!usuario.rol) {
      return { ...usuario, rol: 'Cliente' };
    }
    if (!usuario.fechaCreacion) {
      return { ...usuario, fechaCreacion: new Date().toISOString() };
    }
    return usuario;
  });
  guardarRadioescuchasAdmin();
  
  pedidosAdmin = obtenerPedidos();

  // RF09: Configurar menú según rol
  configurarMenuPorRol();

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
