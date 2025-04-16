'use server'
import PropTypes from "prop-types";
import {supabase} from '@/utils/supabase';
import {createCanvas} from 'canvas';

export async function playSound(type, volume = 1.0) {
    const basePath = '/audio'; // Base path for all sounds
    let soundPath;

    switch (type) {
        case 'success':
            soundPath = `${basePath}/mixkit-correct-answer-tone-2870.wav`;
            break;
        case 'swoosh':
            soundPath = `${basePath}/mixkit-fast-small-sweep-transition-166.wav`;
            break;
        case 'click':
            soundPath = `${basePath}/mixkit-modern-technology-select-3124.wav`;
            break;
        default:
            console.error(`Sound type: "${type}" not found.`);
            return;
    }

    try {
        const audio = new Audio(soundPath);
        audio.preload = 'auto';

        audio.volume = Math.min(Math.max(volume, 0.0), 1.0);
        await audio.play();
    } catch (error) {
        console.error(`Error playing sound "${type}":`, error.message);
    }
}

playSound.propTypes = {
    audio: PropTypes.oneOf(['success', 'swoosh', 'click']).isRequired,
    volume: PropTypes.number,
}

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

export function sortSongs(data, sortCriteria, sortOrder) {
    return data.sort((a, b) => {
        let comparison = 0;

        // Primary sorting
        if (sortCriteria === 'score') {
            comparison = b.score - a.score; // Descending
        } else if (sortCriteria === 'author') {
            comparison = a.author.localeCompare(b.author); // Ascending
        } else if (sortCriteria === 'title') {
            comparison = a.title.localeCompare(b.title); // Ascending
        } else if (sortCriteria === 'added_at') {
            comparison = new Date(a.added_at) - new Date(b.added_at); // Ascending
        }

        // Apply primary sort order
        if (sortOrder === 'asc') {
            comparison = -comparison;
        }

        // Secondary sorting (fixed logic)
        if (comparison === 0) {
            if (sortCriteria === 'score' || sortCriteria === 'title') {
                // Secondary: added_at (ascending)
                comparison = new Date(a.added_at) - new Date(b.added_at);
            } else {
                // Secondary: score (ascending)
                comparison = a.score - b.score;
            }
        }

        return comparison;
    });
}

sortSongs.propTypes = {
    data: PropTypes.array.isRequired,
    sortCriteria: PropTypes.oneOf(['score', 'author', 'title', 'added_at']).isRequired,
    sortOrder: PropTypes.oneOf(['asc', 'desc']).isRequired
}