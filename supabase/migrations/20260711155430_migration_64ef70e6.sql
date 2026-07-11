-- Modificar invitation_codes para códigos permanentes por deidad
-- 1. Eliminar columna used_by (no aplica para códigos permanentes)
ALTER TABLE invitation_codes DROP COLUMN IF EXISTS used_by;

-- 2. Quitar índice único de code (permitir duplicados entre deidades diferentes)
DROP INDEX IF EXISTS invitation_codes_code_idx;

-- 3. Agregar constraint único: una deidad solo puede tener UN código de cada tipo
DROP INDEX IF EXISTS idx_invitation_codes_creator_type;
CREATE UNIQUE INDEX idx_invitation_codes_creator_type ON invitation_codes(creator_id, code_type);

-- 4. Eliminar códigos duplicados por deidad (mantener el más reciente)
DELETE FROM invitation_codes a USING invitation_codes b
WHERE a.id < b.id 
  AND a.creator_id = b.creator_id 
  AND a.code_type = b.code_type;

-- 5. Verificar estado actual
SELECT creator_id, code_type, COUNT(*) as count 
FROM invitation_codes 
GROUP BY creator_id, code_type 
HAVING COUNT(*) > 1;