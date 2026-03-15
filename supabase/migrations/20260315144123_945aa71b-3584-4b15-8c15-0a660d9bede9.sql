CREATE POLICY "Allow public delete"
ON public.developer_info
FOR DELETE
TO anon, authenticated
USING (true);