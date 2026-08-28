/* ============================================================
   js/noticias.js
   RF08 - Catálogo de Noticias (arreglo en JS) con
   al menos dos vistas de detalle independientes.
   ============================================================ */

const NOTICIAS = [
  {
    id: 'nueva-senal',
    categoria: 'Radio',
    titulo: 'Jugoseo estrena nueva señal en línea',
    fecha: '24 de agosto, 2026',
    resumen: 'Mejoramos la calidad del stream para que la música suene mejor que nunca, sin cortes.',
    pagina: 'noticia-nueva-senal.html'
  },
  {
    id: 'encuentro-oyentes',
    categoria: 'Evento',
    titulo: 'Encuentro de oyentes este fin de semana',
    fecha: '20 de agosto, 2026',
    resumen: 'Nos juntamos con la comunidad para celebrar un nuevo aniversario al aire.',
    pagina: 'noticia-encuentro-oyentes.html'
  },
  {
    id: 'nuevo-espacio-nocturno',
    categoria: 'Programas',
    titulo: 'Nuevo espacio nocturno de música electrónica',
    fecha: '15 de agosto, 2026',
    resumen: 'A partir de este mes, todas las noches a las 22:00 hrs, nuevo ciclo de sets en vivo.',
    pagina: 'noticia-espacio-nocturno.html'
  },
  {
    id: 'nueva-linea-merch',
    categoria: 'Tienda',
    titulo: 'Llegó nueva línea de merch',
    fecha: '10 de agosto, 2026',
    resumen: 'Poleras, gorros y stickers con el nuevo diseño ya disponibles para todo Chile.',
    pagina: 'noticia-nueva-linea-merch.html'
  },
];

function renderizarNoticias() {
  const grid = document.getElementById('gridNoticias');
  if (!grid) return;

  grid.innerHTML = '';

  NOTICIAS.forEach(noticia => {
    const col = document.createElement('div');
    col.className = 'col-md-6';
    col.innerHTML = `
      <article class="jugoseo-card d-flex flex-column h-100">
        <span class="jugoseo-badge mb-2 d-inline-block">${noticia.categoria}</span>
        <div class="jugoseo-card-titulo">${noticia.titulo}</div>
        <p class="jugoseo-card-texto mt-2 mb-1">${noticia.resumen}</p>
        <small class="jugoseo-card-texto mb-3">${noticia.fecha}</small>
        <a href="${noticia.pagina}" class="btn jugoseo-btn-login mt-auto align-self-start px-3">Leer más</a>
      </article>`;
    grid.appendChild(col);
  });
}

document.addEventListener('DOMContentLoaded', renderizarNoticias);
