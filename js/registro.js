/* ============================================================
   js/registro.js
   RF05 - Validaciones de Registro (RUN + campos obligatorios)
   RF06 - Filtro dinámico de Comunas según la Región
   RNF02 - Mensajes de error en tiempo real, sin recargar
   RNF05 - Persistencia de los registros en localStorage
   ============================================================ */

const CLAVE_RADIOESCUCHAS = 'jugoseoRadioescuchas';

// ---------------------------------------------------------
// RF05: Tipos de usuario implementados
// Nota: El sistema utiliza "Socio VIP" y "Radioescucha Oficial" 
// como tipos de usuario, consistentes entre registro y admin
// ---------------------------------------------------------

// ---------------------------------------------------------
// RF06: Datos de Región -> Comunas (subset representativo)
// ---------------------------------------------------------
const REGIONES_COMUNAS = {
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

// ---------------------------------------------------------
// RF06: Poblar el select de Región y reaccionar a cambios
// ---------------------------------------------------------
function poblarRegiones() {
  const selectRegion = document.getElementById('regRegion');
  Object.keys(REGIONES_COMUNAS).forEach(region => {
    const opcion = document.createElement('option');
    opcion.value = region;
    opcion.textContent = region;
    selectRegion.appendChild(opcion);
  });
}

function actualizarComunas() {
  const region = document.getElementById('regRegion').value;
  const selectComuna = document.getElementById('regComuna');

  selectComuna.innerHTML = '<option value="" selected disabled>Selecciona una comuna</option>';

  if (region && REGIONES_COMUNAS[region]) {
    if (REGIONES_COMUNAS[region].length === 0) {
      selectComuna.disabled = true;
      marcarValidez(selectComuna, false, 'No hay comunas disponibles para esta región.');
      return;
    }
    selectComuna.disabled = false;
    REGIONES_COMUNAS[region].forEach(comuna => {
      const opcion = document.createElement('option');
      opcion.value = comuna;
      opcion.textContent = comuna;
      selectComuna.appendChild(opcion);
    });
  } else {
    selectComuna.disabled = true;
  }

  marcarValidez(selectComuna, false); // limpia estado visual al cambiar de región
}

// ---------------------------------------------------------
// RF05: Validación de RUN (estructura + dígito verificador)
// ---------------------------------------------------------
function validarRun(runIngresado) {
  // La estructura exigida es 7 a 9 caracteres, sin puntos ni guion.
  if (/[.\-]/.test(runIngresado)) {
    return { valido: false, mensaje: 'El RUN no debe llevar puntos ni guion (ej: 12345678K).' };
  }
  if (runIngresado.length < 7 || runIngresado.length > 9) {
    return { valido: false, mensaje: 'El RUN debe tener entre 7 y 9 caracteres.' };
  }
  if (!/^[0-9]+[0-9kK]$/.test(runIngresado)) {
    return { valido: false, mensaje: 'El RUN solo puede contener números y, al final, un dígito verificador (0-9 o K).' };
  }

  const cuerpo = runIngresado.slice(0, -1);
  const dv = runIngresado.slice(-1).toUpperCase();

  let suma = 0;
  let multiplo = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplo;
    multiplo = multiplo === 7 ? 2 : multiplo + 1;
  }
  const resto = 11 - (suma % 11);
  const dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);

  if (dv !== dvEsperado) {
    return { valido: false, mensaje: 'El RUN ingresado no es válido (dígito verificador incorrecto).' };
  }

  return { valido: true, mensaje: '' };
}

// ---------------------------------------------------------
// RF: Validación de dominios de correo autorizados
// ---------------------------------------------------------
function validarDominioCorreo(correo) {
  const dominiosAutorizados = ['@duoc.cl', '@profesor.duoc.cl', '@gmail.com'];
  const dominio = correo.substring(correo.lastIndexOf('@'));
  return dominiosAutorizados.includes(dominio);
}

// ---------------------------------------------------------
// RF: Validación de contraseña (4 a 10 caracteres)
// ---------------------------------------------------------
function validarPassword(elementoPassword, elementoConfirmar) {
  const password = elementoPassword.value;
  const confirmar = elementoConfirmar.value;

  if (!password) {
    marcarValidez(elementoPassword, false, 'La contraseña es obligatoria.');
    return false;
  }
  if (password.length < 4 || password.length > 10) {
    marcarValidez(elementoPassword, false, 'La contraseña debe tener entre 4 y 10 caracteres.');
    return false;
  }
  marcarValidez(elementoPassword, true);

  if (!confirmar) {
    marcarValidez(elementoConfirmar, false, 'Confirma tu contraseña.');
    return false;
  }
  if (confirmar !== password) {
    marcarValidez(elementoConfirmar, false, 'Las contraseñas no coinciden.');
    return false;
  }
  marcarValidez(elementoConfirmar, true);
  return true;
}

