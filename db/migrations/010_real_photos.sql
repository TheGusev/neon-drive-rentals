-- 010: живые фото парка вместо сгенерированных кадров.
-- Реальные снимки с площадки на Доватора, 11 (номера размыты).

-- Honda N-BOX чёрный: реальная съёмка, 4 кадра
update cars set images = '["/assets/cars/real/honda-n-box-black-real-3.jpg","/assets/cars/real/honda-n-box-black-real.jpg","/assets/cars/real/honda-n-box-black-front-real.jpg","/assets/cars/real/honda-n-box-black-real-2.jpg"]'::jsonb
where slug = 'honda-n-box-black-1' and not images_managed;

-- Nissan Dayz чёрный: реальный борт + прежний кадр
update cars set images = '["/assets/cars/real/nissan-dayz-black-real.jpg","/assets/cars/nissan-dayz-black.jpg"]'::jsonb
where slug = 'nissan-dayz-black-1' and not images_managed;

-- Honda N-WGN голубой: реальное фото (номер размыт)
update cars set images = '["/assets/cars/real/honda-n-wgn-blue-real.jpg","/assets/cars/honda-n-wgn-blue.jpg"]'::jsonb
where slug = 'honda-n-wgn-blue-1' and not images_managed;

-- Mitsubishi eK Wagon: в парке чёрный кузов, ставим реальные кадры и правим цвет
update cars set images = '["/assets/cars/real/mitsubishi-ek-wagon-black-real.jpg","/assets/cars/real/mitsubishi-ek-wagon-silver-real.jpg"]'::jsonb,
                specs = jsonb_set(coalesce(specs, '{}'::jsonb), '{color}', '"чёрный"')
where slug = 'mitsubishi-ek-wagon-blue-1' and not images_managed;
