/* CB Dominicos Zaragoza — interacciones del sitio. Sin dependencias.
 *
 * Es el script original de la web, adaptado a WordPress: cada bloque
 * comprueba que sus elementos existan, porque ahora el mismo archivo se carga
 * en la portada, en las noticias, en las fichas de equipo y en las páginas.
 */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---- tema claro / oscuro --------------------------------------------- */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('dom-theme');
    if (saved) root.setAttribute('data-theme', saved);
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
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      burger.setAttribute('aria-expanded', String(open));
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
  /* Las categorías las pone WordPress: data-filter en el chip y data-cat en
     la tarjeta llevan el slug del término de primer nivel. */
  var chips = $$('.chip');
  if (chips.length) {
    var cards = $$('.cards .card');

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) {
          c.classList.remove('is-on');
          c.setAttribute('aria-selected', 'false');
        });
        chip.classList.add('is-on');
        chip.setAttribute('aria-selected', 'true');

        var f = chip.dataset.filter;
        cards.forEach(function (card) {
          card.classList.toggle('is-hidden', f !== 'all' && card.dataset.cat !== f);
        });
      });
    });
  }

  /* ---- lightbox de fotos ------------------------------------------------ */
  /* Las tarjetas de equipo ahora enlazan a su ficha, así que el lightbox se
     reserva para las fotos que no llevan enlace. */
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

    $$('.shot').forEach(function (el) {
      if (el.querySelector('a')) return;
      el.style.cursor = 'zoom-in';
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
  /* En WordPress los enlaces del menú pueden ser absolutos (…/#club), así que
     extraemos el ancla solo cuando apunta a esta misma página. */
  function anchorOf(a) {
    var href = a.getAttribute('href') || '';
    if (href.charAt(0) === '#') return href.slice(1);

    var url;
    try { url = new URL(a.href, window.location.href); } catch (e) { return ''; }

    if (url.pathname !== window.location.pathname || !url.hash) return '';
    return url.hash.slice(1);
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

  /* ---- formulario de contacto ------------------------------------------- */
  /* El envío lo procesa el plugin en el servidor. Aquí solo se valida antes
     de salir de la página, para avisar sin recargar. */
  var form = $('#form');
  var msg  = $('#formMsg');

  if (form && form.tagName === 'FORM') {
    form.addEventListener('submit', function (e) {
      var d = new FormData(form);
      var nombre  = (d.get('nombre')  || '').toString().trim();
      var email   = (d.get('email')   || '').toString().trim();
      var mensaje = (d.get('mensaje') || '').toString().trim();

      if (!nombre || !mensaje || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        e.preventDefault();
        if (msg) {
          msg.textContent = 'Revisa el nombre, el email y el mensaje.';
          msg.classList.remove('ok');
        }
        return;
      }

      if (msg) {
        msg.textContent = 'Enviando…';
        msg.classList.remove('ok');
      }
    });
  }

  /* ---- año del pie ------------------------------------------------------ */
  /* Lo escribe PHP; se mantiene por si algún contenido antiguo lo usa. */
  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
