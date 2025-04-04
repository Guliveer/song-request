'use server'
import PropTypes from "prop-types";
import {supabase} from '@/utils/supabase';
import {createCanvas} from 'canvas';


export async function isUserLoggedIn() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        return !!user;
    } catch (error) {
        console.error('Error checking if user is logged in:', error.message);
        return false;
    }
}

export async function getCurrentUser() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Error fetching current user:', error.message);
        return null;
    }
}

export async function getUserInfo(id) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select()
            .eq('id', id)
            .single();

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error fetching user info:', error.message);
        return null;
    }
}

getUserInfo.propTypes = {
    id: PropTypes.string.isRequired
}

export async function isUserAdmin() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return false;
        }

        const { data: profile, error: profileError } = await supabase
            .from('users')
            .select('admin')
            .eq('id', user.id)
            .single();
        if (profileError) throw profileError;

        return profile.admin;
    } catch (error) {
        console.error('Error checking if user is admin:', error.message);
        return false;
    }
}

export async function isUsernameAvailable(username) {
    const { data: existingUser } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .single();

    if (existingUser) throw new Error('Username already taken');

    return true;
}

isUsernameAvailable.propTypes = {
    username: PropTypes.string.isRequired
}

export async function signUp(email, password, username, captchaToken) {
    const { error: signUpError, user } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                display_name: username, // Field in auth.users
                username: username, // Field in public.users
            },
            captchaToken
        },
    });

    if (signUpError) throw new Error(signUpError.message);

    return user;
}

signUp.propTypes = {
    email: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    captchaToken: PropTypes.string.isRequired
}

export async function logOut() {
    try {
        const { error } = await supabase.auth.signOut({scope: 'local'});
        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Error logging out:', error.message);
        return false;
    } finally {
        window.location.href = '/'; // Redirect to home page and reload
    }
}

export async function getSongData(id) {
    try {
        // Fetch the current song's data
        const { data: song, error: songError } = await supabase
            .from('queue')
            .select('title, author, url, added_at, user_id, score')
            .eq('id', id)
            .single();
        if (songError) throw songError;

        // Fetch the count of songs with a higher score or the same score but added earlier
        const { count, error: countError } = await supabase
            .from('queue')
            .select('id', { count: 'exact' })
            .or(`score.gt.${song.score},and(score.eq.${song.score},added_at.lt.${song.added_at})`);
        if (countError) throw countError;

        song.rank = count + 1; // Calculate the rank
        return song;
    } catch (error) {
        console.error('Error fetching song with rank:', error.message);
        return null;
    }
}

getSongData.propTypes = {
    id: PropTypes.number.isRequired
}

export async function removeUserVote(songId, userId) {
    try {
        const { error } = await supabase
            .from('votes')
            .delete()
            .eq('song_id', songId)
            .eq('user_id', userId);
        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Error removing user vote:', error.message);
        return error;
    }
}

removeUserVote.propTypes = {
    songId: PropTypes.number.isRequired,
    userId: PropTypes.string.isRequired
}

export async function updateUserVote(songId, userId, vote) {
    try {
        const { error } = await supabase
            .from('votes')
            .upsert({
                song_id: songId,
                user_id: userId,
                vote,
                voted_at: new Date().toISOString(),
            }, { onConflict: ['user_id', 'song_id'] });
        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Error updating user vote:', error.message);
        return error;
    }
}

updateUserVote.propTypes = {
    songId: PropTypes.number.isRequired,
    userId: PropTypes.string.isRequired,
    vote: PropTypes.number.isRequired
}
