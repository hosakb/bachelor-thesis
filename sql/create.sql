CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE public.fund (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  type character varying(255) NOT NULL,
  fund_of_fund uuid NULL
);

CREATE TABLE public.startup (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  stage character varying(255) NOT NULL,
  seed_phase_kpis jsonb NOT NULL DEFAULT '[]'::jsonb,
  startup_phase_kpis jsonb NOT NULL DEFAULT '[]'::jsonb,
  first_stage_kpis jsonb NOT NULL DEFAULT '[]'::jsonb,
  second_stage_kpis jsonb NOT NULL DEFAULT '[]'::jsonb,
  third_stage_kpis jsonb NOT NULL DEFAULT '[]'::jsonb,
  final_phase_kpis jsonb NOT NULL DEFAULT '[]'::jsonb,
  info jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE public.fund_startup_map (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  fund_id uuid NOT NULL,
  startup_id uuid NOT NULL
);

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  first_name character varying(255) NOT NULL,
  last_name character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  password character varying(255) NOT NULL,
  role character varying(255) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  startup uuid NULL,
  fund uuid NULL
);

ALTER TABLE public.fund ADD CONSTRAINT fund_pkey PRIMARY KEY (id);insert into "public"."fund" ("created_at", "fund_of_fund", "id", "name", "type", "updated_at") values ('2022-10-28 08:55:44.386598+00', NULL, 'd7774c62-20be-4a7e-9cd6-3ab33cd71dbc', 'Interalpen', 'singel', '2022-10-28 08:55:44.386598+00');

