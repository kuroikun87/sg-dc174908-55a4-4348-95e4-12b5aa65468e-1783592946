-- Modificar invitation_codes para códigos permanentes por deidad
-- 1. Quitar constraints de un solo uso
ALTER TABLE invitation_codes DROP CONSTRAINT IF EXISTS invitation_codes_code_key;

-- 2. Permitir múltiples códigos del mismo tipo por deidad (pero solo uno de cada tipo por deidad)
-- Primero verificar si hay duplicados
SELECT creator_id, code_type, COUNT(*) as count 
FROM invitation_codes 
GROUP BY creator_id, code_type 
HAVING COUNT(*) > 1;