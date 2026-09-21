/* CB Dominicos Zaragoza — interacciones del sitio. Sin dependencias.
 *
 * Es el script original de la portada. Ahora el mismo archivo se carga
 * también en el listado de noticias y en la ficha de cada noticia, así que
 * cada bloque comprueba antes que sus elementos existan en la página.
 */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- tema claro / oscuro --------------------------------------------- */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('dom-theme');
    if (saved === 'light' || saved === 'dark') root.setAttribute('data-theme', saved);
  } catch (e) { /* modo privado o cookies bloqueadas */ }

  var themeBtn = $('#theme');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('dom-theme', next); } catch (e) {}
    });
  }

  /* ---- menú móvil ------------------------------------------------------- */
  var burger = $('#burger');
  var menu   = $('#menu');

  function closeMenu() {
    if (!menu || !burger) return;
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    if (nav) nav.classList.remove('menu-abierto');
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
      /* Con el panel abierto el fondo ya es sólido, así que la cabecera deja
         de necesitar los colores claros que usa sobre la foto. */
      if (nav) nav.classList.toggle('menu-abierto', open);
    });
    $$('#menu a').forEach(function (a) { a.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  }

  /* ---- barra de progreso + cabecera fija -------------------------------- */
  var bar = $('#progress');
  var nav = $('#nav');
  var ticking = false;

  function onScroll() {
    var y   = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    if (nav) nav.classList.toggle('is-stuck', y > 40);
    ticking = false;
  }

  if (bar || nav) {
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();
  }

  /* ---- aparición al hacer scroll ---------------------------------------- */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en, i) {
        if (!en.isIntersecting) return;
        setTimeout(function () { en.target.classList.add('is-in'); }, i * 70);
        io.unobserve(en.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---- contadores ------------------------------------------------------- */
  function countUp(el) {
    var to     = parseInt(el.dataset.to, 10) || 0;
    var plain  = el.dataset.plain === '1';       // años: sin separador de miles
    var suffix = el.dataset.suffix || '';
    var start  = null;
    var dur    = 1400;

    function fmt(n) { return plain ? String(n) : n.toLocaleString('es-ES'); }

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);           // ease-out cúbica
      el.textContent = fmt(Math.round(to * e)) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var nums = $$('.num');
  if (nums.length) {
    if ('IntersectionObserver' in window) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          countUp(en.target);
          io2.unobserve(en.target);
        });
      }, { threshold: 0.6 });
      nums.forEach(function (el) { io2.observe(el); });
    } else {
      nums.forEach(countUp);
    }
  }

  /* ---- filtro de equipos ------------------------------------------------ */
  var cards = $$('#cards .card');
  var chips = $$('.chip');

  if (chips.length && cards.length) {
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          c.classList.remove('is-on');
          c.setAttribute('aria-pressed', 'false');
        });
        chip.classList.add('is-on');
        chip.setAttribute('aria-pressed', 'true');

        var f = chip.dataset.filter;
        cards.forEach(function (card) {
          card.classList.toggle('is-hidden', f !== 'all' && card.dataset.cat !== f);
        });
      });
    });
  }

  /* ---- lightbox de fotos ------------------------------------------------ */
  var lb    = $('#lb');
  var lbImg = $('#lbImg');
  var lbX   = $('#lbX');

  if (lb && lbImg) {
    var openLb = function (src, alt) {
      lbImg.src = src;
      lbImg.alt = alt || '';
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lbX) lbX.focus();
    };
    var closeLb = function () {
      lb.hidden = true;
      lbImg.src = '';
      document.body.style.overflow = '';
    };

    cards.concat($$('.shot')).forEach(function (el) {
      el.addEventListener('click', function () {
        var img = el.querySelector('img');
        if (img) openLb(img.currentSrc || img.src, img.alt);
      });
    });

    if (lbX) lbX.addEventListener('click', closeLb);
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lb.hidden) closeLb();
    });
  }

  /* ---- enlace activo según la sección visible --------------------------- */
  /* Solo cuentan los enlaces del menú que apuntan a una sección de ESTA
     página: en las páginas interiores el menú lleva a index.html#loquesea. */
  function anchorOf(a) {
    var href = a.getAttribute('href') || '';
    return href.charAt(0) === '#' ? href.slice(1) : '';
  }

  var links = $$('#menu a').filter(function (a) { return anchorOf(a) !== ''; });
  var sections = links
    .map(function (a) { return document.getElementById(anchorOf(a)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var io3 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', anchorOf(a) === en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io3.observe(s); });
  }

  /* ---- formulario de contacto (Formspree) -------------------------------
     El formulario funciona sin JavaScript: es un POST normal a Formspree, que
     responde con su propia página de gracias. Con JavaScript lo enviamos por
     fetch para poder contestar aquí mismo, sin salir de la página. */
  var form = $('#form');
  var msg  = $('#formMsg');

  function decir(texto, ok) {
    if (!msg) return;
    msg.textContent = texto;
    msg.classList.toggle('ok', !!ok);
  }

  if (form && form.tagName === 'FORM') {
    form.addEventListener('submit', function (e) {
      var accion = form.getAttribute('action') || '';

      /* Mientras no se haya puesto el endpoint real, avisamos en vez de
         mandar el mensaje a ninguna parte. */
      if (accion.indexOf('TU_ID_DE_FORMSPREE') !== -1) {
        e.preventDefault();
        decir('El formulario aún no está conectado. Escríbenos a baloncestodominicos@gmail.com.', false);
        return;
      }

      var d = new FormData(form);
      var nombre  = (d.get('nombre')  || '').toString().trim();
      var email   = (d.get('email')   || '').toString().trim();
      var mensaje = (d.get('mensaje') || '').toString().trim();

      if (!nombre || !mensaje || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        e.preventDefault();
        decir('Revisa el nombre, el email y el mensaje.', false);
        return;
      }

      /* Sin fetch, dejamos que el navegador envíe el formulario a Formspree. */
      if (!window.fetch) {
        decir('Enviando…', false);
        return;
      }

      e.preventDefault();

      var boton = form.querySelector('button[type="submit"]');
      if (boton) boton.disabled = true;
      decir('Enviando…', false);

      fetch(accion, {
        method: 'POST',
        body: d,
        headers: { Accept: 'application/json' }
      })
        .then(function (r) {
          if (r.ok) {
            form.reset();
            decir('Mensaje enviado. Te contestamos en cuanto podamos.', true);
          } else {
            decir('No hemos podido enviar el mensaje. Escríbenos a baloncestodominicos@gmail.com.', false);
          }
        })
        .catch(function () {
          decir('No hemos podido enviar el mensaje. Escríbenos a baloncestodominicos@gmail.com.', false);
        })
        .then(function () {
          if (boton) boton.disabled = false;
        });
    });
  }

  /* ---- año del pie ------------------------------------------------------ */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