ALTER TABLE public.startup ADD CONSTRAINT startup_pkey PRIMARY KEY (id);insert into "public"."startup" ("created_at", "final_phase_kpis", "first_stage_kpis", "id", "info", "name", "second_stage_kpis", "seed_phase_kpis", "stage", "startup_phase_kpis", "third_stage_kpis", "updated_at") values ('2022-11-07 11:21:44.017168+00', '{}', '{}', 'f561d625-847a-42dd-b4eb-97ef763ad929', '{"0":{"share":10,"sector":"Fintech","totalInvestment":1000000}}', 'Second-Stage-Startup', '{"0":{"date":"2022-10-7","liquidity":"55","cashFlowRate":"44","netProfitMargin":"33"},"1":{"date":"2022-10-7","liquidity":"88","cashFlowRate":"55","netProfitMargin":"33"},"2":{"date":"2022-10-7","liquidity":"66","cashFlowRate":"33","netProfitMargin":"55"}}', '{}', 'second_stage', '{}', '{}', '2022-11-07 11:21:44.017168+00');
insert into "public"."startup" ("created_at", "final_phase_kpis", "first_stage_kpis", "id", "info", "name", "second_stage_kpis", "seed_phase_kpis", "stage", "startup_phase_kpis", "third_stage_kpis", "updated_at") values ('2022-11-07 11:19:39.312265+00', '{}', '{}', '444d8bd6-8c17-43ff-ad57-0abef37cfe1c', '{"0":{"share":10,"sector":"Fintech","totalInvestment":1000000}}', 'Seed-Phase-Startup', '{}', '{"0":{"date":"2022-10-7","liquidity":"55","cashFlowRate":"44","netProfitMargin":"33"},"1":{"date":"2022-10-7","liquidity":"88","cashFlowRate":"55","netProfitMargin":"33"},"2":{"date":"2022-10-7","liquidity":"66","cashFlowRate":"33","netProfitMargin":"55"}}', 'seed', '{}', '{}', '2022-11-07 11:19:39.312265+00');
insert into "public"."startup" ("created_at", "final_phase_kpis", "first_stage_kpis", "id", "info", "name", "second_stage_kpis", "seed_phase_kpis", "stage", "startup_phase_kpis", "third_stage_kpis", "updated_at") values ('2022-11-07 11:22:24.346527+00', '{}', '{}', 'c6144ed3-ac7a-4510-8e4a-c99d63c02f4c', '{"0":{"share":10,"sector":"Fintech","totalInvestment":1000000}}', 'Third-Stage-Startup', '{}', '{}', 'third_stage', '{}', '{"0":{"date":"2022-10-7","liquidity":"55","cashFlowRate":"44","netProfitMargin":"33"},"1":{"date":"2022-10-7","liquidity":"88","cashFlowRate":"55","netProfitMargin":"33"},"2":{"date":"2022-10-7","liquidity":"66","cashFlowRate":"33","netProfitMargin":"55"}}', '2022-11-07 11:22:24.346527+00');
insert into "public"."startup" ("created_at", "final_phase_kpis", "first_stage_kpis", "id", "info", "name", "second_stage_kpis", "seed_phase_kpis", "stage", "startup_phase_kpis", "third_stage_kpis", "updated_at") values ('2022-11-07 11:21:00.595697+00', '{}', '{"0":{"date":"2022-10-7","liquidity":"55","cashFlowRate":"44","netProfitMargin":"33"},"1":{"date":"2022-10-7","liquidity":"88","cashFlowRate":"55","netProfitMargin":"33"},"2":{"date":"2022-10-7","liquidity":"66","cashFlowRate":"33","netProfitMargin":"55"}}', '2f3f6b3d-065e-4297-b411-76c2d15993dc', '{"0":{"share":10,"sector":"Fintech","totalInvestment":1000000}}', 'First-Stage-Startup', '{}', '{}', 'first_stage', '{}', '{}', '2022-11-07 11:21:00.595697+00');
insert into "public"."startup" ("created_at", "final_phase_kpis", "first_stage_kpis", "id", "info", "name", "second_stage_kpis", "seed_phase_kpis", "stage", "startup_phase_kpis", "third_stage_kpis", "updated_at") values ('2022-11-07 11:22:50.683292+00', '{"0":{"date":"2022-10-7","liquidity":"55","cashFlowRate":"44","netProfitMargin":"33"},"1":{"date":"2022-10-7","liquidity":"88","cashFlowRate":"55","netProfitMargin":"33"},"2":{"date":"2022-10-7","liquidity":"66","cashFlowRate":"33","netProfitMargin":"55"}}', '{}', '72f92aed-b7ce-42f4-9572-01437d6c3bdb', '{"0":{"share":10,"sector":"Fintech","totalInvestment":1000000}}', 'Final-Phase-Startup', '{}', '{}', 'final', '{}', '{}', '2022-11-07 11:22:50.683292+00');
insert into "public"."startup" ("created_at", "final_phase_kpis", "first_stage_kpis", "id", "info", "name", "second_stage_kpis", "seed_phase_kpis", "stage", "startup_phase_kpis", "third_stage_kpis", "updated_at") values ('2022-11-06 17:01:09.340837+00', '{"0":{"date":"2022-10-7","liquidity":"55","cashFlowRate":"44","netProfitMargin":"33"},"1":{"date":"2022-10-7","liquidity":"88","cashFlowRate":"55","netProfitMargin":"33"},"2":{"date":"2022-10-7","liquidity":"66","cashFlowRate":"33","netProfitMargin":"55"}}', '{"0":{"date":"2022-10-7","liquidity":"55","cashFlowRate":"44","netProfitMargin":"33"},"1":{"date":"2022-10-7","liquidity":"88","cashFlowRate":"55","netProfitMargin":"33"},"2":{"date":"2022-10-7","liquidity":"66","cashFlowRate":"33","netProfitMargin":"55"}}', '01041536-a76f-43a5-a3e1-c0e76f8acefa', '{"0":{"share":10,"sector":"Fintech","totalInvestment":1000000}}', 'Startup-Phase-Startup', '{"0":{"date":"2022-10-7","liquidity":"55","cashFlowRate":"44","netProfitMargin":"33"},"1":{"date":"2022-10-7","liquidity":"88","cashFlowRate":"55","netProfitMargin":"33"},"2":{"date":"2022-10-7","liquidity":"66","cashFlowRate":"33","netProfitMargin":"55"}}', '{"0":{"date":"2022-10-7","liquidity":"55","cashFlowRate":"44","netProfitMargin":"33"},"1":{"date":"2022-10-7","liquidity":"88","cashFlowRate":"55","netProfitMargin":"33"},"2":{"date":"2022-10-7","liquidity":"66","cashFlowRate":"33","netProfitMargin":"55"}}', 'startup', '{"0":{"date":"2022-10-7","liquidity":"55","cashFlowRate":"44","netProfitMargin":"33"},"1":{"date":"2022-10-7","liquidity":"88","cashFlowRate":"55","netProfitMargin":"33"},"2":{"date":"2022-10-7","liquidity":"66","cashFlowRate":"33","netProfitMargin":"55"},"3":{"date":"2022-10-7","liquidity":"34","cashFlowRate":"90","netProfitMargin":"67"},"4":{"date":"2022-11-05","liquidity":"34","cashFlowRate":"22","netProfitMargin":"19"}}', '{"0":{"date":"2022-10-7","liquidity":"55","cashFlowRate":"44","netProfitMargin":"33"},"1":{"date":"2022-10-7","liquidity":"88","cashFlowRate":"55","netProfitMargin":"33"},"2":{"date":"2022-10-7","liquidity":"66","cashFlowRate":"33","netProfitMargin":"55"}}', '2022-11-07 19:54:21.330831+00');

ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);insert into "public"."users" ("created_at", "email", "first_name", "fund", "id", "last_name", "password", "role", "startup", "updated_at") values ('2022-10-10 13:38:08.500162+00', 'hosakbenoliver@outlook.de', 'Ben', 'd7774c62-20be-4a7e-9cd6-3ab33cd71dbc', 'c77b65c0-7ece-4767-9a89-8260f5142c14', 'Hosak', '$2a$10$PpWgm/LDYmtShqFLtLHQuOA894IMMlwCdHXykUGhQBlG8EiQLw6Qe', 'Fund', NULL, '2022-10-10 13:38:08.500162+00');
insert into "public"."users" ("created_at", "email", "first_name", "fund", "id", "last_name", "password", "role", "startup", "updated_at") values ('2022-11-01 15:17:42.682234+00', 't@gmail.com', 'Tom', NULL, 'cc77e375-d080-401a-bf99-4acb04cb7096', 'Fenders', '$2a$10$PpWgm/LDYmtShqFLtLHQuOA894IMMlwCdHXykUGhQBlG8EiQLw6Qe', 'Startup', '01041536-a76f-43a5-a3e1-c0e76f8acefa', '2022-11-01 15:17:42.682234+00');

