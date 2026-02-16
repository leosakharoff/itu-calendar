-- Grant full access to authenticated role (RLS policies will filter)
GRANT ALL ON courses TO authenticated;
GRANT ALL ON events TO authenticated;

-- Grant usage on sequences if any
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;
