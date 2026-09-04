/* ============================================================
   js/programas.js
   RF08 - Catálogo de Programas (arreglo en JS) con
   al menos dos vistas de detalle independientes.
   ============================================================ */

const PROGRAMAS = [
  {
    id: 'dando-jugo',
    nombre: 'Dando Jugo',
    conductor: 'DJ Manu',
    horario: 'Lunes a viernes, 20:00 a 22:00 hrs',
    descripcion: 'Programa liderado por DJ Manu de lunes a viernes. Aquí podrás encontrar sets de este dj, mezclas de música en vivo, animación y saludos al aire.',
    pagina: 'programa-dando-jugo.html',
    imagen: 'img/DandoJugo.png'
  },
  {
    id: 'krrete-radial',
    nombre: 'Krrete Radial',
    conductor: 'NikoOnfire',
    horario: 'Lunes a viernes, 17:00 a 19:00 hrs',
    descripcion: 'Programa radial liderado por NikoOnfire de lunes a viernes. Encontrarás premios, concursos, animación y espacio para mandar tus saludos.',
    pagina: 'programa-krrete-radial.html',
    imagen: 'img/carreteRadial.png'
  },
  {
    id: 'prendiendo-la-noche',
    nombre: 'Prendiendo La Noche',
    conductor: 'Dj ivan',
    horario: 'Todos los días, 22:00 a 01:00 hrs',
    descripcion: 'El cierre nocturno de Jugoseo: música electrónica y de fiesta sin cortes para acompañar tu noche, con mezclas continuas hasta la madrugada.',
    pagina: 'programa-jugoso-discotec.html',
    imagen: 'img/PrendiendoLaNoche.png'
  },
  {
    id: 'Tocando-bits',
    nombre: 'Tocando Bits',
    conductor: 'Dj Mikys',
    horario: 'Sábado y domingo, 00:00 a 5:00 hrs',
    descripcion: 'Un espacio más relajado para el fin de semana, con lo mejor de la música de la semana, entrevistas y recomendaciones de la comunidad.',
    pagina: 'programa-fin-de-semana.html',
    imagen: 'img/TocandoBits.png'
  },
];

function renderizarProgramas() {
  const grid = document.getElementById('gridProgramas');
  if (!grid) return;

  grid.innerHTML = '';

  PROGRAMAS.forEach(programa => {
    const col = document.createElement('div');
    col.className = 'col-sm-6 col-lg-3';
    col.innerHTML = `
      <div class="jugoseo-card d-flex flex-column h-100">
        <img src="${programa.imagen}" alt="${programa.nombre}" class="jugoseo-card-img" loading="lazy">
        <div class="jugoseo-card-titulo mb-1">${programa.nombre}</div>
        <p class="jugoseo-card-texto mb-3">${programa.descripcion}</p>
        <a href="${programa.pagina}" class="btn jugoseo-btn-login mt-auto">Ir al Programa</a>
      </div>`;
    grid.appendChild(col);
  });
}

document.addEventListener('DOMContentLoaded', renderizarProgramas);
