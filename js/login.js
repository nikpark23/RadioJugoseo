/* ============================================================
   js/login.js
   RF07 - Login de Usuarios: valida credenciales reales contra
   los radioescuchas registrados en localStorage (registro.js),
   con contraseña de entre 4 y 10 caracteres.
   RNF02 - Mensajes de error en tiempo real, sin recargar.
   ============================================================ */

const CLAVE_SESION = 'jugoseoUsuario';
const CLAVE_RADIOESCUCHAS = 'jugoseoRadioescuchas';

// Dominios autorizados según RF07
const DOMINIOS_AUTORIZADOS = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];

// Usuarios de demostración según RF07 y RF05 (tipos de usuario)
const USUARIOS_DEMOSTRACION = [
  {
    correo: 'cliente@duoc.cl',
    password: 'client123',
    nombre: 'Juan',
    apellido: 'Pérez',
    rol: 'Cliente',
    tipo: 'Socio VIP'
  },
  {
    correo: 'vendedor@profesor.duoc.cl',
    password: 'vendedor1',
    nombre: 'María',
    apellido: 'García',
    rol: 'Vendedor',
    tipo: null
  },
  {
    correo: 'admin@jugoseo.com',
    password: 'admin123',
    nombre: 'Administrador',
    apellido: 'Sistema',
    rol: 'Administrador',
    tipo: null
  }
];

function marcarValidezLogin(elemento, esValido, mensajeError) {
  const feedback = elemento.parentElement.querySelector('.invalid-feedback');
  if (esValido) {
    elemento.classList.remove('is-invalid');
    elemento.classList.add('is-valid');
  } else {
    elemento.classList.remove('is-valid');
    elemento.classList.add('is-invalid');
    if (feedback && mensajeError) feedback.textContent = mensajeError;
  }
}

// Validación de formato de correo con regex según RF07
function validarFormatoCorreo(correo) {
  const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexCorreo.test(correo);
}

// Validación de dominios autorizados según RF07
// Excepción: admin@jugoseo.com es permitido para el administrador
function validarDominioAutorizado(correo) {
  const correoLower = correo.toLowerCase();
  // Permitir admin@jugoseo.com como excepción
  if (correoLower === 'admin@jugoseo.com') {
    return true;
  }
  return DOMINIOS_AUTORIZADOS.some(dominio => correoLower.endsWith(dominio));
}

function mostrarToastLogin(mensaje, tipo = 'exito') {
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
  const toastBootstrap = new bootstrap.Toast(toastEl, { delay: 2500 });
  toastBootstrap.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// ---------------------------------------------------------
// Busca las credenciales del usuario en los usuarios de demostración
// o en los datos guardados por registro.js.
// ---------------------------------------------------------
function buscarCuenta(correo, password) {
  const correoLimpio = correo.trim().toLowerCase();

  // Primero buscar en usuarios de demostración
  const usuarioDemo = USUARIOS_DEMOSTRACION.find(
    u => u.correo.toLowerCase() === correoLimpio && u.password === password
  );

  if (usuarioDemo) {
    return {
      encontrada: true,
      rol: usuarioDemo.rol,
      nombre: `${usuarioDemo.nombre} ${usuarioDemo.apellido}`.trim(),
      correo: correoLimpio,
      tipo: usuarioDemo.tipo || null,
    };
  }

  // Si no encuentra en demo, buscar en radioescuchas registrados
  const radioescuchas = JSON.parse(localStorage.getItem(CLAVE_RADIOESCUCHAS)) || [];
  const cuenta = radioescuchas.find(r => (r.correo || '').toLowerCase() === correoLimpio);

  if (!cuenta) {
    return { encontrada: false, motivo: 'noExiste' };
  }
  if (cuenta.password !== password) {
    return { encontrada: false, motivo: 'passwordIncorrecta' };
  }

  return {
    encontrada: true,
    rol: cuenta.rol || 'Cliente',
    nombre: `${cuenta.nombre} ${cuenta.apellido}`.trim(),
    correo: correoLimpio,
    tipo: cuenta.tipo,
  };
}

function manejarLogin(evento) {
  evento.preventDefault();

  const usuario = document.getElementById('loginUsuario');
  const password = document.getElementById('loginPassword');

  let formularioValido = true;
  const correoTrim = usuario.value.trim();

  // Validación de correo electrónico según RF07
  if (!correoTrim) {
    marcarValidezLogin(usuario, false, 'Ingrese su correo electrónico');
    formularioValido = false;
  } else if (correoTrim.length > 100) {
    marcarValidezLogin(usuario, false, 'El correo no puede superar 100 caracteres');
    formularioValido = false;
  } else if (!validarFormatoCorreo(correoTrim)) {
    marcarValidezLogin(usuario, false, 'El correo debe tener un formato válido (ejemplo@dominio.com)');
    formularioValido = false;
  } else if (!validarDominioAutorizado(correoTrim)) {
    marcarValidezLogin(usuario, false, 'El dominio debe ser @duoc.cl, @profesor.duoc.cl o @gmail.com');
    formularioValido = false;
  } else {
    marcarValidezLogin(usuario, true);
  }

  // Validación de contraseña según RF07
  const largoPassword = password.value.length;
  if (largoPassword === 0) {
    marcarValidezLogin(password, false, 'Ingrese su contraseña');
    formularioValido = false;
  } else if (largoPassword < 4 || largoPassword > 10) {
    marcarValidezLogin(password, false, 'La contraseña debe tener entre 4 y 10 caracteres');
    formularioValido = false;
  } else {
    marcarValidezLogin(password, true);
  }

  if (!formularioValido) {
    mostrarToastLogin('Revisa los campos marcados en rojo', 'error');
    return;
  }

  const resultado = buscarCuenta(usuario.value, password.value);

  if (!resultado.encontrada) {
    marcarValidezLogin(usuario, false, ' ');
    marcarValidezLogin(password, false, 'Correo o contraseña incorrectos');
    mostrarToastLogin('Correo o contraseña incorrectos', 'error');
    return;
  }

  // Sin backend: se guarda la sesión localmente para simular el acceso.
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify({
    usuario: resultado.nombre,
    correo: resultado.correo,
    rol: resultado.rol,
    tipo: resultado.tipo || null,
  }));

  mostrarToastLogin(`¡Bienvenido de vuelta, ${resultado.nombre}!`, 'exito');
  setTimeout(() => {
    window.location.href = 'app.html';
  }, 500);
}

document.addEventListener('DOMContentLoaded', () => {
  const formLogin = document.getElementById('formLogin');
  if (formLogin) {
    formLogin.addEventListener('submit', manejarLogin);
  }
});
