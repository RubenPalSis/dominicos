/* CB Dominicos Zaragoza — interacciones de la home. Sin dependencias. */
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

  $('#theme').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('dom-theme', next); } catch (e) {}
  });

  /* ---- menú móvil ------------------------------------------------------- */
  var burger = $('#burger');
  var menu   = $('#menu');

  function closeMenu() {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
  }

  burger.addEventListener('click', function () {
    var open = menu.classList.toggle('is-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  $$('#menu a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  /* ---- barra de progreso + cabecera fija -------------------------------- */
  var bar = $('#progress');
  var nav = $('#nav');
  var ticking = false;

  function onScroll() {
    var y   = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    nav.classList.toggle('is-stuck', y > 40);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

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

  /* ---- filtro de equipos ------------------------------------------------ */
  var cards = $$('#cards .card');
  $$('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      $$('.chip').forEach(function (c) {
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

  /* ---- lightbox de fotos ------------------------------------------------ */
  var lb    = $('#lb');
  var lbImg = $('#lbImg');

  function openLb(src, alt) {
    lbImg.src = src;
    lbImg.alt = alt || '';
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.hidden = true;
    lbImg.src = '';
    document.body.style.overflow = '';
  }

  cards.concat($$('.shot')).forEach(function (el) {
    el.addEventListener('click', function () {
      var img = el.querySelector('img');
      if (img) openLb(img.currentSrc || img.src, img.alt);
    });
  });
  $('#lbX').addEventListener('click', closeLb);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });

  /* ---- enlace activo según la sección visible --------------------------- */
  var links    = $$('#menu a[href^="#"]');
  var sections = links
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var io3 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { io3.observe(s); });
  }

  /* ---- formulario de contacto ------------------------------------------- */
  /* No hay backend: se valida y se abre el correo del club. */
  var form = $('#form');
  var msg  = $('#formMsg');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var nombre  = (d.get('nombre')  || '').toString().trim();
    var email   = (d.get('email')   || '').toString().trim();
    var mensaje = (d.get('mensaje') || '').toString().trim();

    if (!nombre || !mensaje || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      msg.textContent = 'Revisa el nombre, el email y el mensaje.';
      msg.classList.remove('ok');
      return;
    }

    var asunto = 'Contacto web — ' + d.get('categoria');
    var cuerpo = nombre + ' (' + email + ')\n\n' + mensaje;
    window.location.href = 'mailto:baloncestodominicos@gmail.com'
      + '?subject=' + encodeURIComponent(asunto)
      + '&body='    + encodeURIComponent(cuerpo);

    msg.textContent = 'Abriendo tu gestor de correo…';
    msg.classList.add('ok');
    form.reset();
  });

  /* ---- año del pie ------------------------------------------------------ */
  $('#year').textContent = new Date().getFullYear();
})();
