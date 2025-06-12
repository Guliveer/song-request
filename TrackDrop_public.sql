--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 16.1

-- Started on 2025-06-13 00:55:13 CEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = on;

--
-- TOC entry 16 (class 2615 OID 2200)
-- Name: public; Type: SCHEMA; Schema: -; Owner: pg_database_owner
--

CREATE SCHEMA public;


ALTER SCHEMA public OWNER TO pg_database_owner;

--
-- TOC entry 4053 (class 0 OID 0)
-- Dependencies: 16
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: pg_database_owner
--

COMMENT ON SCHEMA public IS 'standard public schema';


--
-- TOC entry 1344 (class 1247 OID 139955)
-- Name: notification_type; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.notification_type AS ENUM (
    'new_follower',
    'song_like',
    'song_comment'
);


ALTER TYPE public.notification_type OWNER TO postgres;

--
-- TOC entry 577 (class 1255 OID 62424)
-- Name: calculate_current_score(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.calculate_current_score(target_song_id bigint) RETURNS bigint
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
DECLARE
    current_score bigint;
BEGIN
    SELECT COALESCE(SUM(vote), 0) INTO current_score
    FROM votes
    WHERE votes.song_id = target_song_id;

    RETURN current_score; -- Return the calculated score
END;
$$;


ALTER FUNCTION public.calculate_current_score(target_song_id bigint) OWNER TO postgres;

--
-- TOC entry 484 (class 1255 OID 67516)
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO ''
    AS $$
begin
  insert into public.users (id, username)
  values (new.id, new.raw_user_meta_data ->> 'username');
  return new;
end;
$$;


ALTER FUNCTION public.handle_new_user() OWNER TO postgres;

--
-- TOC entry 634 (class 1255 OID 52515)
-- Name: insert_user_data(text); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.insert_user_data(user_email text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    SET search_path = 'public';  -- Set the search path to the public schema

    -- Insert user data into the users table if it doesn't already exist
    INSERT INTO public.users ("user", username, color)
    VALUES (auth.uid(), split_part(user_email, '@', 1))
    ON CONFLICT ("user") DO NOTHING;  -- Prevent duplicate entries based on the user ID
END;
$$;


ALTER FUNCTION public.insert_user_data(user_email text) OWNER TO postgres;

--
-- TOC entry 625 (class 1255 OID 62486)
-- Name: trigger_update_queue_score(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.trigger_update_queue_score() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'public'
    AS $$
BEGIN
    -- Check if the operation is an INSERT or UPDATE
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        PERFORM update_queue_score(NEW.song_id); -- Use NEW.song_id for the inserted/updated vote
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_queue_score(OLD.song_id); -- Use OLD.song_id for the deleted vote
    END IF;
    RETURN NEW; -- Return the new row for INSERT/UPDATE, or OLD for DELETE
END;
$$;


ALTER FUNCTION public.trigger_update_queue_score() OWNER TO postgres;

--
-- TOC entry 626 (class 1255 OID 62800)
-- Name: update_queue_score(bigint); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_queue_score(target_song_id bigint) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Update the queue score using the helper function
    UPDATE queue
    SET score = calculate_current_score(target_song_id)
    WHERE id = target_song_id; -- Specify the table name to avoid ambiguity
END;
$$;


ALTER FUNCTION public.update_queue_score(target_song_id bigint) OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 366 (class 1259 OID 94788)
-- Name: banned_url; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.banned_url (
    id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
    url text NOT NULL
);


ALTER TABLE public.banned_url OWNER TO postgres;

--
-- TOC entry 368 (class 1259 OID 139962)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id uuid NOT NULL,
    sender_id uuid,
    type public.notification_type NOT NULL,
    message text NOT NULL,
    link text,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 367 (class 1259 OID 139961)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 369 (class 1259 OID 150109)
-- Name: playlists; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.playlists (
    id bigint NOT NULL,
    name text NOT NULL,
    host uuid DEFAULT auth.uid() NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    banned_users uuid[],
    banned_songs text[],
    url text NOT NULL,
    description text,
    moderators uuid[],
    created_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL,
    CONSTRAINT url_valid CHECK ((url ~ '^[a-zA-Z-]+$'::text))
);


ALTER TABLE public.playlists OWNER TO postgres;

--
-- TOC entry 4063 (class 0 OID 0)
-- Dependencies: 369
-- Name: TABLE playlists; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.playlists IS 'Custom queues made by users';


--
-- TOC entry 370 (class 1259 OID 150112)
-- Name: playlists_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.playlists ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.playlists_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 357 (class 1259 OID 29291)
-- Name: queue; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.queue (
    id bigint NOT NULL,
    title text,
    author text,
    url text NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    score bigint DEFAULT '0'::bigint NOT NULL,
    playlist bigint
);


ALTER TABLE public.queue OWNER TO postgres;

--
-- TOC entry 4066 (class 0 OID 0)
-- Dependencies: 357
-- Name: COLUMN queue.playlist; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON COLUMN public.queue.playlist IS 'What playlist does it belong to';


--
-- TOC entry 358 (class 1259 OID 29294)
-- Name: queue_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.queue ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.queue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 361 (class 1259 OID 51968)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid DEFAULT auth.uid() NOT NULL,
    admin boolean DEFAULT false NOT NULL,
    color text DEFAULT '#FFFFFF'::text NOT NULL,
    username text NOT NULL,
    followed_users text[] DEFAULT ARRAY[]::text[],
    ban_status integer DEFAULT 0,
    emoji text,
    playlists bigint[]
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4069 (class 0 OID 0)
-- Dependencies: 361
-- Name: TABLE users; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public.users IS 'Roles and settings';


--
-- TOC entry 359 (class 1259 OID 29359)
-- Name: votes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.votes (
    id bigint NOT NULL,
    song_id bigint NOT NULL,
    user_id uuid DEFAULT auth.uid() NOT NULL,
    vote integer DEFAULT 0 NOT NULL,
    voted_at timestamp with time zone DEFAULT (now() AT TIME ZONE 'utc'::text) NOT NULL
);


ALTER TABLE public.votes OWNER TO postgres;

--
-- TOC entry 360 (class 1259 OID 29362)
-- Name: votes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.votes ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.votes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 3842 (class 2606 OID 94795)
-- Name: banned_url banned_url_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.banned_url
    ADD CONSTRAINT banned_url_pkey PRIMARY KEY (id);


--
-- TOC entry 3845 (class 2606 OID 139970)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 3848 (class 2606 OID 150114)
-- Name: playlists playlists_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_id_key UNIQUE (id);


--
-- TOC entry 3850 (class 2606 OID 150120)
-- Name: playlists playlists_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_name_key UNIQUE (name);


--
-- TOC entry 3852 (class 2606 OID 167789)
-- Name: playlists playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_pkey PRIMARY KEY (id, url);


--
-- TOC entry 3854 (class 2606 OID 150126)
-- Name: playlists playlists_url_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_url_key UNIQUE (url);


--
-- TOC entry 3831 (class 2606 OID 29309)
-- Name: queue queue_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue
    ADD CONSTRAINT queue_pkey PRIMARY KEY (id);


--
-- TOC entry 3836 (class 2606 OID 67741)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id, username);


--
-- TOC entry 3838 (class 2606 OID 55087)
-- Name: users users_user_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_user_key UNIQUE (id);


--
-- TOC entry 3840 (class 2606 OID 67739)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 3834 (class 2606 OID 29372)
-- Name: votes votes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_pkey PRIMARY KEY (id);


--
-- TOC entry 3843 (class 1259 OID 139981)
-- Name: idx_notifications_user_read; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_notifications_user_read ON public.notifications USING btree (user_id, read, created_at DESC);


--
-- TOC entry 3832 (class 1259 OID 49731)
-- Name: idx_unique_user_song; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX idx_unique_user_song ON public.votes USING btree (user_id, song_id);


--
-- TOC entry 3846 (class 1259 OID 142562)
-- Name: unique_like_notification; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX unique_like_notification ON public.notifications USING btree (user_id, sender_id, type, link);


--
-- TOC entry 3863 (class 2620 OID 62488)
-- Name: votes update_queue_score_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_queue_score_trigger AFTER INSERT OR DELETE OR UPDATE ON public.votes FOR EACH ROW EXECUTE FUNCTION public.trigger_update_queue_score();


--
-- TOC entry 3860 (class 2606 OID 139976)
-- Name: notifications notifications_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- TOC entry 3861 (class 2606 OID 139971)
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- TOC entry 3862 (class 2606 OID 150129)
-- Name: playlists playlists_host_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.playlists
    ADD CONSTRAINT playlists_host_fkey FOREIGN KEY (host) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3855 (class 2606 OID 150276)
-- Name: queue queue_playlist_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue
    ADD CONSTRAINT queue_playlist_fkey FOREIGN KEY (playlist) REFERENCES public.playlists(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3856 (class 2606 OID 150864)
-- Name: queue queue_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.queue
    ADD CONSTRAINT queue_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3859 (class 2606 OID 55090)
-- Name: users users_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3857 (class 2606 OID 29373)
-- Name: votes votes_song_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_song_id_fkey FOREIGN KEY (song_id) REFERENCES public.queue(id) ON DELETE CASCADE;


--
-- TOC entry 3858 (class 2606 OID 150869)
-- Name: votes votes_user_id_fkey1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.votes
    ADD CONSTRAINT votes_user_id_fkey1 FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 4032 (class 3256 OID 74348)
-- Name: queue Admins can delete songs; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete songs" ON public.queue FOR DELETE TO authenticated USING ((( SELECT users.admin
   FROM public.users
  WHERE (users.id = auth.uid())) = true));


