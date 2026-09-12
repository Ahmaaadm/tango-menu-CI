/* Dish tags. A small closed vocabulary on purpose: free-text labels drift
   ("veggie", "Vegetarian", "VEG") and stop being filterable within a month.

   A dish carries `tags: string[]`. Unknown keys are ignored rather than
   rendered, so removing one from this file never breaks a stored row. */

export const TAGS = {
  pick:  { label: "Chef's pick", french: 'Choix du chef', mark: '★' },
  new:   { label: 'New',         french: 'Nouveau',       mark: '◇' },
  veg:   { label: 'Vegetarian',  french: 'Végétarien',    mark: '❃' },
  spicy: { label: 'Spicy',       french: 'Épicé',         mark: '▲' }
};

export const TAG_KEYS = Object.keys(TAGS);

/* Stored rows come from Postgres (text[]), localStorage (array) or an older
   row that predates tags (undefined). Normalise all three to a clean array. */
export const readTags = row =>
  (Array.isArray(row?.tags) ? row.tags : []).filter(t => t in TAGS);
