-- 005: уникальные фото для каждой записи автопарка (устраняем дубли изображений)
update cars set images = '["/assets/cars/honda-n-wgn-grey-2018.jpg"]'::jsonb where slug = 'honda-n-wgn-grey-2';
update cars set images = '["/assets/cars/honda-n-wgn-black-2020.jpg"]'::jsonb where slug = 'honda-n-wgn-black-2';
update cars set images = '["/assets/cars/daihatsu-mira-es-black-2018.jpg"]'::jsonb where slug = 'daihatsu-mira-es-black-2';
update cars set images = '["/assets/cars/nissan-dayz-highway-star-white.jpg"]'::jsonb where slug = 'nissan-dayz-white-2';
