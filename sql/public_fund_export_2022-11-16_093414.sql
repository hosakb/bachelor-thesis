CREATE TABLE public.fund (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name character varying(255) NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  type character varying(255) NOT NULL,
  fund_of_fund uuid NULL
);

ALTER TABLE public.fund ADD CONSTRAINT fund_pkey PRIMARY KEY (id);insert into "public"."fund" ("created_at", "fund_of_fund", "id", "name", "type", "updated_at") values ('2022-10-28 08:55:44.386598+00', NULL, 'd7774c62-20be-4a7e-9cd6-3ab33cd71dbc', 'Interalpen', 'singel', '2022-10-28 08:55:44.386598+00');
