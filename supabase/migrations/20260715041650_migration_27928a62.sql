-- Crear bucket para audios de sesión en Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('session-audios', 'session-audios', false)
ON CONFLICT (id) DO NOTHING;

-- Policy para que deidades suban audios
CREATE POLICY "deities_upload_audios" ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'session-audios'
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'deity'
  )
);

-- Policy para que deidades vean sus propios audios
CREATE POLICY "deities_view_own_audios" ON storage.objects FOR SELECT
USING (
  bucket_id = 'session-audios'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy para que deidades borren sus propios audios
CREATE POLICY "deities_delete_own_audios" ON storage.objects FOR DELETE
USING (
  bucket_id = 'session-audios'
  AND auth.uid()::text = (storage.foldername(name))[1]
);