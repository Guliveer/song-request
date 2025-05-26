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

export async function genUserAvatar(id) {
    try {
        const { data: user, error } = await supabase
            .from("users")
            .select("username, color, emoji")
            .eq("id", id)
            .single();

        if (error) throw error;

        const { username, color } = user;
        const icon = user.emoji;

        const size = 256;
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext("2d");

        // 🎨 Tło
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, size, size);

        // 🖌️ Tryb mieszania (blend mode)
        const blendMode = getBlendModeForText(color);

        // 🌟 Rysujemy "bazę" pod literę
        ctx.fillRect(0, 0, size, size);

        // 🔠 Litera
        ctx.globalCompositeOperation = "source-atop"; // Zachowujemy tylko literę

        // Lepszy kontrast i bardziej subtelny wygląd literki
        ctx.fillStyle = blendMode === "screen" ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.85)";

        // Medium zamiast Bold dla delikatniejszego wyglądu, który pasuje do Material UI
        ctx.font = "500 12em 'Roboto', 'Helvetica', 'Arial', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Delikatne przesunięcie dla lepszego optycznego wyśrodkowania
        ctx.fillText(user.emoji ? icon : username.charAt(0).toUpperCase(), size / 2, size*1.02 / 2);

        return canvas.toDataURL();
    } catch (error) {
        console.error("Error generating user avatar:", error.message);
        return null;
    }
}
function getBlendModeForText(hex) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    if (luminance > 0.75) return "multiply";  // Bardzo jasne tło → litera ciemnieje
    if (luminance < 0.35) return "screen";    // Bardzo ciemne tło → litera się rozjaśnia
    return "overlay";                         // Średnie tło → naturalne wzmocnienie kontrastu
}
genUserAvatar.propTypes = {
    id: PropTypes.string.isRequired
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
            .select("*")
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
            if (sortCriteria !== 'added_at') {
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

export async function isFollowingUser(userId) {
    const curUser = await getCurrentUser();
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('followed_users')
            .eq('id', curUser.id)
            .single();

        if (error) throw error;

        const followedUsers = user.followed_users || [];
        return followedUsers.includes(userId);
    } catch (error) {
        console.error('Error checking if following user:', error.message);
        return false;
    }
}

export async function followUser(userId) {
    // users.followed_users [text array]
    const curUser = await getCurrentUser();
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('followed_users')
            .eq('id', curUser.id)
            .single();

        if (error) throw error;

        const followedUsers = user.followed_users || [];
        const newFollowedUsers = [...followedUsers, userId];

        const { error: updateError } = await supabase
            .from('users')
            .update({ followed_users: newFollowedUsers })
            .eq('id', curUser.id);

        if (updateError) throw updateError;

        return true;
    } catch (error) {
        console.error('Error following user:', error.message);
        return false;
    }
}
followUser.propTypes = {
    userId: PropTypes.string.isRequired
}

export async function unfollowUser(userId) {
    const curUser = await getCurrentUser();
    try {
        const { data: user, error } = await supabase
            .from('users')
            .select('followed_users')
            .eq('id', curUser.id)
            .single();

        if (error) throw error;

        const followedUsers = user.followed_users || [];
        const newFollowedUsers = followedUsers.filter(id => id !== userId);

        const { error: updateError } = await supabase
            .from('users')
            .update({ followed_users: newFollowedUsers })
            .eq('id', curUser.id);

        if (updateError) throw updateError;

        return true;
    } catch (error) {
        console.error('Error unfollowing user:', error.message);
        return false;
    }
}

export async function getUserSongs(userId) {
    try {
        const { data, error } = await supabase
            .from('queue')
            .select('*')
            .eq('user_id', userId)
            .order('added_at', { ascending: false });

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error fetching user songs:', error.message);
        return null;
    }
}
getUserSongs.propTypes = {
    userId: PropTypes.string.isRequired
}

export async function getUserVotes(userId) {
    try {
        const { data, error } = await supabase
            .from('votes')
            .select(`
                *,
                queue (
                    title,
                    author,
                    added_at
                )
            `)
            .eq('user_id', userId);

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error fetching user votes with queue data:', error.message);
        return null;
    }
}
getUserVotes.propTypes = {
    userId: PropTypes.string.isRequired
}

export async function removeSong(songId) {
    try {
        const { error } = await supabase
            .from('queue')
            .delete()
            .eq('id', songId);

        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Error removing song:', error.message);
        return false;
    }
}
removeSong.propTypes = {
    songId: PropTypes.number.isRequired
}

export async function removeVotes(userId) {
    try {
        const { error } = await supabase
            .from('votes')
            .delete()
            .eq('user_id', userId);

        if (error) throw error;

        return true;
    } catch (error) {
        console.error('Error removing votes:', error.message);
        return false;
    }
}
removeVotes.propTypes = {
    userId: PropTypes.string.isRequired
}

export async function hardBanUser(userId, banDuration = '99999h') {
    try {
        const { data: user, error } = await supabase.auth.admin.updateUserById(
            userId,
            { ban_duration: banDuration }
        );

        if (error) throw error;

        return user;
    } catch (error) {
        console.error('Error banning user:', error.message);
        return null;
    }
}
hardBanUser.propTypes = {
    userId: PropTypes.string.isRequired,
    banDuration: PropTypes.string.isRequired
};
