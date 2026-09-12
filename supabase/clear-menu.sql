-- Tango — empty the carte and start from nothing.
--
-- Run the steps one at a time in the Supabase SQL editor.
--
-- WHAT THIS CANNOT DO: remove the photographs. SQL only reaches the tables,
-- so every uploaded file stays in the `tango-photos` bucket and keeps counting
-- against the free tier. Step 1 lists what is about to be orphaned; delete
-- those under Storage → tango-photos, or run `npm run clear:photos`.
--
-- There is no undo. Nothing here is reversible once step 2 runs.


-- STEP 1 — dry run. What exists now, and which photos will be stranded.

select
  (select count(*) from categories) as sections,
  (select count(*) from dishes)     as dishes;

select regexp_replace(image_url, '^.*/tango-photos/', '') as orphaned_file
from (
  select image_url from categories
  union all
  select image_url from dishes
) t
where image_url like '%/tango-photos/%'
order by 1;


-- STEP 2 — the delete. `dishes` first so its count is its own; dropping the
-- sections alone would cascade and take the dishes silently.

delete from dishes;
delete from categories;


-- STEP 3 — verify. Both counts must be 0.

select
  (select count(*) from categories) as sections_left,
  (select count(*) from dishes)     as dishes_left;


-- STEP 4 (optional) — put the sample carte back with supabase/seed.sql.
-- Skip it to build the menu from scratch in the staff panel instead.
