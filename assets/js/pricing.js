/* ==========================================================================
   Media Print Pack — price book
   --------------------------------------------------------------------------
   Source: "Price list 2026-3-25.pdf" (10 pages), cross-checked against
   "قائمة الاسعار.xlsx". The spreadsheet quotes a single quantity (300) and
   equals  tier300 + printing  on every row that appears in both files, which
   is how these figures were verified.

   All prices are EGP per piece, excluding VAT.

   Pricing models
     'tiers'  — unit price drops at quantity breaks (Alibaba style)
     'perKg'  — sold by weight; unit price = pricePerKg / piecesPerKg
     'finish' — one MOQ per size, price varies by finishing option

   `printing` is an optional per-piece surcharge for one colour, one side.
   Where the source states the price already includes printing, printing is 0
   and `printIncluded` is true.
   ========================================================================== */

window.PRICING = {
  currency: 'EGP',
  note: 'Prices exclude VAT. One colour, one side unless stated.',

  products: {

    /* ---- page 2: كراتين (BOXS) — corrugated boxes ---- */
    corrugated: {
      model: 'tiers',
      tiers: [100, 200, 300, 500, 1000],
      printing: 3,
      variants: [
        { size: '20×20×7',   colour: 'Brown', colourAr: 'بني',  prices: [14, 13.5, 13, 12, 10] },
        { size: '25×20.5×9', colour: 'Brown', colourAr: 'بني',  prices: [19, 18.5, 18, 16.5, 15] },
        { size: '25×30×10',  colour: 'Brown', colourAr: 'بني',  prices: [21.5, 21, 20, 18.5, 17], check: true },
        { size: '25×30×10',  colour: 'White', colourAr: 'أبيض', prices: [26, 25, 24, 23, 21], check: true }
      ],
      moqNote: 'Any size can be made from 1,000 boxes.',
      moqNoteAr: 'متاح تصنيع أي مقاس بداية من 1000 كرتونة.'
    },

    /* ---- page 3: أكياس تغليف ملابس — garment bags ---- */
    apparel: {
      model: 'tiers',
      tiers: [300, 500, 1000],
      printing: 0,
      printIncluded: true,
      variants: [
        { size: '20×25', prices: [8, 7, 6] },
        { size: '27×35', prices: [9, 8, 7] },
        { size: '35×40', prices: [10, 9, 8] },
        { size: '37×45', prices: [11, 10, 9] }
      ],
      moqNote: 'Price includes one-colour printing.',
      moqNoteAr: 'السعر شامل الطباعة لون واحد.'
    },

    /* ---- page 5: شنط قماش — non-woven fabric totes ---- */
    nonwoven: {
      model: 'tiers',
      tiers: [300, 500, 1000],
      printingPerVariant: true,
      variants: [
        { size: '16×22', printing: 1.5,  prices: [2, 1.75, 1.5] },
        { size: '20×25', printing: 1.5,  prices: [3, 2.75, 2.5] },
        { size: '25×30', printing: 1.5,  prices: [3.25, 2.95, 2.65] },
        { size: '30×35', printing: 2,    prices: [4, 3.75, 3.5] },
        { size: '30×40', printing: 2,    prices: [4.25, 4, 3.75] },
        { size: '35×40', printing: 2,    prices: [4.75, 4.5, 4.25] },
        { size: '40×40', printing: 2,    prices: [5.5, 5.25, 4.9] },
        { size: '40×45', printing: 2,    prices: [6.25, 5.9, 5.6] },
        { size: '45×50', printing: 2.25, prices: [6.5, 6.25, 6] },
        { size: '50×50', printing: 2.25, prices: [7.5, 7.25, 7] },
        { size: '50×60', printing: 2.25, prices: [8.25, 8, 7.75] },
        { size: '60×60', printing: 2.25, prices: [9, 8.6, 8.3] }
      ],
      moqNote: 'All colours available.',
      moqNoteAr: 'متوفر جميع الألوان.'
    },

    /* ---- page 4: شنط كرافت — kraft carrier bags ---- */
    'paper-bags': {
      model: 'tiers',
      tiers: [300, 1000],
      printing: 2.5,
      variants: [
        { size: '25×30×8',  colour: 'Brown', colourAr: 'بني', prices: [7.5, 6] },
        { size: '30×40×10', colour: 'Brown', colourAr: 'بني', prices: [10, 8] }
      ],
      moqNote: 'Any size can be made from 1,000 bags.',
      moqNoteAr: 'متاح تصنيع أي مقاس بداية من 1000 شنطة.'
    },

    /* ---- page 8: كروت — hang tags & cards ---- */
    tags: {
      model: 'finish',
      finishes: [
        { id: 'rect',  en: 'Rectangular',              ar: 'مستطيل' },
        { id: 'curve', en: 'Curved edge',              ar: 'جناب كيرف' },
        { id: 'hole',  en: 'Punched + string',         ar: 'خرم + حبل' },
        { id: 'metal', en: 'Punched + string + metal', ar: 'خرم + حبل + معدن' }
      ],
      variants: [
        { size: '9×5',   moq: 300, prices: { rect: 1.8, curve: 2,    hole: 2.5, metal: 3.25 } },
        { size: '7×10',  moq: 200, prices: { rect: 3,   curve: 3.25, hole: 3.75, metal: 4.25 } },
        { size: '10×15', moq: 100, prices: { rect: 5,   curve: 5.25, hole: 6,    metal: 6.75 } }
      ],
      /* the round card is quoted as its own quantity ladder */
      extra: {
        size: '5 cm round', sizeAr: 'دائري 5 سم',
        model: 'tiers', tiers: [100, 200, 300], prices: [4, 3.75, 3.5],
        finish: 'hole'
      }
    },

    /* ---- page 1: فلاير شحن — courier bags (sold by weight) ---- */
    courier: {
      model: 'perKg',
      printing: 3,
      variants: [
        { size: '25×35', colour: 'Grey',  colourAr: 'رمادي', sizeLabel: 'Small',  sizeLabelAr: 'صغير', perKg: 210, pcsPerKg: 68 },
        { size: '35×40', colour: 'Grey',  colourAr: 'رمادي', sizeLabel: 'Medium', sizeLabelAr: 'وسط',  perKg: 210, pcsPerKg: 47 },
        { size: '40×50', colour: 'Grey',  colourAr: 'رمادي', sizeLabel: 'Large',  sizeLabelAr: 'كبير', perKg: 210, pcsPerKg: 32 },
        { size: '35×40', colour: 'Black', colourAr: 'أسود',  sizeLabel: 'Medium', sizeLabelAr: 'وسط',  perKg: 220, pcsPerKg: 50 },
        { size: '35×40', colour: 'Salmon', colourAr: 'سيمون', sizeLabel: 'Medium', sizeLabelAr: 'وسط', perKg: 220, pcsPerKg: 50 }
      ],
      moqNote: 'Sold by the kilogram. Printing adds EGP 3 per bag.',
      moqNoteAr: 'البيع بالكيلو. الطباعة تضيف 3 جنيهات على الكيس.'
    }
  }
};