// ---------------------------------------------------------
// RNF02: Marcar un campo como válido/ inválido en tiempo real
// ---------------------------------------------------------
function marcarValidez(elemento, esValido, mensajeError) {
  const feedback = elemento.parentElement.querySelector('.invalid-feedback');
  if (esValido) {
    elemento.classList.remove('is-invalid');
    elemento.classList.add('is-valid');
  } else {
    elemento.classList.remove('is-valid');
    if (mensajeError !== undefined) {
      elemento.classList.add('is-invalid');
      if (feedback) feedback.textContent = mensajeError;
    } else {
      elemento.classList.remove('is-invalid');
    }
  }
}

function validarCampoObligatorio(elemento, nombreCampo, longitudMaxima = null) {
  const valor = elemento.value.trim();
  if (!valor) {
    marcarValidez(elemento, false, `${nombreCampo} es obligatorio.`);
    return false;
  }
  if (longitudMaxima && valor.length > longitudMaxima) {
    marcarValidez(elemento, false, `${nombreCampo} no puede superar ${longitudMaxima} caracteres.`);
    return false;
  }
  marcarValidez(elemento, true);
  return true;
}

// ---------------------------------------------------------
// Guardar el registro (sin backend, en localStorage)
// ---------------------------------------------------------
function guardarRadioescucha(datos) {
  try {
    const listaActual = JSON.parse(localStorage.getItem(CLAVE_RADIOESCUCHAS)) || [];
    listaActual.push(datos);
    localStorage.setItem(CLAVE_RADIOESCUCHAS, JSON.stringify(listaActual));
    return true;
  } catch (error) {
    console.error('Error al acceder a localStorage:', error);
    return false;
  }
}

// ---------------------------------------------------------
// Envío del formulario
// ---------------------------------------------------------
function manejarEnvioRegistro(evento) {
  evento.preventDefault();

  const nombre = document.getElementById('regNombre');
  const apellido = document.getElementById('regApellido');
  const correo = document.getElementById('regCorreo');
  const run = document.getElementById('regRun');
  const region = document.getElementById('regRegion');
  const comuna = document.getElementById('regComuna');
  const password = document.getElementById('regPassword');
  const passwordConfirm = document.getElementById('regPasswordConfirm');
  const fechaNacimiento = document.getElementById('regFechaNacimiento');
  const direccion = document.getElementById('regDireccion');
  const tipoSocio = document.querySelector('input[name="tipoSocio"]:checked');
  const mensajeTipoSocio = document.getElementById('errorTipoSocio');

  let formularioValido = true;

  formularioValido = validarCampoObligatorio(nombre, 'El nombre', 50) && formularioValido;
  formularioValido = validarCampoObligatorio(apellido, 'El apellido', 100) && formularioValido;

  if (!validarCampoObligatorio(correo, 'El correo', 100)) {
    formularioValido = false;
  } else if (!correo.checkValidity()) {
    marcarValidez(correo, false, 'Ingresa un correo con formato válido.');
    formularioValido = false;
  } else if (!validarDominioCorreo(correo.value.trim().toLowerCase())) {
    marcarValidez(correo, false, 'El correo debe pertenecer a @duoc.cl, @profesor.duoc.cl o @gmail.com.');
    formularioValido = false;
  }

  const runLimpio = run.value.trim().toUpperCase();
  if (!runLimpio) {
    marcarValidez(run, false, 'El RUN es obligatorio.');
    formularioValido = false;
  } else {
    const resultadoRun = validarRun(runLimpio);
    marcarValidez(run, resultadoRun.valido, resultadoRun.mensaje);
    if (!resultadoRun.valido) formularioValido = false;
  }

  formularioValido = validarCampoObligatorio(region, 'La región') && formularioValido;
  formularioValido = validarCampoObligatorio(comuna, 'La comuna') && formularioValido;

  formularioValido = validarPassword(password, passwordConfirm) && formularioValido;

  // Validación de fecha de nacimiento (opcional pero válida si se ingresa)
  if (fechaNacimiento.value && !fechaNacimiento.checkValidity()) {
    marcarValidez(fechaNacimiento, false, 'Ingresa una fecha válida.');
    formularioValido = false;
  } else if (fechaNacimiento.value) {
    marcarValidez(fechaNacimiento, true);
  }

  // Validación de dirección (opcional pero con longitud máxima)
  if (direccion.value && direccion.value.trim().length > 300) {
    marcarValidez(direccion, false, 'La dirección no puede superar 300 caracteres.');
    formularioValido = false;
  } else if (direccion.value) {
    marcarValidez(direccion, true);
  }

  if (!tipoSocio) {
    mensajeTipoSocio.classList.remove('d-none');
    formularioValido = false;
  } else {
    mensajeTipoSocio.classList.add('d-none');
  }

  if (!formularioValido) {
    mostrarToastRegistro('Revisa los campos marcados en rojo antes de continuar.', 'error');
    return;
  }

  const correoLimpio = correo.value.trim().toLowerCase();
  const listaActual = JSON.parse(localStorage.getItem(CLAVE_RADIOESCUCHAS)) || [];
  const correoYaExiste = listaActual.some(r => (r.correo || '').toLowerCase() === correoLimpio);
  const runYaExiste = listaActual.some(r => (r.run || '').toUpperCase() === runLimpio);

  if (correoYaExiste) {
    marcarValidez(correo, false, 'Ya existe una cuenta registrada con este correo.');
    mostrarToastRegistro('Ese correo ya está registrado. Intenta iniciar sesión.', 'error');
    return;
  }

  if (runYaExiste) {
    marcarValidez(run, false, 'Ya existe una cuenta registrada con este RUN.');
    mostrarToastRegistro('Este RUN ya está registrado. Intenta iniciar sesión.', 'error');
    return;
  }

  const guardadoExitoso = guardarRadioescucha({
    nombre: nombre.value.trim(),
    apellido: apellido.value.trim(),
    correo: correoLimpio,
    run: runLimpio,
    region: region.value,
    comuna: comuna.value,
    tipo: tipoSocio.value,
    password: password.value,
    fechaNacimiento: fechaNacimiento.value || null,
    direccion: direccion.value.trim() || null,
  });

  if (!guardadoExitoso) {
    mostrarToastRegistro('No es posible guardar el registro localmente. Verifica que tu navegador permita el almacenamiento local.', 'error');
    return;
  }

  mostrarToastRegistro(`¡Listo, ${nombre.value.trim()}! Tu registro como ${tipoSocio.value} fue guardado.`, 'exito');
  document.getElementById('formRegistro').reset();
  document.getElementById('regComuna').disabled = true;
  document.querySelectorAll('#formRegistro .is-valid, #formRegistro .is-invalid')
    .forEach(el => el.classList.remove('is-valid', 'is-invalid'));
}

