-- ==============================================================================
-- Supabase / PostgreSQL Seed Script for Orbit Workforce Platform
-- Matches Prisma Schema & Frontend Types
-- Safe for repeated runs (upsert / ON CONFLICT DO NOTHING)
-- ==============================================================================

-- 1. ROLES
INSERT INTO "roles" ("id", "name", "created_at")
VALUES
  ('10000000-0000-0000-0000-000000000001', 'ADMIN', NOW()),
  ('10000000-0000-0000-0000-000000000002', 'MANAGER', NOW()),
  ('10000000-0000-0000-0000-000000000003', 'EMPLOYEE', NOW())
ON CONFLICT ("name") DO NOTHING;

-- Default password hash for all demo users: OrbitDemo2026! (Bcrypt 12 rounds)
-- Hash: $2b$12$7kP.5qA5d9tGq7E8Vb3Z.O6V8WcQW8Xb8Z6y9mK1R3l1O7z9x0w7u

-- 2. USERS (ADMIN & MANAGERS FIRST FOR FOREIGN KEYS)
INSERT INTO "users" (
  "id", "employee_code", "name", "email", "password_hash", "phone", 
  "role_id", "manager_id", "joining_date", "employment_status", "avatar_url", "is_active", "token_version", "created_at", "updated_at"
)
VALUES
  -- 2.1 Admin (Alex Morgan)
  (
    '11111111-1111-4111-8111-111111111111',
    'ORB-ADM01',
    'Alex Morgan',
    'admin@orbit.demo',
    '$2b$12$e8iVw6wW8hZk1P0vC6eHkO5QZ1x9Xwz4G8r2u7v9Y0n2k3m4l5o6.',
    '+1 (415) 555-1000',
    '10000000-0000-0000-0000-000000000001',
    NULL,
    '2025-01-12',
    'ACTIVE',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&crop=face',
    TRUE,
    1,
    NOW(),
    NOW()
  ),
  -- 2.2 Manager: Sarah Chen (Product Lead)
  (
    '22222222-2222-4222-8222-222222222222',
    'ORB-MGR01',
    'Sarah Chen',
    'manager@orbit.demo',
    '$2b$12$e8iVw6wW8hZk1P0vC6eHkO5QZ1x9Xwz4G8r2u7v9Y0n2k3m4l5o6.',
    '+1 (415) 555-1001',
    '10000000-0000-0000-0000-000000000002',
    '11111111-1111-4111-8111-111111111111',
    '2025-02-12',
    'ACTIVE',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&fit=crop&crop=face',
    TRUE,
    1,
    NOW(),
    NOW()
  ),
  -- 2.3 Manager: James Wilson (Engineering Lead)
  (
    '44444444-4444-4444-8444-444444444444',
    'ORB-MGR02',
    'James Wilson',
    'james.wilson@orbit.demo',
    '$2b$12$e8iVw6wW8hZk1P0vC6eHkO5QZ1x9Xwz4G8r2u7v9Y0n2k3m4l5o6.',
    '+1 (415) 555-1002',
    '10000000-0000-0000-0000-000000000002',
    '11111111-1111-4111-8111-111111111111',
    '2025-03-12',
    'ACTIVE',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&crop=face',
    TRUE,
    1,
    NOW(),
    NOW()
  ),
  -- 2.4 Manager: Olivia Bennett (Marketing Lead)
  (
    '66666666-6666-4666-8666-666666666666',
    'ORB-MGR03',
    'Olivia Bennett',
    'olivia.bennett@orbit.demo',
    '$2b$12$e8iVw6wW8hZk1P0vC6eHkO5QZ1x9Xwz4G8r2u7v9Y0n2k3m4l5o6.',
    '+1 (415) 555-1003',
    '10000000-0000-0000-0000-000000000002',
    '11111111-1111-4111-8111-111111111111',
    '2025-04-12',
    'ACTIVE',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&fit=crop&crop=face',
    TRUE,
    1,
    NOW(),
    NOW()
  ),
  -- 2.5 Employee: Noah Williams
  (
    '33333333-3333-4333-8333-333333333333',
    'ORB-EMP01',
    'Noah Williams',
    'employee@orbit.demo',
    '$2b$12$e8iVw6wW8hZk1P0vC6eHkO5QZ1x9Xwz4G8r2u7v9Y0n2k3m4l5o6.',
    '+1 (415) 555-1004',
    '10000000-0000-0000-0000-000000000003',
    '22222222-2222-4222-8222-222222222222',
    '2025-05-12',
    'ACTIVE',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&crop=face',
    TRUE,
    1,
    NOW(),
    NOW()
  ),
  -- 2.6 Employee: Emma Davis
  (
    '55555555-5555-4555-8555-555555555555',
    'ORB-EMP02',
    'Emma Davis',
    'other.employee@orbit.demo',
    '$2b$12$e8iVw6wW8hZk1P0vC6eHkO5QZ1x9Xwz4G8r2u7v9Y0n2k3m4l5o6.',
    '+1 (415) 555-1005',
    '10000000-0000-0000-0000-000000000003',
    '44444444-4444-4444-8444-444444444444',
    '2025-06-12',
    'ACTIVE',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&fit=crop&crop=face',
    TRUE,
    1,
    NOW(),
    NOW()
  ),
  -- 2.7 Employee: Liam Anderson
  (
    '77777777-7777-4777-8777-777777777777',
    'ORB-EMP03',
    'Liam Anderson',
    'liam.anderson@orbit.demo',
    '$2b$12$e8iVw6wW8hZk1P0vC6eHkO5QZ1x9Xwz4G8r2u7v9Y0n2k3m4l5o6.',
    '+1 (415) 555-1006',
    '10000000-0000-0000-0000-000000000003',
    '44444444-4444-4444-8444-444444444444',
    '2025-07-12',
    'ACTIVE',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&fit=crop&crop=face',
    TRUE,
    1,
    NOW(),
    NOW()
  ),
  -- 2.8 Employee: Ava Thompson
  (
    '88888888-8888-4888-8888-888888888888',
    'ORB-EMP04',
    'Ava Thompson',
    'ava.thompson@orbit.demo',
    '$2b$12$e8iVw6wW8hZk1P0vC6eHkO5QZ1x9Xwz4G8r2u7v9Y0n2k3m4l5o6.',
    '+1 (415) 555-1007',
    '10000000-0000-0000-0000-000000000003',
    '66666666-6666-4666-8666-666666666666',
    '2025-08-12',
    'ACTIVE',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&fit=crop&crop=face',
    TRUE,
    1,
    NOW(),
    NOW()
  )
