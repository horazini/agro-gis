--
-- PostgreSQL database dump
--

-- Dumped from database version 14.7
-- Dumped by pg_dump version 14.7

-- Started on 2023-11-29 20:59:41

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 2 (class 3079 OID 16384)
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- TOC entry 5514 (class 0 OID 0)
-- Dependencies: 2
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


--
-- TOC entry 7 (class 3079 OID 18198)
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- TOC entry 5515 (class 0 OID 0)
-- Dependencies: 7
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- TOC entry 3 (class 3079 OID 16403)
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- TOC entry 5516 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- TOC entry 4 (class 3079 OID 17453)
-- Name: postgis_raster; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_raster WITH SCHEMA public;


--
-- TOC entry 5517 (class 0 OID 0)
-- Dependencies: 4
-- Name: EXTENSION postgis_raster; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_raster IS 'PostGIS raster types and functions';


--
-- TOC entry 6 (class 3079 OID 18173)
-- Name: postgis_sfcgal; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_sfcgal WITH SCHEMA public;


--
-- TOC entry 5518 (class 0 OID 0)
-- Dependencies: 6
-- Name: EXTENSION postgis_sfcgal; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_sfcgal IS 'PostGIS SFCGAL functions';


--
-- TOC entry 10 (class 3079 OID 18254)
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- TOC entry 5519 (class 0 OID 0)
-- Dependencies: 10
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- TOC entry 5 (class 3079 OID 18011)
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- TOC entry 5520 (class 0 OID 0)
-- Dependencies: 5
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 315 (class 1259 OID 24699)
-- Name: crop; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crop (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    landplot_id integer NOT NULL,
    landplot_area public.geometry NOT NULL,
    landplot_circle_center public.geometry,
    landplot_circle_radius double precision,
    landplot_description character varying(500),
    species_id integer NOT NULL,
    species_name character varying(100) NOT NULL,
    species_description character varying(500),
    description character varying(500),
    comments character varying(5000),
    start_date date NOT NULL,
    finish_date date,
    weight_in_tons integer,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.crop OWNER TO postgres;

--
-- TOC entry 319 (class 1259 OID 24742)
-- Name: crop_event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crop_event (
    id integer NOT NULL,
    crop_id integer NOT NULL,
    crop_stage_id integer NOT NULL,
    species_growth_event_id integer,
    name character varying(100) NOT NULL,
    description character varying(500),
    species_growth_event_et_from_stage_start interval,
    species_growth_event_time_period interval,
    due_date date,
    done_date date
);


ALTER TABLE public.crop_event OWNER TO postgres;

--
-- TOC entry 318 (class 1259 OID 24741)
-- Name: crop_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.crop_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crop_event_id_seq OWNER TO postgres;

--
-- TOC entry 5521 (class 0 OID 0)
-- Dependencies: 318
-- Name: crop_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.crop_event_id_seq OWNED BY public.crop_event.id;


--
-- TOC entry 314 (class 1259 OID 24698)
-- Name: crop_id_seq1; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.crop_id_seq1
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crop_id_seq1 OWNER TO postgres;

--
-- TOC entry 5522 (class 0 OID 0)
-- Dependencies: 314
-- Name: crop_id_seq1; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.crop_id_seq1 OWNED BY public.crop.id;


--
-- TOC entry 317 (class 1259 OID 24723)
-- Name: crop_stage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.crop_stage (
    id integer NOT NULL,
    crop_id integer NOT NULL,
    species_growth_stage_id integer NOT NULL,
    species_growth_stage_name character varying(100) NOT NULL,
    species_growth_stage_description character varying(500),
    species_growth_stage_estimated_time interval NOT NULL,
    species_growth_stage_sequence_number integer NOT NULL,
    comments character varying(500),
    start_date date,
    finish_date date
);


ALTER TABLE public.crop_stage OWNER TO postgres;

--
-- TOC entry 316 (class 1259 OID 24722)
-- Name: crop_stage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.crop_stage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.crop_stage_id_seq OWNER TO postgres;

--
-- TOC entry 5523 (class 0 OID 0)
-- Dependencies: 316
-- Name: crop_stage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.crop_stage_id_seq OWNED BY public.crop_stage.id;


--
-- TOC entry 309 (class 1259 OID 24608)
-- Name: landplot; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.landplot (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    area public.geometry NOT NULL,
    description character varying(500),
    circle_center public.geometry,
    circle_radius double precision,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.landplot OWNER TO postgres;

--
-- TOC entry 308 (class 1259 OID 24607)
-- Name: landplot_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.landplot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.landplot_id_seq OWNER TO postgres;

--
-- TOC entry 5524 (class 0 OID 0)
-- Dependencies: 308
-- Name: landplot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.landplot_id_seq OWNED BY public.landplot.id;


--
-- TOC entry 321 (class 1259 OID 24767)
-- Name: landplot_snapshot; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.landplot_snapshot (
    id integer NOT NULL,
    image bytea NOT NULL,
    landplot_id integer NOT NULL,
    crop_id integer,
    crop_stage_id integer,
    date date
);


ALTER TABLE public.landplot_snapshot OWNER TO postgres;

--
-- TOC entry 320 (class 1259 OID 24766)
-- Name: landplot_snapshot_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.landplot_snapshot_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.landplot_snapshot_id_seq OWNER TO postgres;

--
-- TOC entry 5525 (class 0 OID 0)
-- Dependencies: 320
-- Name: landplot_snapshot_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.landplot_snapshot_id_seq OWNED BY public.landplot_snapshot.id;


--
-- TOC entry 222 (class 1259 OID 16395)
-- Name: species; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.species (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    tenant_id integer NOT NULL,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.species OWNER TO postgres;

--
-- TOC entry 5526 (class 0 OID 0)
-- Dependencies: 222
-- Name: COLUMN species.description; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.species.description IS '300';


--
-- TOC entry 313 (class 1259 OID 24655)
-- Name: species_growth_event; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.species_growth_event (
    id integer NOT NULL,
    species_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    reference_stage integer NOT NULL,
    et_from_stage_start interval NOT NULL,
    time_period interval
);


ALTER TABLE public.species_growth_event OWNER TO postgres;

--
-- TOC entry 312 (class 1259 OID 24654)
-- Name: species_growth_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.species_growth_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.species_growth_event_id_seq OWNER TO postgres;

--
-- TOC entry 5527 (class 0 OID 0)
-- Dependencies: 312
-- Name: species_growth_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.species_growth_event_id_seq OWNED BY public.species_growth_event.id;


--
-- TOC entry 311 (class 1259 OID 24641)
-- Name: species_growth_stage; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.species_growth_stage (
    id integer NOT NULL,
    species_id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500),
    estimated_time interval NOT NULL,
    sequence_number integer NOT NULL
);


ALTER TABLE public.species_growth_stage OWNER TO postgres;

--
-- TOC entry 310 (class 1259 OID 24640)
-- Name: species_growth_stage_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.species_growth_stage_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.species_growth_stage_id_seq OWNER TO postgres;

--
-- TOC entry 5528 (class 0 OID 0)
-- Dependencies: 310
-- Name: species_growth_stage_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.species_growth_stage_id_seq OWNED BY public.species_growth_stage.id;


--
-- TOC entry 221 (class 1259 OID 16394)
-- Name: species_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.species_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.species_id_seq OWNER TO postgres;

--
-- TOC entry 5529 (class 0 OID 0)
-- Dependencies: 221
-- Name: species_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.species_id_seq OWNED BY public.species.id;


--
-- TOC entry 303 (class 1259 OID 24577)
-- Name: tenant; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tenant (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    deleted boolean DEFAULT false NOT NULL,
    representatives_names character varying(50) NOT NULL,
    representatives_surname character varying(50) NOT NULL,
    locality character varying(50) NOT NULL,
    email character varying(50) NOT NULL,
    phone character varying(20) NOT NULL,
    created timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.tenant OWNER TO postgres;

--
-- TOC entry 302 (class 1259 OID 24576)
-- Name: tenant_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tenant_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tenant_id_seq OWNER TO postgres;

--
-- TOC entry 5530 (class 0 OID 0)
-- Dependencies: 302
-- Name: tenant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tenant_id_seq OWNED BY public.tenant.id;


--
-- TOC entry 307 (class 1259 OID 24591)
-- Name: user_account; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_account (
    id integer NOT NULL,
    tenant_id integer NOT NULL,
    usertype_id integer NOT NULL,
    mail_address character varying(100) NOT NULL,
    username character varying(50) NOT NULL,
    names character varying(50) NOT NULL,
    surname character varying(50) NOT NULL,
    password_hash character varying(255) NOT NULL,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.user_account OWNER TO postgres;

--
-- TOC entry 306 (class 1259 OID 24590)
-- Name: user_account_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_account_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_account_id_seq OWNER TO postgres;

--
-- TOC entry 5531 (class 0 OID 0)
-- Dependencies: 306
-- Name: user_account_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_account_id_seq OWNED BY public.user_account.id;


--
-- TOC entry 305 (class 1259 OID 24584)
-- Name: usertype; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.usertype (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);


ALTER TABLE public.usertype OWNER TO postgres;

--
-- TOC entry 304 (class 1259 OID 24583)
-- Name: usertype_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.usertype_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.usertype_id_seq OWNER TO postgres;

--
-- TOC entry 5532 (class 0 OID 0)
-- Dependencies: 304
-- Name: usertype_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.usertype_id_seq OWNED BY public.usertype.id;


--
-- TOC entry 5166 (class 2604 OID 33019)
-- Name: crop id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop ALTER COLUMN id SET DEFAULT nextval('public.crop_id_seq1'::regclass);


--
-- TOC entry 5168 (class 2604 OID 33020)
-- Name: crop_event id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_event ALTER COLUMN id SET DEFAULT nextval('public.crop_event_id_seq'::regclass);


--
-- TOC entry 5167 (class 2604 OID 33021)
-- Name: crop_stage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_stage ALTER COLUMN id SET DEFAULT nextval('public.crop_stage_id_seq'::regclass);


--
-- TOC entry 5162 (class 2604 OID 33022)
-- Name: landplot id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landplot ALTER COLUMN id SET DEFAULT nextval('public.landplot_id_seq'::regclass);


--
-- TOC entry 5169 (class 2604 OID 33023)
-- Name: landplot_snapshot id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landplot_snapshot ALTER COLUMN id SET DEFAULT nextval('public.landplot_snapshot_id_seq'::regclass);


--
-- TOC entry 5083 (class 2604 OID 33024)
-- Name: species id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species ALTER COLUMN id SET DEFAULT nextval('public.species_id_seq'::regclass);


--
-- TOC entry 5164 (class 2604 OID 33025)
-- Name: species_growth_event id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_growth_event ALTER COLUMN id SET DEFAULT nextval('public.species_growth_event_id_seq'::regclass);


--
-- TOC entry 5163 (class 2604 OID 33026)
-- Name: species_growth_stage id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_growth_stage ALTER COLUMN id SET DEFAULT nextval('public.species_growth_stage_id_seq'::regclass);


--
-- TOC entry 5157 (class 2604 OID 33027)
-- Name: tenant id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant ALTER COLUMN id SET DEFAULT nextval('public.tenant_id_seq'::regclass);


--
-- TOC entry 5160 (class 2604 OID 33028)
-- Name: user_account id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account ALTER COLUMN id SET DEFAULT nextval('public.user_account_id_seq'::regclass);


--
-- TOC entry 5158 (class 2604 OID 33029)
-- Name: usertype id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usertype ALTER COLUMN id SET DEFAULT nextval('public.usertype_id_seq'::regclass);


--
-- TOC entry 5487 (class 0 OID 24577)
-- Dependencies: 303
-- Data for Name: tenant; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.tenant VALUES (1, 'service admin', false, 'Juan', 'Perez', 'Corrientes', 'default@mail.com', '3794000000', '2023-11-02 16:42:26.248455');


--
-- TOC entry 5077 (class 0 OID 18230)
-- Dependencies: 248
-- Data for Name: us_gaz; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5075 (class 0 OID 18218)
-- Dependencies: 246
-- Data for Name: us_lex; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5076 (class 0 OID 18242)
-- Dependencies: 250
-- Data for Name: us_rules; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 5491 (class 0 OID 24591)
-- Dependencies: 307
-- Data for Name: user_account; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.user_account VALUES (1, 1, 1, 'default@gmail.com', 'admin', 'Juan Pedro', 'Perez', '$2a$10$IKfb8LgJfzoMZEdLlGgqP.wEuTpFNLbDXPsigdfEiZwC2PLwWQldW', false);


--
-- TOC entry 5489 (class 0 OID 24584)
-- Dependencies: 305
-- Data for Name: usertype; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public.usertype VALUES (2, 'Gerente administrativo');
INSERT INTO public.usertype VALUES (3, 'Gerente agrónomo');
INSERT INTO public.usertype VALUES (4, 'Especialista en suelos');
INSERT INTO public.usertype VALUES (5, 'Botánico ');
INSERT INTO public.usertype VALUES (6, 'Agricultor');
INSERT INTO public.usertype VALUES (1, 'Administrador del servicio');


--
-- TOC entry 5078 (class 0 OID 18260)
-- Dependencies: 252
-- Data for Name: geocode_settings; Type: TABLE DATA; Schema: tiger; Owner: postgres
--



--
-- TOC entry 5079 (class 0 OID 18592)
-- Dependencies: 297
-- Data for Name: pagc_gaz; Type: TABLE DATA; Schema: tiger; Owner: postgres
--



--
-- TOC entry 5080 (class 0 OID 18602)
-- Dependencies: 299
-- Data for Name: pagc_lex; Type: TABLE DATA; Schema: tiger; Owner: postgres
--



--
-- TOC entry 5081 (class 0 OID 18612)
-- Dependencies: 301
-- Data for Name: pagc_rules; Type: TABLE DATA; Schema: tiger; Owner: postgres
--



--
-- TOC entry 5073 (class 0 OID 18013)
-- Dependencies: 239
-- Data for Name: topology; Type: TABLE DATA; Schema: topology; Owner: postgres
--



--
-- TOC entry 5074 (class 0 OID 18025)
-- Dependencies: 240
-- Data for Name: layer; Type: TABLE DATA; Schema: topology; Owner: postgres
--



--
-- TOC entry 5533 (class 0 OID 0)
-- Dependencies: 318
-- Name: crop_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.crop_event_id_seq', 121, true);


--
-- TOC entry 5534 (class 0 OID 0)
-- Dependencies: 314
-- Name: crop_id_seq1; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.crop_id_seq1', 41, true);


--
-- TOC entry 5535 (class 0 OID 0)
-- Dependencies: 316
-- Name: crop_stage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.crop_stage_id_seq', 95, true);


--
-- TOC entry 5536 (class 0 OID 0)
-- Dependencies: 308
-- Name: landplot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.landplot_id_seq', 95, true);


--
-- TOC entry 5537 (class 0 OID 0)
-- Dependencies: 320
-- Name: landplot_snapshot_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.landplot_snapshot_id_seq', 36, true);


--
-- TOC entry 5538 (class 0 OID 0)
-- Dependencies: 312
-- Name: species_growth_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.species_growth_event_id_seq', 21, true);


--
-- TOC entry 5539 (class 0 OID 0)
-- Dependencies: 310
-- Name: species_growth_stage_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.species_growth_stage_id_seq', 45, true);


--
-- TOC entry 5540 (class 0 OID 0)
-- Dependencies: 221
-- Name: species_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.species_id_seq', 58, true);


--
-- TOC entry 5541 (class 0 OID 0)
-- Dependencies: 302
-- Name: tenant_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tenant_id_seq', 23, true);


--
-- TOC entry 5542 (class 0 OID 0)
-- Dependencies: 306
-- Name: user_account_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_account_id_seq', 17, true);


--
-- TOC entry 5543 (class 0 OID 0)
-- Dependencies: 304
-- Name: usertype_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.usertype_id_seq', 1, true);


--
-- TOC entry 5317 (class 2606 OID 24749)
-- Name: crop_event crop_event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_event
    ADD CONSTRAINT crop_event_pkey PRIMARY KEY (id);


--
-- TOC entry 5313 (class 2606 OID 24706)
-- Name: crop crop_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop
    ADD CONSTRAINT crop_pkey1 PRIMARY KEY (id);


--
-- TOC entry 5315 (class 2606 OID 24730)
-- Name: crop_stage crop_stage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_stage
    ADD CONSTRAINT crop_stage_pkey PRIMARY KEY (id);


--
-- TOC entry 5307 (class 2606 OID 24615)
-- Name: landplot landplot_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landplot
    ADD CONSTRAINT landplot_pkey PRIMARY KEY (id);


--
-- TOC entry 5319 (class 2606 OID 24774)
-- Name: landplot_snapshot landplot_snapshot_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landplot_snapshot
    ADD CONSTRAINT landplot_snapshot_pkey PRIMARY KEY (id);


--
-- TOC entry 5311 (class 2606 OID 24662)
-- Name: species_growth_event species_growth_event_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_growth_event
    ADD CONSTRAINT species_growth_event_pkey PRIMARY KEY (id);


--
-- TOC entry 5309 (class 2606 OID 24648)
-- Name: species_growth_stage species_growth_stage_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_growth_stage
    ADD CONSTRAINT species_growth_stage_pkey PRIMARY KEY (id);


--
-- TOC entry 5171 (class 2606 OID 16402)
-- Name: species species_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_pkey PRIMARY KEY (id);


--
-- TOC entry 5301 (class 2606 OID 24582)
-- Name: tenant tenant_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tenant
    ADD CONSTRAINT tenant_pkey PRIMARY KEY (id);


--
-- TOC entry 5305 (class 2606 OID 24596)
-- Name: user_account user_account_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_pkey PRIMARY KEY (id);


--
-- TOC entry 5303 (class 2606 OID 24589)
-- Name: usertype usertype_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.usertype
    ADD CONSTRAINT usertype_pkey PRIMARY KEY (id);


--
-- TOC entry 5332 (class 2606 OID 24750)
-- Name: crop_event crop_event_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_event
    ADD CONSTRAINT crop_event_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES public.crop(id);


--
-- TOC entry 5333 (class 2606 OID 24755)
-- Name: crop_event crop_event_crop_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_event
    ADD CONSTRAINT crop_event_crop_stage_id_fkey FOREIGN KEY (crop_stage_id) REFERENCES public.crop_stage(id);


--
-- TOC entry 5334 (class 2606 OID 24760)
-- Name: crop_event crop_event_species_growth_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_event
    ADD CONSTRAINT crop_event_species_growth_event_id_fkey FOREIGN KEY (species_growth_event_id) REFERENCES public.species_growth_event(id);


--
-- TOC entry 5327 (class 2606 OID 24712)
-- Name: crop crop_landplot_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop
    ADD CONSTRAINT crop_landplot_id_fkey1 FOREIGN KEY (landplot_id) REFERENCES public.landplot(id);


--
-- TOC entry 5328 (class 2606 OID 24717)
-- Name: crop crop_species_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop
    ADD CONSTRAINT crop_species_id_fkey1 FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- TOC entry 5330 (class 2606 OID 24731)
-- Name: crop_stage crop_stage_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_stage
    ADD CONSTRAINT crop_stage_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES public.crop(id);


--
-- TOC entry 5331 (class 2606 OID 24736)
-- Name: crop_stage crop_stage_species_growth_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop_stage
    ADD CONSTRAINT crop_stage_species_growth_stage_id_fkey FOREIGN KEY (species_growth_stage_id) REFERENCES public.species_growth_stage(id);


--
-- TOC entry 5329 (class 2606 OID 24707)
-- Name: crop crop_tenant_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.crop
    ADD CONSTRAINT crop_tenant_id_fkey1 FOREIGN KEY (tenant_id) REFERENCES public.tenant(id);


--
-- TOC entry 5335 (class 2606 OID 24780)
-- Name: landplot_snapshot landplot_snapshot_crop_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landplot_snapshot
    ADD CONSTRAINT landplot_snapshot_crop_id_fkey FOREIGN KEY (crop_id) REFERENCES public.crop(id);


--
-- TOC entry 5336 (class 2606 OID 24785)
-- Name: landplot_snapshot landplot_snapshot_crop_stage_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landplot_snapshot
    ADD CONSTRAINT landplot_snapshot_crop_stage_id_fkey FOREIGN KEY (crop_stage_id) REFERENCES public.crop_stage(id);


--
-- TOC entry 5337 (class 2606 OID 24775)
-- Name: landplot_snapshot landplot_snapshot_landplot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landplot_snapshot
    ADD CONSTRAINT landplot_snapshot_landplot_id_fkey FOREIGN KEY (landplot_id) REFERENCES public.landplot(id);


--
-- TOC entry 5323 (class 2606 OID 24616)
-- Name: landplot landplot_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.landplot
    ADD CONSTRAINT landplot_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenant(id);


--
-- TOC entry 5325 (class 2606 OID 24668)
-- Name: species_growth_event species_growth_event_reference_stage_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_growth_event
    ADD CONSTRAINT species_growth_event_reference_stage_fkey FOREIGN KEY (reference_stage) REFERENCES public.species_growth_stage(id);


--
-- TOC entry 5326 (class 2606 OID 24663)
-- Name: species_growth_event species_growth_event_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_growth_event
    ADD CONSTRAINT species_growth_event_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- TOC entry 5324 (class 2606 OID 24649)
-- Name: species_growth_stage species_growth_stage_species_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species_growth_stage
    ADD CONSTRAINT species_growth_stage_species_id_fkey FOREIGN KEY (species_id) REFERENCES public.species(id);


--
-- TOC entry 5320 (class 2606 OID 24635)
-- Name: species species_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.species
    ADD CONSTRAINT species_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenant(id) NOT VALID;


--
-- TOC entry 5321 (class 2606 OID 24597)
-- Name: user_account user_account_tenant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenant(id);


--
-- TOC entry 5322 (class 2606 OID 24602)
-- Name: user_account user_account_usertype_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_account
    ADD CONSTRAINT user_account_usertype_id_fkey FOREIGN KEY (usertype_id) REFERENCES public.usertype(id);


-- Completed on 2023-11-29 20:59:42

--
-- PostgreSQL database dump complete
--


