# Design a Multi-Tenant SaaS Schema

## Overview

Design the backend data model for a B2B SaaS application where one database serves many customer organizations. Users should be able to log in once, switch between organizations they belong to, and see only the data for the active organization.

- One application and one relational database host many organizations
- Each organization has its own members, projects, and invitations
- A single user account can belong to multiple organizations

## Functional Requirements

- Each organization is a tenant with its own name, slug, billing plan, and lifecycle status
- Users authenticate with one global account and may belong to multiple organizations at the same time
- Membership in an organization carries a tenant-specific role such as `owner`, `admin`, or `member`
- Each organization can create many projects
- Every project belongs to exactly one organization
- Project names must be unique within an organization, but different organizations may use the same project name
- Organizations can invite new members by email before the invitee has accepted
- A user removed from one organization must lose access to that organization's projects without losing access to other organizations they still belong to
- The system must support these queries:
  - List all organizations a user belongs to
  - List all members of organization O
  - List all projects in organization O
  - Determine whether user U can access project P through organization O

## What You Should Design

- The database schema for organizations, users, memberships, projects, and invitations
- The relationships and constraints that preserve tenant isolation inside one shared database
- The key query patterns or API-facing lookups needed to scope reads and writes to the active organization
- Any uniqueness or integrity rules that matter for roles, memberships, and tenant-owned records

## Constraints

- Focus on the backend schema and tenant-boundary rules, not UI or onboarding flows
- Assume one relational database, do not design sharding, per-tenant databases, or multi-region replication
- Do not design SSO, billing workflows, audit logging, or row-level security policies for a specific database vendor
- You may assume application code passes an active organization context on every tenant-scoped request
