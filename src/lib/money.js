/* Prices are whole CFA francs. The franc has no subunit in practice, so
   nothing here rounds to cents and the symbol trails the value: "12 500 FCFA".
   fr-FR groups with a narrow no-break space, which is what the printed carte
   and the WhatsApp message both want. */
const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

export const money = v => `${nf.format(Math.round(Number(v) || 0))} FCFA`;

/* Nobody prices a dish at 7 350 FCFA — the number input steps in 500s. */
export const PRICE_STEP = 500;
