/* ==========================================================================
   Media Print Pack — meeting booking
   Mode selector + form, handed off to WhatsApp like the other forms.
   ========================================================================== */
(function () {
  'use strict';

  var form = document.getElementById('book-form');
  var modes = document.getElementById('modes');
  if (!form || !modes) return;

  var mode = 'online';

  var LABEL = {
    online: ['Online meeting (video / WhatsApp call)', 'اجتماع أونلاين (فيديو / واتساب)'],
    yours:  ['At the customer office — our rep visits', 'في مكتب العميل — مندوبنا بيزور'],
    ours:   ['At our office — 323 Sudan St, Mohandessin, Giza', 'في مكتبنا — 323 شارع السودان، المهندسين، الجيزة']
  };

  function isAr() { return document.documentElement.lang === 'ar'; }

  /* today onwards, and default to the next working day (Friday is closed) */
  var dateEl = form.elements.date;
  if (dateEl) {
    var d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 5) d.setDate(d.getDate() + 1);   // skip Friday
    var iso = function (x) { return x.toISOString().slice(0, 10); };
    dateEl.min = iso(new Date());
    if (!dateEl.value) dateEl.value = iso(d);
  }

  modes.addEventListener('click', function (e) {
    var b = e.target.closest('[data-mode]');
    if (!b) return;
    mode = b.getAttribute('data-mode');
    modes.querySelectorAll('.mode').forEach(function (m) { m.classList.remove('is-on'); });
    b.classList.add('is-on');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    var ar = isAr();
    var get = function (n) {
      var f = form.elements[n];
      if (!f) return '';
      if (f.tagName === 'SELECT' && f.selectedIndex > -1) return f.options[f.selectedIndex].text.trim();
      return (f.value || '').trim();
    };

    var L = ar
      ? { head: 'طلب حجز اجتماع', name: 'الاسم', company: 'الشركة', phone: 'الهاتف',
          where: 'مكان الاجتماع', date: 'التاريخ', time: 'الوقت', topic: 'الموضوع', notes: 'ملاحظات' }
      : { head: 'Meeting booking request', name: 'Name', company: 'Company', phone: 'Phone',
          where: 'Meeting', date: 'Date', time: 'Time', topic: 'Topic', notes: 'Notes' };

    var lines = ['*' + L.head + '*', ''];
    lines.push(L.where + ': ' + LABEL[mode][ar ? 1 : 0]);
    [['name', L.name], ['company', L.company], ['phone', L.phone],
     ['date', L.date], ['time', L.time], ['topic', L.topic], ['notes', L.notes]]
      .forEach(function (p) {
        var v = get(p[0]);
        if (v) lines.push(p[1] + ': ' + v);
      });

    window.open('https://wa.me/201005750973?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });
})();
