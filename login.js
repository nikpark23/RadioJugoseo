/* ============================================================
   js/login.js
   RF07 - Login de Usuarios: valida credenciales con
   contraseña de entre 4 y 10 caracteres.
   RNF02 - Mensajes de error en tiempo real, sin recargar.
   ============================================================ */

const CLAVE_SESION = 'jugoseoUsuario';

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

function manejarLogin(evento) {
  evento.preventDefault();

  const usuario = document.getElementById('loginUsuario');
  const password = document.getElementById('loginPassword');
  const rol = document.getElementById('loginRol');

  let formularioValido = true;

  if (!usuario.value.trim()) {
    marcarValidezLogin(usuario, false, 'Ingresa tu usuario o correo.');
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

  // Sin backend: se guarda la sesión localmente para simular el acceso.
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify({
    usuario: usuario.value.trim(),
    rol: rol ? rol.value : 'Cliente',
  }));

  mostrarToastLogin('¡Bienvenido de vuelta!', 'exito');
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
