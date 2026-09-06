/* ============================================================
   js/contacto.js
   RF04 - Formulario de Contacto:
     - El mensaje no debe superar 500 caracteres.
     - El correo debe pertenecer a un dominio autorizado.
   RNF02 - Mensajes de error/sugerencias en tiempo real.
   ============================================================ */

const MAX_CARACTERES_MENSAJE = 500;
const MAX_CARACTERES_NOMBRE = 100;
const MAX_CARACTERES_CORREO = 100;
const DOMINIOS_AUTORIZADOS = ['duoc.cl', 'profesor.duoc.cl', 'gmail.com'];

function marcarValidezContacto(elemento, esValido, mensajeError) {
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

function obtenerDominio(correo) {
  const partes = correo.split('@');
  return partes.length === 2 ? partes[1].toLowerCase() : '';
}

function validarNombreContacto(elemento) {
  const valor = elemento.value.trim();

  if (!valor) {
    marcarValidezContacto(elemento, false, 'Ingrese su nombre');
    return false;
  }
  if (valor.length > MAX_CARACTERES_NOMBRE) {
    marcarValidezContacto(elemento, false, `El nombre no puede superar ${MAX_CARACTERES_NOMBRE} caracteres`);
    return false;
  }

  marcarValidezContacto(elemento, true);
  return true;
}

function validarCorreoContacto(elemento) {
  const valor = elemento.value.trim();

  if (!valor) {
    marcarValidezContacto(elemento, false, 'Ingrese un correo electrónico');
    return false;
  }
  if (valor.length > MAX_CARACTERES_CORREO) {
    marcarValidezContacto(elemento, false, `El correo no puede superar ${MAX_CARACTERES_CORREO} caracteres`);
    return false;
  }
  if (!elemento.checkValidity()) {
    marcarValidezContacto(elemento, false, 'El correo no tiene un formato válido');
    return false;
  }

  const dominio = obtenerDominio(valor);
  if (!DOMINIOS_AUTORIZADOS.includes(dominio)) {
    marcarValidezContacto(elemento, false, `Solo se permiten correos @duoc.cl, @profesor.duoc.cl o @gmail.com`);
    return false;
  }

  marcarValidezContacto(elemento, true);
  return true;
}

function validarMensajeContacto(elemento) {
  const valor = elemento.value.trim();

  if (!valor) {
    marcarValidezContacto(elemento, false, 'Ingrese un mensaje');
    return false;
  }
  if (valor.length > MAX_CARACTERES_MENSAJE) {
    marcarValidezContacto(elemento, false, `El mensaje no puede superar ${MAX_CARACTERES_MENSAJE} caracteres`);
    return false;
  }

  marcarValidezContacto(elemento, true);
  return true;
}

// RNF02: contador de caracteres en tiempo real
function actualizarContadorMensaje() {
  const mensaje = document.getElementById('contactoMensaje');
  const contador = document.getElementById('contadorMensaje');
  const restantes = MAX_CARACTERES_MENSAJE - mensaje.value.length;

  contador.textContent = `${mensaje.value.length} / ${MAX_CARACTERES_MENSAJE} caracteres`;
  contador.classList.toggle('jugoseo-contador-excedido', restantes < 0);
}

function mostrarToastContacto(mensaje, tipo = 'exito') {
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
  const toastBootstrap = new bootstrap.Toast(toastEl, { delay: 3000 });
  toastBootstrap.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

function manejarEnvioContacto(evento) {
  evento.preventDefault();

  const nombre = document.getElementById('contactoNombre');
  const correo = document.getElementById('contactoCorreo');
  const mensaje = document.getElementById('contactoMensaje');

  const nombreValido = validarNombreContacto(nombre);
  const correoValido = validarCorreoContacto(correo);
  const mensajeValido = validarMensajeContacto(mensaje);

  if (!nombreValido || !correoValido || !mensajeValido) {
    mostrarToastContacto('Revisa los campos marcados en rojo antes de enviar.', 'error');
    return;
  }

  mostrarToastContacto(`¡Gracias, ${nombre.value.trim()}! Tu mensaje fue enviado.`, 'exito');

  document.getElementById('formContacto').reset();
  actualizarContadorMensaje();
  [nombre, correo, mensaje].forEach(el => el.classList.remove('is-valid', 'is-invalid'));
}

document.addEventListener('DOMContentLoaded', () => {
  const nombre = document.getElementById('contactoNombre');
  const correo = document.getElementById('contactoCorreo');
  const mensaje = document.getElementById('contactoMensaje');

  document.getElementById('formContacto').addEventListener('submit', manejarEnvioContacto);

  correo.addEventListener('blur', () => validarCorreoContacto(correo));
  mensaje.addEventListener('input', () => {
    actualizarContadorMensaje();
    if (mensaje.classList.contains('is-invalid') || mensaje.classList.contains('is-valid')) {
      validarMensajeContacto(mensaje);
    }
  });
  nombre.addEventListener('blur', () => validarNombreContacto(nombre));

  actualizarContadorMensaje();
});