--
-- TOC entry 4033 (class 3256 OID 74370)
-- Name: votes Admins can delete votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Admins can delete votes" ON public.votes FOR DELETE TO authenticated USING ((( SELECT users.admin
   FROM public.users
  WHERE (users.id = auth.uid())) = true));


--
-- TOC entry 4035 (class 3256 OID 97416)
-- Name: users Allow admins to update any user; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow admins to update any user" ON public.users FOR UPDATE TO authenticated USING ((( SELECT users_1.admin
   FROM public.users users_1
  WHERE (users_1.id = auth.uid())) = true));


--
-- TOC entry 4034 (class 3256 OID 94856)
-- Name: banned_url Allow insert for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow insert for authenticated users" ON public.banned_url FOR INSERT TO authenticated WITH CHECK (true);


--
-- TOC entry 4043 (class 3256 OID 176896)
-- Name: users Allow playlist hosts to update users' playlists; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow playlist hosts to update users' playlists" ON public.users FOR UPDATE TO authenticated USING ((auth.uid() = ( SELECT playlists.host
   FROM public.playlists
  WHERE (playlists.id = ANY (users.playlists)))));


--
-- TOC entry 4036 (class 3256 OID 135018)
-- Name: banned_url Allow select for authenticated users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow select for authenticated users" ON public.banned_url FOR SELECT TO authenticated USING (true);