// ---------------------------------------------------------
// RNF02: Toast reutilizable (misma idea que en la tienda)
// ---------------------------------------------------------
function mostrarToastRegistro(mensaje, tipo = 'exito') {
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
  const toastBootstrap = new bootstrap.Toast(toastEl, { delay: 3200 });
  toastBootstrap.show();
  toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

// ---------------------------------------------------------
// Inicio
// ---------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  poblarRegiones();

  document.getElementById('regRegion').addEventListener('change', actualizarComunas);
  document.getElementById('formRegistro').addEventListener('submit', manejarEnvioRegistro);

  // Validación en tiempo real mientras se escribe (RNF02)
  document.getElementById('regNombre').addEventListener('blur', function () {
    validarCampoObligatorio(this, 'El nombre', 50);
  });
  document.getElementById('regApellido').addEventListener('blur', function () {
    validarCampoObligatorio(this, 'El apellido', 100);
  });
  document.getElementById('regCorreo').addEventListener('blur', function () {
    if (!validarCampoObligatorio(this, 'El correo', 100)) return;
    if (!this.checkValidity()) {
      marcarValidez(this, false, 'Ingresa un correo con formato válido.');
      return;
    }
    if (!validarDominioCorreo(this.value.trim().toLowerCase())) {
      marcarValidez(this, false, 'El correo debe pertenecer a @duoc.cl, @profesor.duoc.cl o @gmail.com.');
      return;
    }
    marcarValidez(this, true);
  });
  document.getElementById('regRun').addEventListener('blur', function () {
    const valor = this.value.trim().toUpperCase();
    if (!valor) {
      marcarValidez(this, false, 'El RUN es obligatorio.');
      return;
    }
    const resultado = validarRun(valor);
    marcarValidez(this, resultado.valido, resultado.mensaje);
  });

  const campoPassword = document.getElementById('regPassword');
  const campoPasswordConfirm = document.getElementById('regPasswordConfirm');
  campoPassword.addEventListener('blur', function () {
    validarPassword(campoPassword, campoPasswordConfirm);
  });
  campoPasswordConfirm.addEventListener('blur', function () {
    validarPassword(campoPassword, campoPasswordConfirm);
  });
});
