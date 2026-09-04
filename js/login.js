/* ============================================================
   js/login.js
   RF07 - Login de Usuarios: valida credenciales reales contra
   los radioescuchas registrados en localStorage (registro.js),
   con contraseña de entre 4 y 10 caracteres.
   RNF02 - Mensajes de error en tiempo real, sin recargar.
   ============================================================ */

const CLAVE_SESION = 'jugoseoUsuario';
const CLAVE_RADIOESCUCHAS = 'jugoseoRadioescuchas';

// Cuenta de administrador fija (no hay flujo de registro para admins).
const ADMIN_CREDENCIALES = {
  correo: 'admin@jugoseo.com',
  password: 'admin123',
  nombre: 'Administrador',
};

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
// Busca las credenciales del usuario en los datos guardados
// por registro.js, o en la cuenta fija de Administrador.
// ---------------------------------------------------------
function buscarCuenta(correo, password) {
  const correoLimpio = correo.trim().toLowerCase();

  if (correoLimpio === ADMIN_CREDENCIALES.correo && password === ADMIN_CREDENCIALES.password) {
    return { encontrada: true, rol: 'Administrador', nombre: ADMIN_CREDENCIALES.nombre, correo: correoLimpio };
  }

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
    rol: 'Cliente',
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

  if (!usuario.value.trim()) {
    marcarValidezLogin(usuario, false, 'Ingresa tu correo.');
    formularioValido = false;
  } else {
    marcarValidezLogin(usuario, true);
  }

  const largoPassword = password.value.length;
  if (largoPassword === 0) {
    marcarValidezLogin(password, false, 'Ingresa tu contraseña.');
    formularioValido = false;
  } else if (largoPassword < 4 || largoPassword > 10) {
    marcarValidezLogin(password, false, 'La contraseña debe tener entre 4 y 10 caracteres.');
    formularioValido = false;
  } else {
    marcarValidezLogin(password, true);
  }

  if (!formularioValido) {
    mostrarToastLogin('Revisa los campos marcados en rojo.', 'error');
    return;
  }

  const resultado = buscarCuenta(usuario.value, password.value);

  if (!resultado.encontrada) {
    marcarValidezLogin(usuario, false, ' ');
    marcarValidezLogin(password, false, 'Correo o contraseña incorrectos.');
    mostrarToastLogin('Correo o contraseña incorrectos.', 'error');
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