--
-- TOC entry 4031 (class 3256 OID 62676)
-- Name: queue Allow triggers and functions to update data; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow triggers and functions to update data" ON public.queue FOR UPDATE TO service_role USING (true);


--
-- TOC entry 4029 (class 3256 OID 62572)
-- Name: queue Allow update to triggers and functions; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow update to triggers and functions" ON public.queue FOR UPDATE TO postgres USING (true);


--
-- TOC entry 4041 (class 3256 OID 153189)
-- Name: playlists Allow users to delete their own playlists; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to delete their own playlists" ON public.playlists FOR DELETE TO authenticated USING ((( SELECT auth.uid() AS uid) = host));


--
-- TOC entry 4024 (class 3256 OID 53551)
-- Name: users Allow users to delete their own row; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to delete their own row" ON public.users FOR DELETE TO authenticated USING ((auth.uid() = id));


--
-- TOC entry 4027 (class 3256 OID 62216)
-- Name: votes Allow users to delete their own votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to delete their own votes" ON public.votes FOR DELETE TO authenticated USING ((auth.uid() = user_id));


--
-- TOC entry 4040 (class 3256 OID 153187)
-- Name: playlists Allow users to insert playlists; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to insert playlists" ON public.playlists FOR INSERT TO authenticated WITH CHECK (true);


--
-- TOC entry 4022 (class 3256 OID 62511)
-- Name: queue Allow users to insert their own scores; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to insert their own scores" ON public.queue FOR INSERT TO authenticated WITH CHECK ((user_id = auth.uid()));


--
-- TOC entry 4025 (class 3256 OID 62214)
-- Name: votes Allow users to insert their own votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to insert their own votes" ON public.votes FOR INSERT TO authenticated WITH CHECK ((auth.uid() = user_id));


