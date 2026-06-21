/*
# Fix leaderboard_view: add SECURITY INVOKER

The view was implicitly using SECURITY DEFINER because it was owned by postgres.
Recreating it with SECURITY INVOKER ensures it runs with the permissions of the
calling user, not the view owner — preventing privilege escalation.
*/

DROP VIEW IF EXISTS leaderboard_view;

CREATE OR REPLACE VIEW leaderboard_view
WITH (security_invoker = true)
AS
SELECT
  p.id AS user_id,
  p.full_name,
  p.avatar_url,
  p.total_points,
  p.streak_days,
  RANK() OVER (ORDER BY p.total_points DESC) AS rank
FROM profiles p
ORDER BY p.total_points DESC;

GRANT SELECT ON leaderboard_view TO authenticated;
