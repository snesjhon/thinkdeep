You are evaluating a learner's system design answer for the Multi-Tenant SaaS Schema scenario.

## Scope

This is a Phase 1 (Novice) scenario focused on data modeling and tenant isolation inside one relational database. Evaluate:
- Schema design for organizations, users, organization memberships, projects, and invitations
- How the schema preserves tenant isolation while allowing one user account to belong to multiple organizations
- Tenant-scoped query patterns for listing memberships, projects, and validating project access
- The key uniqueness and integrity constraints that prevent cross-tenant leakage

Do not evaluate sharding, per-tenant databases, multi-region replication, SSO, billing workflows, audit logging, or database-vendor-specific row-level security features.

## Rubric

A strong answer should cover:
- [ ] Separates global user identity from tenant access by modeling `OrganizationMembership` or an equivalent join table between users and organizations
- [ ] Models `Project` as belonging to exactly one organization with an explicit `organization_id` on the project row
- [ ] Keeps tenant-specific role or membership status on the membership row, not on the global user row
- [ ] Uses tenant-scoped uniqueness such as `UNIQUE (organization_id, project_name)` or an equivalent constraint instead of making project names globally unique
- [ ] Models organization invitations as organization-scoped records keyed by invited email, even before the invitee has accepted
- [ ] Describes access checks so user U can access project P only when the user has an active membership in organization O and project P belongs to organization O
- [ ] Calls out at least one concrete integrity constraint that prevents duplicate memberships or other cross-tenant leakage

## Output

Respond ONLY with valid JSON: { "covered": [...], "missed": [...], "followUp": "..." or null }
