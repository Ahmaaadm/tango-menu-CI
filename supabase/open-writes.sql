-- Tango — switch carte writes from "signed-in staff" to "anyone".
--
-- Run this ONLY because the staff panel uses a static passcode checked in the
-- browser instead of Supabase Auth. A browser-side check cannot gate the
-- database, so the anon key has to be allowed to write.
--
-- WHAT THIS MEANS: anyone who opens the site can read the publishable key out
-- of the page source and then add, edit or delete carte rows and upload photos
-- by calling the REST API directly. The passcode screen does not stop them —
-- it is a lock on the door of a room with no walls. For a display-only menu
-- that is usually an acceptable trade; decide deliberately.
--
-- TO REVERT: re-run supabase/schema.sql. It drops and recreates these
-- policies as authenticated-only.

do $$
declare t text;
begin
  foreach t in array array['categories', 'dishes'] loop
    execute format('drop policy if exists "staff write %1$s" on %1$I', t);
    execute format('drop policy if exists "open write %1$s" on %1$I', t);
    execute format(
      'create policy "open write %1$s" on %1$I for all to anon using (true) with check (true)', t);
  end loop;
end $$;

-- Photo uploads need the same treatment.
drop policy if exists "staff write tango photos" on storage.objects;
drop policy if exists "open write tango photos"  on storage.objects;

create policy "open write tango photos" on storage.objects
  for all to anon
  using (bucket_id = 'tango-photos')
  with check (bucket_id = 'tango-photos');
