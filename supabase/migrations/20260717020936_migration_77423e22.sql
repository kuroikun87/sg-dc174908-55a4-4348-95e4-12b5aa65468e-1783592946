-- Crear bucket de Storage para evidencias de tareas si no existe
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'task-evidence',
  'task-evidence',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp'];

-- Políticas RLS para el bucket task-evidence
DROP POLICY IF EXISTS "Followers can upload evidence" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view evidence" ON storage.objects;

CREATE POLICY "Followers can upload evidence"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'task-evidence' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view evidence"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'task-evidence');

CREATE POLICY "Followers can update their evidence"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'task-evidence' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Followers can delete their evidence"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'task-evidence' AND
  auth.uid()::text = (storage.foldername(name))[1]
);