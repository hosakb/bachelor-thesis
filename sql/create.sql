CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE
  IF NOT EXISTS startup (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    stage VARCHAR(255) NOT NULL,
    seed_phase_kpis JSONB NOT NULL DEFAULT '[]',
    startup_phase_kpis JSONB NOT NULL DEFAULT '[]',
    first_stage_kpis JSONB NOT NULL DEFAULT '[]',
    second_stage_kpis JSONB NOT NULL DEFAULT '[]',
    third_stage_kpis JSONB NOT NULL DEFAULT '[]',
    final_phase_kpis JSONB NOT NULL DEFAULT '[]',
    info JSONB NOT NULL DEFAULT '[]'
  );

CREATE TABLE
  IF NOT EXISTS fund (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    type VARCHAR(255) NOT NULL,
    fund_of_fund UUID,
    FOREIGN KEY(fund_of_fund) REFERENCES fund(id)
  );

CREATE TABLE
  IF NOT EXISTS fund_startup_map (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    fund_id UUID NOT NULL,
    startup_id UUID NOT NULL,
    FOREIGN KEY(fund_id) REFERENCES fund(id),
    FOREIGN KEY(startup_id) REFERENCES startup(id)
  );

CREATE TABLE
  IF NOT EXISTS users (
    id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    startup uuid,
    fund uuid,
    FOREIGN KEY(startup) REFERENCES startup(id),
    FOREIGN KEY(fund) REFERENCES fund(id)
  );