--
-- TOC entry 4042 (class 3256 OID 153210)
-- Name: playlists Allow users to update playlists if they are host or moderator; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to update playlists if they are host or moderator" ON public.playlists FOR UPDATE TO authenticated USING (((( SELECT auth.uid() AS uid) = host) OR (( SELECT auth.uid() AS uid) = ANY (moderators))));


--
-- TOC entry 4023 (class 3256 OID 53550)
-- Name: users Allow users to update their own row; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to update their own row" ON public.users FOR UPDATE TO authenticated USING ((auth.uid() = id)) WITH CHECK ((auth.uid() = id));


--
-- TOC entry 4028 (class 3256 OID 62510)
-- Name: queue Allow users to update their own scores; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to update their own scores" ON public.queue FOR UPDATE TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4026 (class 3256 OID 62215)
-- Name: votes Allow users to update their own votes; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Allow users to update their own votes" ON public.votes FOR UPDATE TO authenticated USING ((auth.uid() = user_id)) WITH CHECK ((auth.uid() = user_id));


--
-- TOC entry 4044 (class 3256 OID 178460)
-- Name: users Enable insert for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable insert for all users" ON public.users FOR INSERT WITH CHECK (true);


--
-- TOC entry 4039 (class 3256 OID 153164)
-- Name: playlists Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON public.playlists FOR SELECT USING (true);


--
-- TOC entry 4019 (class 3256 OID 29437)
-- Name: queue Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON public.queue FOR SELECT USING (true);


--
-- TOC entry 4021 (class 3256 OID 53486)
-- Name: users Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON public.users FOR SELECT USING (true);


--
-- TOC entry 4020 (class 3256 OID 29439)
-- Name: votes Enable read access for all users; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Enable read access for all users" ON public.votes FOR SELECT USING (true);


--
-- TOC entry 4030 (class 3256 OID 141106)
-- Name: notifications Users can insert notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (((auth.uid() = sender_id) OR (auth.uid() = user_id)));


--
-- TOC entry 4037 (class 3256 OID 140308)
-- Name: notifications Users can select their own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can select their own notifications" ON public.notifications FOR SELECT TO authenticated USING ((user_id = auth.uid()));


--
-- TOC entry 4038 (class 3256 OID 140580)
-- Name: notifications Users can update their own notifications; Type: POLICY; Schema: public; Owner: postgres
--

CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO authenticated USING ((user_id = auth.uid())) WITH CHECK ((user_id = auth.uid()));


--
-- TOC entry 4016 (class 0 OID 94788)
-- Dependencies: 366
-- Name: banned_url; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.banned_url ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4017 (class 0 OID 139962)
-- Dependencies: 368
-- Name: notifications; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4018 (class 0 OID 150109)
-- Dependencies: 369
-- Name: playlists; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.playlists ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4013 (class 0 OID 29291)
-- Dependencies: 357
-- Name: queue; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.queue ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4015 (class 0 OID 51968)
-- Dependencies: 361
-- Name: users; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4014 (class 0 OID 29359)
-- Dependencies: 359
-- Name: votes; Type: ROW SECURITY; Schema: public; Owner: postgres
--

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

--
-- TOC entry 4054 (class 0 OID 0)
-- Dependencies: 16
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT USAGE ON SCHEMA public TO postgres;
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO service_role;