ON CONFLICT ("email") DO NOTHING;

-- 3. TEAMS
INSERT INTO "teams" ("id", "name", "description", "manager_id", "created_at", "updated_at")
VALUES
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'Product & Design',
    'Shaping thoughtful experiences, design systems, and product ergonomics.',
    '22222222-2222-4222-8222-222222222222',
    NOW(),
    NOW()
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'Engineering',
    'Building high-performance cloud architecture, APIs, and web interfaces.',
    '44444444-4444-4444-8444-444444444444',
    NOW(),
    NOW()
  ),
  (
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'Growth & Marketing',
    'Connecting great software with customers and driving adoption metrics.',
    '66666666-6666-4666-8666-666666666666',
    NOW(),
    NOW()
  )
ON CONFLICT ("name") DO NOTHING;

-- 4. TEAM MEMBERS
INSERT INTO "team_members" ("id", "team_id", "user_id", "joined_at")
VALUES
  ('90000001-0000-0000-0000-000000000001', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '22222222-2222-4222-8222-222222222222', NOW()),
  ('90000001-0000-0000-0000-000000000002', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '33333333-3333-4333-8333-333333333333', NOW()),
  ('90000001-0000-0000-0000-000000000003', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '44444444-4444-4444-8444-444444444444', NOW()),
  ('90000001-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '55555555-5555-4555-8555-555555555555', NOW()),
  ('90000001-0000-0000-0000-000000000005', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '77777777-7777-4777-8777-777777777777', NOW()),
  ('90000001-0000-0000-0000-000000000006', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', '66666666-6666-4666-8666-666666666666', NOW()),
  ('90000001-0000-0000-0000-000000000007', 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', '88888888-8888-4888-8888-888888888888', NOW())
ON CONFLICT ("team_id", "user_id") DO NOTHING;

-- 5. PROJECTS
INSERT INTO "projects" ("id", "name", "description", "status", "team_id", "created_by", "created_at", "updated_at")
VALUES
  (
    'd0000000-0000-0000-0000-000000000001',
    'Orbit Workspace',
    'Core workforce orchestration portal and real-time activity hub.',
    'ACTIVE',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '22222222-2222-4222-8222-222222222222',
    NOW(),
    NOW()
  ),
  (
    'd0000000-0000-0000-0000-000000000002',
    'Customer Portal',
    'Self-service dashboard and project delivery tracking for clients.',
    'ACTIVE',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '44444444-4444-4444-8444-444444444444',
    NOW(),
    NOW()
  ),
  (
    'd0000000-0000-0000-0000-000000000003',
    'Brand Refresh 2026',
    'Global design system evolution, typography updates, and visual identity.',
    'ACTIVE',
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    '66666666-6666-4666-8666-666666666666',
    NOW(),
    NOW()
  )
ON CONFLICT ("team_id", "name") DO NOTHING;

-- 6. TASKS
INSERT INTO "tasks" (
  "id", "title", "description", "team_id", "project_id", "assignee_id", "created_by",
  "priority", "status", "due_date", "estimated_hours", "actual_hours", "version", "created_at", "updated_at"
)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'Redesign the onboarding experience',
    'Create a modern, friction-free onboarding wizard with step validation, role assignment, and guided tours.',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'd0000000-0000-0000-0000-000000000001',
    '33333333-3333-4333-8333-333333333333',
    '22222222-2222-4222-8222-222222222222',
    'HIGH',
    'IN_PROGRESS',
    CURRENT_DATE + INTERVAL '10 days',
    18.00,
    9.50,
    1,
    NOW() - INTERVAL '5 days',
    NOW()
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'Build interactive analytics charts',
    'Implement Recharts or Tremor visualizations for workforce workload, weekly task velocity, and team capacity.',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'd0000000-0000-0000-0000-000000000001',
    '55555555-5555-4555-8555-555555555555',
    '44444444-4444-4444-8444-444444444444',
    'URGENT',
    'TODO',
    CURRENT_DATE + INTERVAL '5 days',
    14.00,
    2.00,
    1,
    NOW() - INTERVAL '3 days',
    NOW()
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'Optimize PostgreSQL query latency on Supabase',
    'Add composite indexes on tasks(team_id, status) and users(email, is_active) to keep dashboard queries under 30ms.',
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    'd0000000-0000-0000-0000-000000000002',
    '77777777-7777-4777-8777-777777777777',
    '44444444-4444-4444-8444-444444444444',
    'HIGH',
    'IN_REVIEW',
    CURRENT_DATE + INTERVAL '3 days',
    8.00,
    7.50,
    1,
    NOW() - INTERVAL '7 days',
    NOW()
  ),
  (
    'e0000000-0000-0000-0000-000000000004',
    'Ship design system tokens and dark mode contrast',
    'Align Tailwind CSS colors, border radius, elevation tokens, and WCAG AA contrast compliance across dark mode.',
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    'd0000000-0000-0000-0000-000000000003',
    '33333333-3333-4333-8333-333333333333',
    '22222222-2222-4222-8222-222222222222',
    'MEDIUM',
    'COMPLETED',
    CURRENT_DATE - INTERVAL '2 days',
    12.00,
    11.00,
    1,
    NOW() - INTERVAL '14 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'e0000000-0000-0000-0000-000000000005',
    'Prepare Q4 product changelog & launch announcement',
    'Draft customer-facing release notes detailing team collaboration tools, kanban filters, and Supabase integration.',
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    'd0000000-0000-0000-0000-000000000003',
    '88888888-8888-4888-8888-888888888888',
    '66666666-6666-4666-8666-666666666666',
    'LOW',
    'BLOCKED',
    CURRENT_DATE + INTERVAL '18 days',
    6.00,
    1.50,
    1,
    NOW() - INTERVAL '2 days',
    NOW()
  )
ON CONFLICT ("id") DO NOTHING;

-- 7. TASK COMMENTS
INSERT INTO "task_comments" ("id", "task_id", "author_id", "comment", "created_at", "updated_at")
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    'Initial wireframes look great! Please ensure mobile responsive viewports are verified before closing.',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000001',
    '33333333-3333-4333-8333-333333333333',
    'Updated with 375px and 768px tablet layout variants. Ready for design team review.',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000003',
    '44444444-4444-4444-8444-444444444444',
    'Query plans look healthy in Supabase explain analyze. Down to 14ms from 180ms.',
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '3 hours'
  )
ON CONFLICT ("id") DO NOTHING;

-- 8. WORK ACTIVITIES (LOGGED HOURS & WORKLOGS)
INSERT INTO "work_activities" ("id", "task_id", "user_id", "description", "hours", "activity_date", "created_at")
VALUES
  (
    'a1000000-0000-0000-0000-000000000001',
    'e0000000-0000-0000-0000-000000000001',
    '33333333-3333-4333-8333-333333333333',
    'Constructed reusable multi-step stepper component with keyboard navigation.',
    5.50,
    CURRENT_DATE - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'a1000000-0000-0000-0000-000000000002',
    'e0000000-0000-0000-0000-000000000001',
    '33333333-3333-4333-8333-333333333333',
    'Implemented validation schemas with Zod and connected error feedback banners.',
    4.00,
    CURRENT_DATE - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    'a1000000-0000-0000-0000-000000000003',
    'e0000000-0000-0000-0000-000000000003',
    '77777777-7777-4777-8777-777777777777',
    'Created database migration adding btree indexes on foreign keys and compound status filters.',
    7.50,
    CURRENT_DATE,
    NOW()
  )
ON CONFLICT ("id") DO NOTHING;

-- 9. AUDIT LOGS
INSERT INTO "audit_logs" ("id", "actor_id", "action", "entity", "entity_id", "metadata", "created_at")
VALUES
  (
    gen_random_uuid(),
    '22222222-2222-4222-8222-222222222222',
    'TASK_CREATED',
    'Task',
    'e0000000-0000-0000-0000-000000000001',
    '{"title": "Redesign the onboarding experience", "priority": "HIGH"}'::jsonb,
    NOW() - INTERVAL '5 days'
  ),
  (
    gen_random_uuid(),
    '33333333-3333-4333-8333-333333333333',
    'STATUS_CHANGED',
    'Task',
    'e0000000-0000-0000-0000-000000000001',
    '{"from": "TODO", "to": "IN_PROGRESS"}'::jsonb,
    NOW() - INTERVAL '4 days'
  ),
  (
    gen_random_uuid(),
    '44444444-4444-4444-8444-444444444444',
    'TASK_CREATED',
    'Task',
    'e0000000-0000-0000-0000-000000000002',
    '{"title": "Build interactive analytics charts", "priority": "URGENT"}'::jsonb,
    NOW() - INTERVAL '3 days'
  )
ON CONFLICT DO NOTHING;

-- 10. NOTIFICATIONS
INSERT INTO "notifications" ("id", "user_id", "type", "title", "message", "entity_type", "entity_id", "is_read", "created_at")
VALUES
  (
    'b1000000-0000-0000-0000-000000000001',
    '33333333-3333-4333-8333-333333333333',
    'TASK_ASSIGNED',
    'New Task Assigned',
    'Sarah Chen assigned you to “Redesign the onboarding experience”.',
    'Task',
    'e0000000-0000-0000-0000-000000000001',
    FALSE,
    NOW() - INTERVAL '5 days'
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    '44444444-4444-4444-8444-444444444444',
    'TASK_STATUS_CHANGED',
    'Task Ready for Review',
    'Liam Anderson moved “Optimize PostgreSQL query latency on Supabase” to In Review.',
    'Task',
    'e0000000-0000-0000-0000-000000000003',
    TRUE,
    NOW() - INTERVAL '2 hours'
  )
ON CONFLICT ("id") DO NOTHING;
