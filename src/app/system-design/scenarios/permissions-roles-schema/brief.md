# Design a Permissions and Roles Schema (RBAC)

## Overview

Design the backend data model for a B2B SaaS application that needs role-based access control across organizations and projects. Administrators should be able to grant access through reusable roles, team membership, and one-off exceptions without rewriting user records every time someone's responsibilities change.

- One application can host many organizations
- Each organization has users, teams, and projects
- Access can be granted at the organization level or only for a specific project

## Functional Requirements

- Users belong to organizations
- Each organization can have many projects
- Users can belong to multiple teams within an organization
- Permissions are atomic capabilities such as `project.view`, `project.edit`, `members.invite`, and `billing.manage`
- Roles are reusable bundles of permissions
- Administrators can assign roles directly to individual users
- Administrators can also assign roles to teams, and users inherit those roles through team membership
- A role assignment can apply to the whole organization or only to a specific project
- A user can hold multiple roles at the same time
- The system must support one-off direct permission grants for exceptions without creating a brand-new role
- Revoking a team role or removing a user from a team should remove inherited access automatically
- The system must support these checks:
  - Can user X perform action Y in organization O?
  - Can user X perform action Y on project P?
  - Which users currently have `billing.manage` access in organization O?

## What You Should Design

- The database schema for organizations, users, teams, projects, roles, permissions, and assignments
- How role inheritance works through team membership
- How scoped assignments work for organization-wide versus project-specific access
- The key constraints and query patterns needed to evaluate access correctly

## Constraints

- Focus on the backend schema and authorization data model, not UI flows
- Assume deny-by-default; do not design explicit deny rules
- Do not design a distributed policy engine, caching layer, or event-driven invalidation
- Do not introduce attribute-based access control, time-based rules, or field-level permissions
