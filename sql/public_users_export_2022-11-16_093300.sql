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

ALTER TABLE public.users ADD CONSTRAINT users_pkey PRIMARY KEY (id);insert into "public"."users" ("created_at", "email", "first_name", "fund", "id", "last_name", "password", "role", "startup", "updated_at") values ('2022-10-10 13:38:08.500162+00', 'hosakbenoliver@outlook.de', 'Ben', 'd7774c62-20be-4a7e-9cd6-3ab33cd71dbc', 'c77b65c0-7ece-4767-9a89-8260f5142c14', 'Hosak', '$2a$10$PpWgm/LDYmtShqFLtLHQuOA894IMMlwCdHXykUGhQBlG8EiQLw6Qe', 'Fund', NULL, '2022-10-10 13:38:08.500162+00');
insert into "public"."users" ("created_at", "email", "first_name", "fund", "id", "last_name", "password", "role", "startup", "updated_at") values ('2022-11-01 15:17:42.682234+00', 't@gmail.com', 'Tom', NULL, 'cc77e375-d080-401a-bf99-4acb04cb7096', 'Fenders', '$2a$10$PpWgm/LDYmtShqFLtLHQuOA894IMMlwCdHXykUGhQBlG8EiQLw6Qe', 'Startup', '01041536-a76f-43a5-a3e1-c0e76f8acefa', '2022-11-01 15:17:42.682234+00');