ALTER TABLE public.fund_startup_map ADD CONSTRAINT fund_startup_map_pkey PRIMARY KEY (id);insert into "public"."fund_startup_map" ("fund_id", "id", "startup_id") values ('d7774c62-20be-4a7e-9cd6-3ab33cd71dbc', '9f376f74-d053-4b23-8d87-82c466f34fa7', '01041536-a76f-43a5-a3e1-c0e76f8acefa');
insert into "public"."fund_startup_map" ("fund_id", "id", "startup_id") values ('d7774c62-20be-4a7e-9cd6-3ab33cd71dbc', '090f12a1-7f01-4775-849d-4ee9bb631a8b', '2f3f6b3d-065e-4297-b411-76c2d15993dc');
insert into "public"."fund_startup_map" ("fund_id", "id", "startup_id") values ('d7774c62-20be-4a7e-9cd6-3ab33cd71dbc', 'ee5a42e1-751e-4208-9547-1e40a725cc54', '444d8bd6-8c17-43ff-ad57-0abef37cfe1c');
insert into "public"."fund_startup_map" ("fund_id", "id", "startup_id") values ('d7774c62-20be-4a7e-9cd6-3ab33cd71dbc', '3a80dad4-de00-41d5-89c0-33ea01297db7', '72f92aed-b7ce-42f4-9572-01437d6c3bdb');
insert into "public"."fund_startup_map" ("fund_id", "id", "startup_id") values ('d7774c62-20be-4a7e-9cd6-3ab33cd71dbc', '34f606f9-b58d-459c-bc4a-1eb9df42fddb', 'c6144ed3-ac7a-4510-8e4a-c99d63c02f4c');
insert into "public"."fund_startup_map" ("fund_id", "id", "startup_id") values ('d7774c62-20be-4a7e-9cd6-3ab33cd71dbc', 'f11d9fc0-6511-4139-9408-12c0c6c16c7e', 'f561d625-847a-42dd-b4eb-97ef763ad929');

