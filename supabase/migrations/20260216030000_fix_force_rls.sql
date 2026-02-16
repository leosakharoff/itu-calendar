-- Remove FORCE (which blocks even service_role/table owner)
-- ENABLE is sufficient - it applies RLS to non-owner roles (anon, authenticated)
ALTER TABLE courses NO FORCE ROW LEVEL SECURITY;
ALTER TABLE events NO FORCE ROW LEVEL SECURITY;
