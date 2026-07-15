-- Cambiar event_date de date a timestamp with time zone para soportar conversión de timezones
ALTER TABLE calendar_events 
ALTER COLUMN event_date TYPE timestamp with time zone 
USING event_date::timestamp with time zone;

-- Ya no necesitamos event_time como columna separada porque toda la info está en event_date
-- Pero la dejamos por compatibilidad hacia atrás