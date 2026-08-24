-- 011: repair stale build URLs and preserve both real and earlier fleet photos.
-- Idempotent: every row receives a deterministic, duplicate-free JSONB gallery.

update cars set images = '["/assets/cars/honda-n-wgn-grey.jpg","/assets/cars/honda-n-wgn-grey-2018.jpg"]'::jsonb where slug = 'honda-n-wgn-grey-1';
update cars set images = '["/assets/cars/real/honda-n-wgn-blue-real.jpg","/assets/cars/honda-n-wgn-blue.jpg"]'::jsonb where slug = 'honda-n-wgn-blue-1';
update cars set images = '["/assets/cars/honda-n-wgn-blue-2.jpg","/assets/cars/honda-n-wgn-blue.jpg"]'::jsonb where slug = 'honda-n-wgn-blue-2';
update cars set images = '["/assets/cars/honda-n-wgn-black.jpg","/assets/cars/honda-n-wgn-black-2020.jpg"]'::jsonb where slug = 'honda-n-wgn-black-1';
update cars set images = '["/assets/cars/nissan-dayz-green.jpg"]'::jsonb where slug = 'nissan-dayz-green-1';
update cars set images = '["/assets/cars/real/nissan-dayz-brown-real.jpg","/assets/cars/nissan-dayz-brown.jpg"]'::jsonb where slug = 'nissan-dayz-brown-1';
update cars set images = '["/assets/cars/real/mitsubishi-ek-wagon-black-real.jpg","/assets/cars/mitsubishi-ek-wagon-blue.jpg","/assets/cars/real/mitsubishi-ek-wagon-silver-real.jpg"]'::jsonb where slug = 'mitsubishi-ek-wagon-blue-1';
update cars set images = '["/assets/cars/daihatsu-mira-es-black.jpg","/assets/cars/daihatsu-mira-es-black-2018.jpg"]'::jsonb where slug = 'daihatsu-mira-es-black-1';
update cars set images = '["/assets/cars/nissan-dayz-grey.jpg"]'::jsonb where slug = 'nissan-dayz-grey-1';
update cars set images = '["/assets/cars/nissan-dayz-white.jpg","/assets/cars/real/nissan-dayz-white-real.jpg"]'::jsonb where slug = 'nissan-dayz-white-1';
update cars set images = '["/assets/cars/daihatsu-move-white.jpg","/assets/cars/daihatsu-move-custom.jpg"]'::jsonb where slug = 'daihatsu-move-white-1';
update cars set images = '["/assets/cars/honda-n-wgn-white.jpg"]'::jsonb where slug = 'honda-n-wgn-white-1';
update cars set images = '["/assets/cars/honda-n-wgn-turbo-white.jpg"]'::jsonb where slug = 'honda-n-wgn-turbo-white-1';
update cars set images = '["/assets/cars/real/honda-n-wgn-white-real.jpg","/assets/cars/honda-n-wgn-white.jpg"]'::jsonb where slug = 'honda-n-wgn-white-2';
update cars set images = '["/assets/cars/nissan-dayz-grey-2.jpg","/assets/cars/nissan-dayz-grey.jpg"]'::jsonb where slug = 'nissan-dayz-grey-2';
update cars set images = '["/assets/cars/real/honda-n-box-black-real-3.jpg","/assets/cars/honda-n-box-black.jpg","/assets/cars/real/honda-n-box-black-real.jpg","/assets/cars/real/honda-n-box-black-front-real.jpg","/assets/cars/real/honda-n-box-black-real-2.jpg"]'::jsonb where slug = 'honda-n-box-black-1';
update cars set images = '["/assets/cars/real/nissan-dayz-black-real.jpg","/assets/cars/nissan-dayz-black.jpg"]'::jsonb where slug = 'nissan-dayz-black-1';
update cars set images = '["/assets/cars/daihatsu-mira-white.jpg"]'::jsonb where slug = 'daihatsu-mira-white-1';
update cars set images = '["/assets/cars/suzuki-alto-white.jpg"]'::jsonb where slug = 'suzuki-alto-white-1';
update cars set images = '["/assets/cars/daihatsu-mira-es-white.jpg"]'::jsonb where slug = 'daihatsu-mira-es-white-1';
update cars set images = '["/assets/cars/suzuki-alto-white-2.jpg","/assets/cars/suzuki-alto-works.jpg"]'::jsonb where slug = 'suzuki-alto-white-2';