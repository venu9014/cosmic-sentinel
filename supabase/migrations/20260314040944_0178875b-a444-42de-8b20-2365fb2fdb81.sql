
CREATE TABLE public.developer_info (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  developer_name TEXT NOT NULL DEFAULT 'AstroTracking Team',
  github_url TEXT DEFAULT '',
  linkedin_url TEXT DEFAULT '',
  twitter_url TEXT DEFAULT '',
  website_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.developer_info ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON public.developer_info
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Allow public insert" ON public.developer_info
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow public update" ON public.developer_info
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- Insert default row
INSERT INTO public.developer_info (developer_name) VALUES ('AstroTracking Team');
