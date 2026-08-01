/* ==========================================================================
   Media Print Pack — sticker catalogue renderer
   Reads window.STICKERS (assets/js/stickers.js) into #sticker-grid,
   #sticker-cats and #sticker-offers. Re-renders on language switch.
   ========================================================================== */
(function () {
  'use strict';

  function isAr() { return document.documentElement.lang === 'ar'; }
  function t(en, ar) { return isAr() ? ar : en; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function money(n) {
    var s = (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '');
    s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return isAr() ? s + ' ج.م' : 'EGP ' + s;
  }

  var state = { cat: 'all' };

  var PLACEHOLDER =
    '<span class="stick__ph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">' +
    '<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.8"/>' +
    '<path d="m21 15-5-5L5 21"/></svg></span>';

  function matName(id) {
    var m = (window.STICKERS.materials || []).filter(function (x) { return x.id === id; })[0];
    return m ? t(m.en, m.ar) : id;
  }

  function renderCats() {
    var host = document.getElementById('sticker-cats');
    if (!host) return;
    var cats = window.STICKERS.categories || [];
    var h = '<button class="filter' + (state.cat === 'all' ? ' is-on' : '') + '" data-cat="all">' +
            esc(t('Everything', 'الكل')) + '</button>';
    cats.forEach(function (c) {
      h += '<button class="filter' + (state.cat === c.id ? ' is-on' : '') + '" data-cat="' + c.id + '">' +
             esc(t(c.en, c.ar)) + '</button>';
    });
    host.innerHTML = h;
  }

  function renderGrid() {
    var host = document.getElementById('sticker-grid');
    if (!host) return;
    var items = (window.STICKERS.items || []).filter(function (it) {
      return state.cat === 'all' || it.cat === state.cat;
    });

    host.innerHTML = items.map(function (it) {
      var price = (it.price == null)
        ? '<span class="stick__price is-ask">' + esc(t('Price on request', 'اسأل عن السعر')) + '</span>'
        : '<span class="stick__price"><small>' + esc(t('from', 'من')) + '</small> ' + money(it.price) +
          ' <small>' + esc(t('each', 'للاستيكر')) + '</small></span>';
      var moq = it.moq ? '<span class="stick__size">' + esc(t('Min. ', 'أقل كمية ')) + it.moq + '</span>' : '';
      var media = it.img
        ? '<img loading="lazy" src="' + esc(it.img) + '" alt="">'
        : PLACEHOLDER;
      return '<article class="stick reveal">' +
               '<div class="stick__media">' + media +
                 '<span class="stick__mat">' + esc(matName(it.mat)) + '</span>' +
               '</div>' +
               '<div class="stick__body">' +
                 '<h3>' + esc(t(it.en, it.ar)) + '</h3>' +
                 '<span class="stick__size">' + esc(t('Size', 'المقاس')) + ': ' + esc(it.size) + ' cm</span>' +
                 moq + price +
               '</div>' +
             '</article>';
    }).join('');

    host.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
  }

  function renderOffers() {
    var host = document.getElementById('sticker-offers');
    if (!host) return;
    var offers = window.STICKERS.offers || [];
    if (!offers.length) {
      host.innerHTML = '<div class="offers-empty" data-i18n="stick.offersEmpty">' +
        esc(t('No promotions are published right now. Message us on WhatsApp and we will quote the best price for the quantity you need.',
              'لسه مفيش عروض منشورة. كلمنا على واتساب وهنقول لك أفضل سعر للكمية اللي محتاجها.')) + '</div>';
      return;
    }
    host.innerHTML = '<div class="grid g-3">' + offers.map(function (o) {
      var it = (window.STICKERS.items || []).filter(function (x) { return x.id === o.item; })[0];
      if (!it) return '';
      var save = (o.was && o.was > o.price)
        ? '<span class="offer__save">' + esc(t('Save ', 'وفّر ')) + money(o.was - o.price) + '</span>' : '';
      var was = (o.was && o.was > o.price) ? '<span class="offer__was">' + money(o.was) + '</span>' : '';
      return '<div class="offer reveal in">' + save +
               '<h3>' + esc(t(it.en, it.ar)) + '</h3>' +
               '<span class="offer__qty">' + o.qty.toLocaleString() + ' ' + esc(t('stickers', 'استيكر')) + '</span>' +
               '<span class="offer__now">' + money(o.price) + '</span>' + was +
             '</div>';
    }).join('') + '</div>';
  }

  function renderAll() { renderCats(); renderGrid(); renderOffers(); }

  function boot() {
    if (!window.STICKERS) return;
    renderAll();
    var cats = document.getElementById('sticker-cats');
    if (cats) cats.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cat]');
      if (!b) return;
      state.cat = b.getAttribute('data-cat');
      renderCats(); renderGrid();
    });
    document.addEventListener('mp:lang', renderAll);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
