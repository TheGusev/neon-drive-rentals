-- Приведение условий аренды к актуальным: залог 2000 ₽, лимит пробега 300 км/сутки.
UPDATE cars
SET specs = jsonb_set(
      jsonb_set(COALESCE(specs, '{}'::jsonb), '{deposit}', '2000'::jsonb, true),
      '{mileageLimit}', '300'::jsonb, true
    );