--
-- TOC entry 4055 (class 0 OID 0)
-- Dependencies: 577
-- Name: FUNCTION calculate_current_score(target_song_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.calculate_current_score(target_song_id bigint) TO anon;
GRANT ALL ON FUNCTION public.calculate_current_score(target_song_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.calculate_current_score(target_song_id bigint) TO service_role;


--
-- TOC entry 4056 (class 0 OID 0)
-- Dependencies: 484
-- Name: FUNCTION handle_new_user(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.handle_new_user() TO anon;
GRANT ALL ON FUNCTION public.handle_new_user() TO authenticated;
GRANT ALL ON FUNCTION public.handle_new_user() TO service_role;


--
-- TOC entry 4057 (class 0 OID 0)
-- Dependencies: 634
-- Name: FUNCTION insert_user_data(user_email text); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.insert_user_data(user_email text) TO anon;
GRANT ALL ON FUNCTION public.insert_user_data(user_email text) TO authenticated;
GRANT ALL ON FUNCTION public.insert_user_data(user_email text) TO service_role;


--
-- TOC entry 4058 (class 0 OID 0)
-- Dependencies: 625
-- Name: FUNCTION trigger_update_queue_score(); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.trigger_update_queue_score() TO anon;
GRANT ALL ON FUNCTION public.trigger_update_queue_score() TO authenticated;
GRANT ALL ON FUNCTION public.trigger_update_queue_score() TO service_role;


--
-- TOC entry 4059 (class 0 OID 0)
-- Dependencies: 626
-- Name: FUNCTION update_queue_score(target_song_id bigint); Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON FUNCTION public.update_queue_score(target_song_id bigint) TO anon;
GRANT ALL ON FUNCTION public.update_queue_score(target_song_id bigint) TO authenticated;
GRANT ALL ON FUNCTION public.update_queue_score(target_song_id bigint) TO service_role;


--
-- TOC entry 4060 (class 0 OID 0)
-- Dependencies: 366
-- Name: TABLE banned_url; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.banned_url TO anon;
GRANT ALL ON TABLE public.banned_url TO authenticated;
GRANT ALL ON TABLE public.banned_url TO service_role;


--
-- TOC entry 4061 (class 0 OID 0)
-- Dependencies: 368
-- Name: TABLE notifications; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.notifications TO anon;
GRANT ALL ON TABLE public.notifications TO authenticated;
GRANT ALL ON TABLE public.notifications TO service_role;


--
-- TOC entry 4062 (class 0 OID 0)
-- Dependencies: 367
-- Name: SEQUENCE notifications_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.notifications_id_seq TO anon;
GRANT ALL ON SEQUENCE public.notifications_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.notifications_id_seq TO service_role;


--
-- TOC entry 4064 (class 0 OID 0)
-- Dependencies: 369
-- Name: TABLE playlists; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.playlists TO anon;
GRANT ALL ON TABLE public.playlists TO authenticated;
GRANT ALL ON TABLE public.playlists TO service_role;


--
-- TOC entry 4065 (class 0 OID 0)
-- Dependencies: 370
-- Name: SEQUENCE playlists_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.playlists_id_seq TO anon;
GRANT ALL ON SEQUENCE public.playlists_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.playlists_id_seq TO service_role;


--
-- TOC entry 4067 (class 0 OID 0)
-- Dependencies: 357
-- Name: TABLE queue; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.queue TO anon;
GRANT ALL ON TABLE public.queue TO authenticated;
GRANT ALL ON TABLE public.queue TO service_role;


--
-- TOC entry 4068 (class 0 OID 0)
-- Dependencies: 358
-- Name: SEQUENCE queue_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.queue_id_seq TO anon;
GRANT ALL ON SEQUENCE public.queue_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.queue_id_seq TO service_role;


--
-- TOC entry 4070 (class 0 OID 0)
-- Dependencies: 361
-- Name: TABLE users; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.users TO anon;
GRANT ALL ON TABLE public.users TO authenticated;
GRANT ALL ON TABLE public.users TO service_role;


--
-- TOC entry 4071 (class 0 OID 0)
-- Dependencies: 359
-- Name: TABLE votes; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON TABLE public.votes TO anon;
GRANT ALL ON TABLE public.votes TO authenticated;
GRANT ALL ON TABLE public.votes TO service_role;


--
-- TOC entry 4072 (class 0 OID 0)
-- Dependencies: 360
-- Name: SEQUENCE votes_id_seq; Type: ACL; Schema: public; Owner: postgres
--

GRANT ALL ON SEQUENCE public.votes_id_seq TO anon;
GRANT ALL ON SEQUENCE public.votes_id_seq TO authenticated;
GRANT ALL ON SEQUENCE public.votes_id_seq TO service_role;


--
-- TOC entry 2610 (class 826 OID 16484)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2611 (class 826 OID 16485)
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role;


--
-- TOC entry 2609 (class 826 OID 16483)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2613 (class 826 OID 16487)
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON FUNCTIONS TO service_role;


--
-- TOC entry 2608 (class 826 OID 16482)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: postgres
--

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO service_role;


--
-- TOC entry 2612 (class 826 OID 16486)
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: supabase_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO postgres;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE supabase_admin IN SCHEMA public GRANT ALL ON TABLES TO service_role;


-- Completed on 2025-06-13 00:55:18 CEST

--
-- PostgreSQL database dump complete
--

