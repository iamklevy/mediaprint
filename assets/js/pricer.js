/* ==========================================================================
   Media Print Pack — interactive price calculator
   --------------------------------------------------------------------------
   Renders into any <div class="pricer" data-product="<id>"></div>, reading its
   figures from window.PRICING (assets/js/pricing.js).

   Quantity-break strip is modelled on Alibaba's supplier listings: the tier
   covering the current quantity highlights, and unit price and total update
   on every size / option / quantity change.
   ========================================================================== */
(function () {
  'use strict';

  var CUR = 'EGP';

  function isAr() { return document.documentElement.lang === 'ar'; }

  var T = {
    open:      ['See tiered pricing', 'اعرض الأسعار حسب الكمية'],
    from:      ['from', 'من'],
    size:      ['Size (cm)', 'المقاس (سم)'],
    colour:    ['Colour', 'اللون'],
    finish:    ['Finishing', 'التشطيب'],
    qty:       ['Quantity', 'الكمية'],
    pieces:    ['pieces', 'قطعة'],
    each:      ['each', 'للقطعة'],
    unit:      ['Unit price', 'سعر القطعة'],
    total:     ['Total', 'الإجمالي'],
    printing:  ['Add printing — one colour, one side', 'إضافة طباعة — لون واحد وش واحد'],
    included:  ['One-colour printing included', 'شامل الطباعة لون واحد'],
    moq:       ['Minimum order: %s pieces', 'أقل كمية: %s قطعة'],
    below:     ['Below the minimum of %s pieces', 'أقل من الحد الأدنى %s قطعة'],
    perkg:     ['%s/kg · %s pieces per kg', '%s للكيلو · %s قطعة في الكيلو'],
    send:      ['Send this spec on WhatsApp', 'ابعت المواصفات على واتساب'],
    novat:     ['Prices exclude VAT. Final price is confirmed on the sample.',
                'الأسعار غير شاملة الضريبة. السعر النهائي بيتأكد مع العينة.'],
    qtyBreak:  ['%s+', '%s+'],
    range:     ['%s–%s', '%s–%s']
  };
  function t(k) { return T[k][isAr() ? 1 : 0]; }

  function money(n) {
    var s = (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, '');
    s = s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return isAr() ? s + ' ج.م' : CUR + ' ' + s;
  }
  function num(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }

  /* ---------------------------------------------------------- price maths */
  function tierIndex(tiers, qty) {
    var i = 0;
    for (var k = 0; k < tiers.length; k++) if (qty >= tiers[k]) i = k;
    return i;
  }

  function unitPrice(p, st) {
    var v = p.variants[st.variant];
    if (p.model === 'perKg') {
      return v.perKg / v.pcsPerKg + (st.printing ? (p.printing || 0) : 0);
    }
    if (p.model === 'finish') {
      return v.prices[st.finish];
    }
    var base = v.prices[tierIndex(p.tiers, st.qty)];
    var pr = p.printingPerVariant ? (v.printing || 0) : (p.printing || 0);
    return base + (st.printing ? pr : 0);
  }

  function moqOf(p, st) {
    if (p.model === 'finish') return p.variants[st.variant].moq;
    if (p.model === 'perKg') return 1;
    return p.tiers[0];
  }

  /* ------------------------------------------------------------- rendering */
  function render(root) {
    var id = root.getAttribute('data-product');
    var p = (window.PRICING && window.PRICING.products) ? window.PRICING.products[id] : null;
    if (!p) return;

    var st = root._state || (root._state = {
      variant: 0,
      qty: (p.model === 'finish') ? p.variants[0].moq : (p.model === 'perKg' ? 100 : p.tiers[0]),
      printing: !p.printIncluded && p.model !== 'finish',
      finish: p.model === 'finish' ? p.finishes[0].id : null,
      open: false
    });

    var ar = isAr();
    var cheapest = Math.min.apply(null, p.variants.map(function (v, i) {
      var s = { variant: i, qty: 1e9, printing: false, finish: st.finish };
      return unitPrice(p, s);
    }));

    var h = '';
    h += '<button class="pricer__toggle" type="button" aria-expanded="' + (st.open ? 'true' : 'false') + '">' +
           '<span>' + esc(t('open')) + '</span>' +
           '<span class="pricer__from">' + esc(t('from')) + ' ' + money(cheapest) + ' <small>' + esc(t('each')) + '</small>' +
             '<svg class="chev" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-inline-start:.4rem;vertical-align:-2px"><path d="m6 9 6 6 6-6"/></svg>' +
           '</span>' +
         '</button>';

    h += '<div class="pricer__panel' + (st.open ? ' is-open' : '') + '">';

    /* size / variant picker */
    h += '<div class="pricer__row"><span class="pricer__legend">' + esc(t('size')) + '</span><div class="opt" data-opt="variant">';
    p.variants.forEach(function (v, i) {
      var sub = '';
      if (v.colour) sub = ar ? v.colourAr : v.colour;
      if (v.label) sub = (ar ? v.labelAr : v.label) + (sub ? ' · ' + sub : '');
      if (v.sizeLabel) sub = (ar ? v.sizeLabelAr : v.sizeLabel) + (sub ? ' · ' + sub : '');
      h += '<button type="button" data-i="' + i + '" class="' + (st.variant === i ? 'is-on' : '') + '">' +
             esc(v.size) + (sub ? '<small>' + esc(sub) + '</small>' : '') + '</button>';
    });
    h += '</div></div>';

    /* finishing picker — hidden when there is only one option to pick */
    if (p.model === 'finish' && p.finishes.length > 1) {
      h += '<div class="pricer__row"><span class="pricer__legend">' + esc(t('finish')) + '</span><div class="opt" data-opt="finish">';
      p.finishes.forEach(function (f) {
        h += '<button type="button" data-f="' + f.id + '" class="' + (st.finish === f.id ? 'is-on' : '') + '">' +
               esc(ar ? f.ar : f.en) + '</button>';
      });
      h += '</div></div>';
    }

    /* quantity-break strip */
    if (p.model === 'tiers') {
      var active = tierIndex(p.tiers, st.qty);
      h += '<div class="pricer__row"><div class="tiers">';
      p.tiers.forEach(function (q, i) {
        var label = (i === p.tiers.length - 1)
          ? t('qtyBreak').replace('%s', num(q))
          : t('range').replace('%s', num(q)).replace('%s', num(p.tiers[i + 1] - 1));
        var v = p.variants[st.variant];
        var pr = p.printingPerVariant ? (v.printing || 0) : (p.printing || 0);
        var cell = v.prices[i] + (st.printing ? pr : 0);
        h += '<div class="tier' + (active === i ? ' is-on' : '') + '">' +
               '<span class="tier__q">' + esc(label) + '</span>' +
               '<span class="tier__p">' + money(cell) + '</span></div>';
      });
      h += '</div></div>';
    }

    /* per-kg explainer */
    if (p.model === 'perKg') {
      var vk = p.variants[st.variant];
      h += '<div class="pricer__row"><div class="tiers"><div class="tier is-on">' +
             '<span class="tier__q">' + esc(t('perkg').replace('%s', money(vk.perKg)).replace('%s', vk.pcsPerKg)) + '</span>' +
             '<span class="tier__p">' + money(unitPrice(p, st)) + '</span></div></div></div>';
    }

    /* printing option */
    if (p.printIncluded) {
      h += '<div class="pricer__row"><span class="pricer__check"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="color:var(--leaf)"><path d="m20 6-11 11-5-5"/></svg>' + esc(t('included')) + '</span></div>';
    } else if (p.model !== 'finish') {
      var vv = p.variants[st.variant];
      var addc = p.printingPerVariant ? (vv.printing || 0) : (p.printing || 0);
      h += '<div class="pricer__row"><label class="pricer__check">' +
             '<input type="checkbox" data-print' + (st.printing ? ' checked' : '') + '>' +
             '<span>' + esc(t('printing')) + ' <span class="add">+' + money(addc) + '</span></span></label></div>';
    }

    /* quantity */
    var moq = moqOf(p, st);
    h += '<div class="pricer__row"><span class="pricer__legend">' + esc(t('qty')) + '</span>' +
           '<div class="qty">' +
             '<button type="button" data-step="-1" aria-label="-">−</button>' +
             '<input type="number" data-qty value="' + st.qty + '" min="' + moq + '" step="1">' +
             '<button type="button" data-step="1" aria-label="+">+</button>' +
             '<span class="qty__unit">' + esc(t('pieces')) + '</span>' +
           '</div></div>';

    /* output */
    var u = unitPrice(p, st);
    h += '<div class="pricer__out">' +
           '<div><span class="k">' + esc(t('unit')) + '</span><span class="v">' + money(u) + '</span></div>' +
           '<div><span class="k">' + esc(t('total')) + '</span><span class="v v--total">' + money(u * st.qty) + '</span></div>' +
         '</div>';

    var warn = st.qty < moq;
    h += '<p class="pricer__moq' + (warn ? ' is-warn' : '') + '">' +
           esc((warn ? t('below') : t('moq')).replace('%s', num(moq))) + '</p>';

    h += '<div style="margin-block-start:.9rem"><button class="btn btn--accent" type="button" data-send style="width:100%">' +
           esc(t('send')) + '</button></div>';

    var extraNote = ar ? (p.moqNoteAr || '') : (p.moqNote || '');
    h += '<p class="pricer__note">' + (extraNote ? esc(extraNote) + '<br>' : '') + esc(t('novat')) + '</p>';

    h += '</div>';
    root.innerHTML = h;
  }

  /* --------------------------------------------------------------- events */
  function clampQty(root, p, st) {
    var moq = moqOf(p, st);
    if (!isFinite(st.qty) || st.qty < 1) st.qty = moq;
    st.qty = Math.round(st.qty);
  }

  function wire(root) {
    root.addEventListener('click', function (e) {
      var id = root.getAttribute('data-product');
      var p = window.PRICING.products[id];
      var st = root._state;
      var el;

      if ((el = e.target.closest('.pricer__toggle'))) { st.open = !st.open; render(root); return; }
      if ((el = e.target.closest('[data-opt="variant"] button'))) {
        st.variant = +el.getAttribute('data-i');
        clampQty(root, p, st);
        if (p.model === 'finish') st.qty = Math.max(st.qty, p.variants[st.variant].moq);
        render(root); return;
      }
      if ((el = e.target.closest('[data-opt="finish"] button'))) {
        st.finish = el.getAttribute('data-f'); render(root); return;
      }
      if ((el = e.target.closest('[data-step]'))) {
        var step = +el.getAttribute('data-step');
        var base = (p.model === 'tiers') ? p.tiers[0] : 50;
        var inc = Math.max(Math.round(base / 10), 1) * 10;
        st.qty = Math.max(1, st.qty + step * inc);
        render(root); return;
      }
      if (e.target.closest('[data-send]')) { send(root, p, st); return; }
    });

    root.addEventListener('change', function (e) {
      var p = window.PRICING.products[root.getAttribute('data-product')];
      var st = root._state;
      if (e.target.matches('[data-print]')) { st.printing = e.target.checked; render(root); }
    });

    root.addEventListener('input', function (e) {
      if (!e.target.matches('[data-qty]')) return;
      var p = window.PRICING.products[root.getAttribute('data-product')];
      var st = root._state;
      st.qty = parseInt(e.target.value, 10);
      clampQty(root, p, st);
      var pos = e.target.selectionStart;
      render(root);
      var f = root.querySelector('[data-qty]');
      if (f) { f.focus(); try { f.setSelectionRange(pos, pos); } catch (err) {} }
    });
  }

  function send(root, p, st) {
    var ar = isAr();
    var v = p.variants[st.variant];
    var u = unitPrice(p, st);
    var card = root.closest('.pcard');
    var title = card ? (card.querySelector('h3') || {}).textContent : '';
    var L = ar
      ? { head: 'طلب سعر من الموقع', item: 'المنتج', size: 'المقاس', fin: 'التشطيب', pr: 'الطباعة',
          qty: 'الكمية', unit: 'سعر القطعة', tot: 'الإجمالي التقديري', yes: 'نعم', no: 'بدون' }
      : { head: 'Price request from the website', item: 'Product', size: 'Size', fin: 'Finishing', pr: 'Printing',
          qty: 'Quantity', unit: 'Unit price', tot: 'Estimated total', yes: 'yes', no: 'none' };

    var lines = ['*' + L.head + '*', ''];
    if (title) lines.push(L.item + ': ' + title.trim());
    lines.push(L.size + ': ' + v.size + (v.colour ? ' — ' + (ar ? v.colourAr : v.colour) : ''));
    if (p.model === 'finish') {
      var f = p.finishes.filter(function (x) { return x.id === st.finish; })[0];
      if (f) lines.push(L.fin + ': ' + (ar ? f.ar : f.en));
    } else if (!p.printIncluded) {
      lines.push(L.pr + ': ' + (st.printing ? L.yes : L.no));
    }
    lines.push(L.qty + ': ' + num(st.qty));
    lines.push(L.unit + ': ' + money(u));
    lines.push(L.tot + ': ' + money(u * st.qty));

    window.open('https://wa.me/201005750973?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  }

  /* ----------------------------------------------------------------- boot */
  function initAll() {
    document.querySelectorAll('.pricer[data-product]').forEach(function (root) {
      if (!root._wired) { wire(root); root._wired = true; }
      render(root);
    });
  }

  document.addEventListener('mp:lang', initAll);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll);
  else initAll();
})();
