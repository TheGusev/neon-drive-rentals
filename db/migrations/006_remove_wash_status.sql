-- 006: компания не использует статус «Мойка»
update cars set status = 'available' where status = 'wash';
