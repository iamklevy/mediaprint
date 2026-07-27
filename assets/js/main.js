/* ==========================================================================
   Media Print Pack — site behaviour
   ========================================================================== */
(function () {
  'use strict';

  var STORE = 'mp-lang';
  var doc = document.documentElement;

  /* ---------------------------------------------------------------- i18n */
  /* English is the source language: it ships in the HTML, and Arabic is
     applied over it from window.AR. Switching back restores this snapshot. */
  var cacheSrc = new WeakMap();   // element -> { text, attrs:{} }
  var srcTitle = '';
  var srcDesc = '';

  function descMeta() {
    return document.querySelector('meta[name="description"]');
  }

  function keysOf(el) {
    return (el.getAttribute('data-i18n') || '').trim().split(/\s+/).filter(Boolean);
  }

  function snapshot() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var store = { text: null, attrs: {} };
      keysOf(el).forEach(function (key) {
        var at = key.indexOf('@');
        if (at === -1) store.text = el.innerHTML;
        else store.attrs[key.slice(at + 1)] = el.getAttribute(key.slice(at + 1));
      });
      cacheSrc.set(el, store);
    });

    srcTitle = document.title;
    var m = descMeta();
    srcDesc = m ? m.getAttribute('content') : '';
  }

  function applyLang(lang) {
    var ar = lang === 'ar';
    var dict = window.AR || {};

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var saved = cacheSrc.get(el) || { text: null, attrs: {} };
      keysOf(el).forEach(function (key) {
        var at = key.indexOf('@');
        if (at === -1) {
          var val = ar ? dict[key] : saved.text;
          if (val != null) el.innerHTML = val;
        } else {
          var attr = key.slice(at + 1);
          var aval = ar ? dict[key] : saved.attrs[attr];
          if (aval != null) el.setAttribute(attr, aval);
        }
      });
    });

    doc.lang = ar ? 'ar' : 'en';
    doc.dir = ar ? 'rtl' : 'ltr';

    var body = document.body;
    var tKey = body.getAttribute('data-title-key');
    var dKey = body.getAttribute('data-desc-key');
    var m = descMeta();

    if (ar) {
      if (tKey && dict[tKey]) document.title = dict[tKey];
      if (m && dKey && dict[dKey]) m.setAttribute('content', dict[dKey]);
    } else {
      document.title = srcTitle;
      if (m) m.setAttribute('content', srcDesc);
    }

    try { localStorage.setItem(STORE, lang); } catch (e) {}
  }

  function initLang() {
    snapshot();
    var stored;
    try { stored = localStorage.getItem(STORE); } catch (e) {}
    var lang = stored === 'en' || stored === 'ar' ? stored : 'en';
    if (lang === 'ar') applyLang('ar');

    document.querySelectorAll('[data-lang-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        applyLang(doc.lang === 'ar' ? 'en' : 'ar');
      });
    });
  }

  /* ------------------------------------------------------------ nav / UI */
  function initNav() {
    var header = document.querySelector('.header');
    var burger = document.querySelector('.burger');
    var links = document.querySelector('.nav__links');
    var scrim = document.querySelector('.nav-scrim');

    if (header) {
      var onScroll = function () {
        header.classList.toggle('is-stuck', window.scrollY > 8);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    function close() {
      if (!burger) return;
      burger.setAttribute('aria-expanded', 'false');
      links.classList.remove('is-open');
      if (scrim) scrim.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    if (burger && links) {
      burger.addEventListener('click', function () {
        var open = burger.getAttribute('aria-expanded') === 'true';
        burger.setAttribute('aria-expanded', String(!open));
        links.classList.toggle('is-open', !open);
        if (scrim) scrim.classList.toggle('is-open', !open);
        document.body.style.overflow = !open ? 'hidden' : '';
      });
      links.addEventListener('click', function (e) {
        if (e.target.closest('a')) close();
      });
      if (scrim) scrim.addEventListener('click', close);
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') close();
      });
    }
  }

  /* -------------------------------------------------------------- reveal */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var delay = parseFloat(el.getAttribute('data-delay') || 0);
        setTimeout(function () { el.classList.add('in'); }, delay * 1000);
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------- filters */
  function initFilters() {
    var bar = document.querySelector('.filters');
    if (!bar) return;
    var cards = document.querySelectorAll('[data-cat]');
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.filter');
      if (!btn) return;
      bar.querySelectorAll('.filter').forEach(function (b) { b.classList.remove('is-on'); });
      btn.classList.add('is-on');
      var want = btn.getAttribute('data-filter');
      cards.forEach(function (card) {
        var show = want === 'all' || card.getAttribute('data-cat') === want;
        card.classList.toggle('is-hidden', !show);
      });
    });
  }

  /* ------------------------------------------- quote form -> WhatsApp */
  function initForm() {
    var form = document.getElementById('quote-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var ar = doc.lang === 'ar';
      var get = function (n) {
        var f = form.elements[n];
        if (!f) return '';
        if (f.tagName === 'SELECT' && f.selectedIndex > -1) return f.options[f.selectedIndex].text.trim();
        return (f.value || '').trim();
      };

      var L = ar
        ? { head: 'طلب عرض سعر من الموقع', name: 'الاسم', company: 'الشركة', phone: 'الهاتف', product: 'المنتج', qty: 'الكمية', msg: 'التفاصيل' }
        : { head: 'Quote request from the website', name: 'Name', company: 'Company', phone: 'Phone', product: 'Product', qty: 'Quantity', msg: 'Details' };

      var lines = ['*' + L.head + '*', ''];
      [['name', L.name], ['company', L.company], ['phone', L.phone], ['product', L.product], ['qty', L.qty], ['message', L.msg]]
        .forEach(function (pair) {
          var v = get(pair[0]);
          if (v && v !== '—') lines.push(pair[1] + ': ' + v);
        });

      var url = 'https://wa.me/201005750973?text=' + encodeURIComponent(lines.join('\n'));
      window.open(url, '_blank', 'noopener');
    });
  }

  /* ---------------------------------------------------------------- boot */
  function boot() {
    initLang();
    initNav();
    initReveal();
    initFilters();
    initForm();

    var y = document.getElementById('year');
    if (y) y.textContent = new Date().getFullYear();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
