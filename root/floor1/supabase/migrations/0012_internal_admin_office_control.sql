-- 0012_internal_admin_office_control.sql
-- Phase 1: team admins are owner-equivalent across offices in the O&O
-- workspace. Person-level office permissions still govern non-admin users.

drop policy if exists offices_read on offices;
create policy offices_read on offices
  for select using (
    is_team_admin(team_id)
    or (
      is_team_member(team_id)
      and (not is_private or has_office_perm(id))
    )
  );

drop policy if exists offices_update on offices;
create policy offices_update on offices
  for update using (
    is_team_admin(team_id)
    or office_perm_role(id) in ('owner','editor','hr-editor','space-planner')
    or (
      is_team_member(team_id)
      and not is_private
      and office_perm_role(id) is distinct from 'viewer'
    )
  )
  with check (
    is_team_admin(team_id)
    or office_perm_role(id) in ('owner','editor','hr-editor','space-planner')
    or (
      is_team_member(team_id)
      and not is_private
      and office_perm_role(id) is distinct from 'viewer'
    )
  );

drop policy if exists "share_tokens_owner_insert" on share_tokens;
create policy "share_tokens_owner_insert"
  on share_tokens for insert
  with check (
    is_team_admin((select o.team_id from offices o where o.id = share_tokens.office_id))
    or exists (
      select 1 from office_permissions op
      where op.office_id = share_tokens.office_id
        and op.user_id = auth.uid()
        and op.role = 'owner'
    )
  );

drop policy if exists "share_tokens_owner_update" on share_tokens;
create policy "share_tokens_owner_update"
  on share_tokens for update
  using (
    is_team_admin((select o.team_id from offices o where o.id = share_tokens.office_id))
    or exists (
      select 1 from office_permissions op
      where op.office_id = share_tokens.office_id
        and op.user_id = auth.uid()
        and op.role = 'owner'
    )
  )
  with check (
    is_team_admin((select o.team_id from offices o where o.id = share_tokens.office_id))
    or exists (
      select 1 from office_permissions op
      where op.office_id = share_tokens.office_id
        and op.user_id = auth.uid()
        and op.role = 'owner'
    )
  );
