'use server'
import PropTypes from "prop-types";
import {supabase} from '@/utils/supabase';
import {createCanvas} from 'canvas';
import {extractSpotifyTrackId, fetchSpotifyMetadata} from '@/utils/spotify';
import {extractYoutubeVideoId, fetchYouTubeMetadata} from '@/utils/youtube';

// Play a sound based on the type
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

// Generate user's avatar. Returns a data URL of the avatar image.
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
getBlendModeForText.propTypes = {
    hex: PropTypes.string.isRequired
}

// Check if user is logged in
export async function isUserLoggedIn() {
    try {
        const { data: { user } } = await supabase.auth.getUser()
        return !!user;
    } catch (error) {
        console.error('Error checking if user is logged in:', error.message);
        return false;
    }
}

// Fetch the current user
export async function getCurrentUser() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        return user;
    } catch (error) {
        console.error('Error fetching current user:', error.message);
        return null;
    }
}

// Fetch the current user's profile
export async function getUserInfo(id) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select("*")
            .eq('id', id)
            .single();

        if (error) throw error;

        // Generate avatar for the user
        data.avatar = await genUserAvatar(id);

        return data;
    } catch (error) {
        console.error('Error fetching user info:', error.message);
        return null;
    }
}
getUserInfo.propTypes = {
    id: PropTypes.string.isRequired
}

// Check if user is an admin
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

// Check if a username is available to use
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

// Sign up
export async function signUp(email, password, username, captchaToken) {
    const { data: {user} , error: signUpError } = await supabase.auth.signUp({
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

    if (signUpError) {
        console.error('Error signing up:', signUpError.message);
        throw new Error(`Failed to sign up: ${signUpError.message}`);
    }

    // random hex color for user (#rrggbb)
    const randColor = `#${Math.floor(Math.random()*256*256*256).toString(16).padStart(6, '0')}`;

    // Add user to the public.users table
    const { error: userError } = await supabase
        .from('users')
        .insert({
            id: user.id,
            username: username,
            color: randColor,
        });

    if (userError) {
        console.error('Failed to create user profile:', userError.message);
        throw new Error(`Failed to create user profile: ${userError.message}`);
    }

    return user;
}
signUp.propTypes = {
    email: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    captchaToken: PropTypes.string.isRequired
}

// Log out
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

// Fetch a song's data with its rank
export async function getSongData(id) {
    try {
        // Fetch the current song's data
        const { data: song, error: songError } = await supabase
            .from('queue')
            .select('title, author, url, added_at, user_id, score, playlist')
            .eq('id', id)
            .single();
        if (songError) throw songError;

        // Count songs in the same playlist with higher score
        // or same score but added earlier
        const { count, error: countError } = await supabase
            .from('queue')
            .select('id', { count: 'exact' })
            .or(
                `and(score.gt.${song.score},playlist.eq.${song.playlist}),` +
                `and(score.eq.${song.score},added_at.lt.${song.added_at},playlist.eq.${song.playlist})`
            );

        if (countError) throw countError;

        song.rank = count + 1;
        return song;
    } catch (error) {
        console.error('Error fetching song with rank:', error.message);
        return null;
    }
}
getSongData.propTypes = {
    id: PropTypes.number.isRequired
}

// Remove user vote for a song
export async function removeUserVote(songId, userId) {
    try {
        // Check if user has joined the playlist that song belongs to
        const { data: song, error: songError } = await supabase
            .from('queue')
            .select('playlist')
            .eq('id', songId)
            .single();

        if (songError) throw songError;

        const joinedPlaylists = await getJoinedPlaylists(userId);
        const hasJoined = joinedPlaylists.includes(song.playlist);

        if (!hasJoined) {
            throw new Error('User has not joined the playlist for this song');
        }

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

// Update user vote for a song
export async function updateUserVote(songId, userId, vote) {
    try {
        // Check if user has joined the playlist that song belongs to
        const { data: song, error: songError } = await supabase
            .from('queue')
            .select('playlist')
            .eq('id', songId)
            .single();

        if (songError) throw songError;

        const joinedPlaylists = await getJoinedPlaylists(userId);
        const hasJoined = joinedPlaylists.includes(song.playlist);

        if (!hasJoined) {
            throw new Error('User has not joined the playlist for this song');
        }

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

// Sort songs based on criteria
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

// Check if a current user is following another user
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
isFollowingUser.propTypes = {
    userId: PropTypes.string.isRequired
}

// Follow a user
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

// Unfollow a user
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
unfollowUser.propTypes = {
    userId: PropTypes.string.isRequired
}

// Fetch songs added by a user
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

// Fetch user votes with queue data
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

// Remove a song from the queue
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

// Ban a song from a playlist
export async function banSong(playlistId, songUrl) {
    if (!songUrl) {
        console.error("Invalid song URL");
        return false;
    }

    try {
        const { data: playlist, error: playlistError } = await supabase
            .from("playlists")
            .select("banned_songs")
            .eq("id", playlistId)
            .single();

        if (playlistError) throw playlistError;

        const bannedSongs = playlist.banned_songs || [];
        if (bannedSongs.includes(songUrl)) {
            console.warn("Song is already banned:", songUrl);
            return false;
        }

        const updatedSongs = [...bannedSongs, songUrl];

        const { error: updateError } = await supabase
            .from("playlists")
            .update({ banned_songs: updatedSongs })
            .eq("id", playlistId);

        if (updateError) throw updateError;

        // Remove song from queue
        const { error: queueError } = await supabase
            .from('queue')
            .delete()
            .eq('playlist', playlistId)
            .eq('url', songUrl);

        if (queueError) throw queueError;

        return true;
    } catch (error) {
        console.error("Error banning song:", error.message);
        return false;
    }
}
banSong.propTypes = {
    playlistId: PropTypes.number.isRequired,
    songUrl: PropTypes.string.isRequired
}

// Fetch banned songs from a playlist with metadata
export async function getBannedSongs(playlistId) {
    try {
        const { data: playlist, error } = await supabase
            .from('playlists')
            .select('banned_songs')
            .eq('id', playlistId)
            .single();

        if (error) throw error;

        const bannedSongs = playlist.banned_songs || [];
        const results = await Promise.all(
            bannedSongs.map(async (url) => {
                try {
                    // Check if the URL is a Spotify track
                    const spotifyId = extractSpotifyTrackId(url);
                    if (spotifyId) {
                        const metadata = await fetchSpotifyMetadata(spotifyId);
                        if (metadata) {
                            return {
                                url,
                                title: metadata.title || 'Unknown Title',
                                author: metadata.author || 'Unknown Author',
                            };
                        }
                    }

                    // Check if the URL is a YouTube video
                    const youtubeId = extractYoutubeVideoId(url);
                    console.info(`Processing URL: ${url}, YouTube ID: ${youtubeId}`);
                    if (youtubeId) {
                        const metadata = await fetchYouTubeMetadata(youtubeId);
                        console.info(`Fetched YouTube metadata for ${youtubeId}:`, metadata);
                        if (metadata) {
                            return {
                                url,
                                title: metadata.title || 'Unknown Title',
                                author: metadata.author || 'Unknown Author',
                            };
                        }
                    }

                    // Fallback for unknown URLs
                    return {
                        url,
                        title: 'Unknown Title',
                        author: 'Unknown Author',
                    };
                } catch (err) {
                    console.error(`Error processing URL ${url}:`, err.message);
                    return null;
                }
            })
        );

        // Filter out null results
        return results.filter((song) => song !== null);
    } catch (error) {
        console.error('Error fetching banned songs with metadata:', error.message);
        return [];
    }
}
getBannedSongs.propTypes = {
    playlistId: PropTypes.number.isRequired
}

// Unban a song from a playlist
export async function unbanSong(playlistId, songUrl) {
    try {
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('banned_songs')
            .eq('id', playlistId)
            .single();

        if (playlistError) throw playlistError;

        const bannedSongs = playlist.banned_songs || [];
        const updatedBannedSongs = bannedSongs.filter(url => url !== songUrl);

        const { error: updateError } = await supabase
            .from('playlists')
            .update({ banned_songs: updatedBannedSongs })
            .eq('id', playlistId);

        if (updateError) throw updateError;

        return true;
    } catch (error) {
        console.error('Error unbanning song:', error.message);
        return false;
    }
}
unbanSong.propTypes = {
    playlistId: PropTypes.number.isRequired,
    songUrl: PropTypes.string.isRequired
}

// Remove all votes of a user
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

// Ban user from a playlist
export async function banPlaylistUser(playlistId, userId) {
    const currentUser = await getCurrentUser();
    if (userId === currentUser.id) {
        console.warn("User cannot ban themselves from the playlist.");
        throw new Error("You cannot ban yourself from the playlist.");
    }

    const isMod = await isPlaylistModerator(playlistId, currentUser.id);

    try {
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('banned_users')
            .eq('id', playlistId)
            .single();

        if (playlistError) throw playlistError;

        // check if current user is host or moderator
        if (playlist.host === currentUser.id || (playlist.moderators?.includes(currentUser.id) && isMod)) {
            console.warn("User is not authorized to ban users from this playlist.");
            throw new Error("You are not authorized to ban users from this playlist.");
        }

        // if moderator tries to ban host or another moderator, throw an error
        if (playlist.host === userId || playlist.moderators?.includes(userId)) {
            console.warn("Moderators cannot ban the host or other moderators.");
            throw new Error("You cannot ban the host or other moderators from this playlist.");
        }

        const bannedUsers = playlist.banned_users || [];
        if (!bannedUsers.includes(userId)) {
            bannedUsers.push(userId);
        }

        const { error: updateError } = await supabase
            .from('playlists')
            .update({ banned_users: bannedUsers })
            .eq('id', playlistId);

        if (updateError) throw updateError;

        // Remove the user from the playlist's members
        await leavePlaylist(playlistId, userId);

        return true;
    } catch (error) {
        console.error('Error banning user from playlist:', error.message);
        throw new Error('Failed to ban user from playlist: ' + error.message);
    }
}
banPlaylistUser.propTypes = {
    playlistId: PropTypes.number.isRequired,
    userId: PropTypes.string.isRequired
}

// Fetch banned users from a playlist
export async function getPlaylistBannedUsers(playlistId) {
    try {
        const { data: playlist, error } = await supabase
            .from('playlists')
            .select('banned_users')
            .eq('id', playlistId)
            .single();

        if (error) throw error;

        const bannedUsers = playlist.banned_users || [];
        if (bannedUsers.length === 0) {
            console.warn('No banned users found for this playlist.');
            return [];
        }

        // Fetch user details for each banned user
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, username')
            .in('id', bannedUsers);

        if (usersError) throw usersError;

        // For each user, create .avatar field, that contains the result of genUserAvatar function
        return await Promise.all(users.map(async (user) => {
            const avatar = await genUserAvatar(user.id);
            return {
                ...user,
                avatar: avatar
            };
        }));
    } catch (error) {
        console.error('Error fetching banned playlist users:', error.message);
        return [];
    }
}
getPlaylistBannedUsers.propTypes = {
    playlistId: PropTypes.number.isRequired
}

// Unban user from a playlist
export async function unbanPlaylistUser(playlistId, userId) {
    const currentUser = await getCurrentUser();
    if (userId === currentUser.id) {
        console.warn("User cannot unban themselves from the playlist.");
        throw new Error("You cannot unban yourself from the playlist.");
    }

    try {
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('banned_users')
            .eq('id', playlistId)
            .single();

        if (playlistError) throw playlistError;

        // check if the current user is host
        if (playlist.host !== currentUser.id) {
            console.warn("User is not the host of this playlist.");
            throw new Error("You are not authorized to unban users from this playlist.");
        }

        const bannedUsers = playlist.banned_users || [];
        const updatedBannedUsers = bannedUsers.filter(id => id !== userId);

        const { error: updateError } = await supabase
            .from('playlists')
            .update({ banned_users: updatedBannedUsers })
            .eq('id', playlistId);

        if (updateError) throw updateError;

        return true;
    } catch (error) {
        console.error('Error unbanning user from playlist:', error.message);
        throw new Error('Failed to unban user from playlist: ' + error.message);
    }
}
unbanPlaylistUser.propTypes = {
    userId: PropTypes.string.isRequired,
    playlistId: PropTypes.number.isRequired
}

// Ban user from the entire app
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
    banDuration: PropTypes.string
};

export async function getFriendsOnPlaylist(userId, playlistId) {
    if (!userId || !playlistId) return [];

    try {
        // Pobierz listę obserwowanych użytkowników
        const { data: curUserData, error: userError } = await supabase
            .from("users")
            .select("followed_users")
            .eq("id", userId)
            .single();

        if (userError || !curUserData) return [];

        const followed = Array.isArray(curUserData.followed_users) ? curUserData.followed_users : [];
        if (followed.length === 0) return [];

        // Pobierz dane znajomych, którzy mają tę playlistę
        const { data: friendsData, error: friendsError } = await supabase
            .from("users")
            .select("id, username, color, emoji, playlists")
            .in("id", followed)
            .overlaps("playlists", [Number(playlistId)]);

        if (friendsError) return [];

        return friendsData || [];
    } catch (error) {
        console.error("Error in getFriendsOnPlaylist:", error);
        return [];
    }
}
getFriendsOnPlaylist.propTypes = {
    userId: PropTypes.string.isRequired,
    playlistId: PropTypes.number.isRequired
}


// Fetch playlist data by ID or URL
export async function getPlaylistData(playlistId) {
    try {
        // Fetch general playlist data by ID or URL
        const { data: dataById, error: errorById } = await supabase
            .from('playlists')
            .select('*')
            .eq('id', playlistId)
            .single();

        const { data: dataByUrl, error: errorByUrl } = await supabase
            .from('playlists')
            .select('*')
            .eq('url', playlistId)
            .single();

        const targetPlaylist = dataById?.id || dataByUrl?.id;

        // Fetch the count of users who joined the playlist
        const { count: userCount, error: userCountError } = await supabase
            .from("users")
            .select("playlists", { count: "exact" })
            .contains("playlists", [targetPlaylist]);

        // Fetch the count of songs in the playlist
        const { count: songCount, error: songCountError } = await supabase
            .from("queue")
            .select("id", { count: "exact" })
            .eq("playlist", targetPlaylist);

        if (errorById && !errorByUrl) {
            console.error('Error fetching by ID:', errorById.message);
        }

        if (errorByUrl && !errorById) {
            console.error('Error fetching by URL:', errorByUrl.message);
        }

        if ((errorByUrl && errorById) || userCountError) {
            console.error('Unexpected error while fetching playlist data.');
            return null;
        }

        if (dataById) {
            return {
                ...dataById,
                userCount: userCount || 0,
                songCount: songCount || 0,
                method: 'id'
            };
        }
        if (dataByUrl) {
            return {
                ...dataByUrl,
                userCount: userCount || 0,
                songCount: songCount || 0,
                method: 'url'
            };
        }

        return null;
    } catch (error) {
        console.error('Unexpected error:', error);
        return null;
    }
}
getPlaylistData.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
}

// Fetch members of a playlist
export async function getPlaylistMembers(playlistId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .contains('playlists', [playlistId]);

        if (error) {
            console.error('Error fetching playlist members:', error.message);
            throw new Error('Failed to fetch playlist members');
        }

        // For each member, create .avatar field, that contains result of genUserAvatar function
        const membersWithAvatars = await Promise.all(data.map(async (member) => {
            const avatar = await genUserAvatar(member.id);
            return {
                ...member,
                avatar: avatar
            };
        }));

        if (!data || data.length === 0) {
            console.warn('No members found for this playlist.');
            return [];
        }

        // Sort members by username
        membersWithAvatars.sort((a, b) => a.username.localeCompare(b.username));

        return membersWithAvatars;
    } catch (e) {
        console.error('Unexpected error while fetching playlist members:', e.message);
        throw new Error('Failed to fetch playlist members');
    }
}
getPlaylistMembers.propTypes = {
    playlistId: PropTypes.number.isRequired
}

// Check if a user is the host of a playlist
export async function isPlaylistHost(playlistId, userId) {
    let targetUser = userId;

    if (!userId) {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.warn("No user is currently logged in.");
            return false;
        }
        targetUser = currentUser.id;
    }

    try {
        const { data: playlist, error } = await supabase
            .from('playlists')
            .select('host')
            .eq('id', playlistId)
            .single();

        if (error) throw error;

        return playlist.host === targetUser;
    } catch (error) {
        console.error('Error checking if user is playlist host:', error.message);
        return false;
    }
}
isPlaylistHost.propTypes = {
    playlistId: PropTypes.number.isRequired,
    userId: PropTypes.string
}

// Check if a user is a moderator of a playlist.
export async function isPlaylistModerator(playlistId, userId) {
    let targetUser = userId;

    if (!userId) {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.warn("No user is currently logged in.");
            return false;
        }
        targetUser = currentUser.id;
    }

    try {
        const { data: playlist, error } = await supabase
            .from('playlists')
            .select('moderators')
            .eq('id', playlistId)
            .single();

        if (error) throw error;

        const moderators = playlist.moderators || [];
        return moderators.includes(targetUser);
    } catch (error) {
        console.error('Error checking if user is playlist moderator:', error.message);
        return false;
    }
}
isPlaylistModerator.propTypes = {
    playlistId: PropTypes.number.isRequired,
    userId: PropTypes.string
}

// Create a new playlist
export async function createPlaylist(name, description, url) {
    const host = (await getCurrentUser()).id;

    // url can only contain alphanumeric characters and dashes
    if (!/^[a-zA-Z-]+$/.test(url)) {
        console.error('Invalid URL format. Only letters and dashes are allowed.');
        throw new Error('Invalid URL format. Only letters and dashes are allowed.');
    }

    try {
        const { data, error } = await supabase
            .from('playlists')
            .insert({
                name: name,
                host: host,
                description: description,
                url: url,
            })
            .select()
            .single();

        if (error) throw error;

        // Add the new playlist to the user's joined playlists array
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('playlists')
            .eq('id', host)
            .single();

        if (userError) throw userError;
        const joinedPlaylists = user.playlists || [];

        if (!joinedPlaylists.includes(data.id)) {
            const updatedPlaylists = [...joinedPlaylists, data.id];

            const { error: updateError } = await supabase
                .from('users')
                .update({ playlists: updatedPlaylists })
                .eq('id', host);

            if (updateError) {
                console.error('Error updating user playlists:', updateError.message);
                throw updateError;
            }
        }

        return data;
    } catch (error) {
        console.error('Error creating playlist:', error.message);
        throw new Error('Failed to create playlist. Please try again later.');
    }
}
createPlaylist.propTypes = {
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired
}

// Fetch joined playlists of a user
export async function getJoinedPlaylists(userId) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('playlists')
            .eq('id', userId)
            .single();

        if (error) throw error;

        return data.playlists || [];
    } catch (error) {
        console.error('Error fetching joined playlists:', error.message);
        throw  new Error('Failed to get joined playlists:');
    }
}
getJoinedPlaylists.propTypes = {
    userId: PropTypes.string.isRequired
}

// Set the name of a playlist
export async function setPlaylistName(playlistId, newName) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.warn("No user is currently logged in.");
        throw new Error("No user is currently logged in.");
    }

    try {
        // Check if the current user is the host of the playlist
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('host')
            .eq('id', playlistId)
            .single();

        if (playlistError || !playlist) {
            console.error("Error fetching playlist:", playlistError.message);
            throw new Error("Failed to fetch playlist.");
        }

        if (playlist.host !== currentUser.id) {
            console.warn("User is not the host of this playlist.");
            throw new Error("You are not the host of this playlist.");
        }

        // Update the playlist name
        const { error: updateError } = await supabase
            .from('playlists')
            .update({ name: newName })
            .eq('id', playlistId);

        if (updateError) {
            console.error("Error updating playlist name:", updateError.message);
            throw new Error("Failed to update playlist name: " + updateError.message);
        }

        return true;
    } catch (error) {
        console.error("Unexpected error:", error.message);
        throw error;
    }
}
setPlaylistName.propTypes = {
    playlistId: PropTypes.number.isRequired,
    newName: PropTypes.string.isRequired
}

// Set the visibility of a playlist
export async function setPlaylistVisibility(playlistId, isPublic) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.warn("No user is currently logged in.");
        throw new Error("No user is currently logged in.");
    }

    try {
        // Check if the current user is the host of the playlist
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('host')
            .eq('id', playlistId)
            .single();

        if (playlistError || !playlist) {
            console.error("Error fetching playlist:", playlistError.message);
            throw new Error("Failed to fetch playlist.");
        }

        if (playlist.host !== currentUser.id) {
            console.warn("User is not the host of this playlist.");
            throw new Error("You are not the host of this playlist.");
        }

        // Update the playlist visibility
        const { error: updateError } = await supabase
            .from('playlists')
            .update({ is_public: isPublic })
            .eq('id', playlistId);

        if (updateError) {
            console.error("Error updating playlist visibility:", updateError.message);
            throw new Error("Failed to update playlist visibility: " + updateError.message);
        }

        return true;
    } catch (error) {
        console.error("Unexpected error:", error.message);
        throw error;
    }
}
setPlaylistVisibility.propTypes = {
    playlistId: PropTypes.number.isRequired,
    isPublic: PropTypes.bool.isRequired
}

// Set the description of a playlist
export async function setPlaylistDescription(playlistId, description) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.warn("No user is currently logged in.");
        throw new Error("No user is currently logged in.");
    }

    try {
        // Check if the current user is the host of the playlist
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('host')
            .eq('id', playlistId)
            .single();

        if (playlistError || !playlist) {
            console.error("Error fetching playlist:", playlistError.message);
            throw new Error("Failed to fetch playlist.");
        }

        if (playlist.host !== currentUser.id) {
            console.warn("User is not the host of this playlist.");
            throw new Error("You are not the host of this playlist.");
        }

        // Update the playlist description
        const { error: updateError } = await supabase
            .from('playlists')
            .update({ description })
            .eq('id', playlistId);

        if (updateError) {
            console.error("Error updating playlist description:", updateError.message);
            throw new Error("Failed to update playlist description: " + updateError.message);
        }

        return true;
    } catch (error) {
        console.error("Unexpected error:", error.message);
        throw error;
    }
}
setPlaylistDescription.propTypes = {
    playlistId: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired
}

// Set the URL of a playlist
export async function setPlaylistUrl(playlistId, url) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.warn("No user is currently logged in.");
        throw new Error("No user is currently logged in.");
    }

    try {
        // Check if the current user is the host of the playlist
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('host')
            .eq('id', playlistId)
            .single();

        if (playlistError || !playlist) {
            console.error("Error fetching playlist:", playlistError.message);
            throw new Error("Failed to fetch playlist.");
        }

        if (playlist.host !== currentUser.id) {
            console.warn("User is not the host of this playlist.");
            throw new Error("You are not the host of this playlist.");
        }

        // Validate the URL format
        if (!/^[a-zA-Z0-9-]+$/.test(url)) {
            console.error('Invalid URL format. Only letters, numbers, and dashes are allowed.');
            throw new Error('Invalid URL format. Only letters, numbers, and dashes are allowed.');
        }

        // Update the playlist URL
        const { error: updateError } = await supabase
            .from('playlists')
            .update({ url })
            .eq('id', playlistId);

        if (updateError) {
            console.error("Error updating playlist URL:", updateError.message);
            throw new Error("Failed to update playlist URL: " + updateError.message);
        }

        return true;
    } catch (error) {
        console.error("Unexpected error:", error.message);
        throw error;
    }
}
setPlaylistUrl.propTypes = {
    playlistId: PropTypes.number.isRequired,
    url: PropTypes.string.isRequired
}

// Set the new host of a playlist
export async function setPlaylistHost(playlistId, userId) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.warn("No user is currently logged in.");
        throw new Error("No user is currently logged in.");
    }

    try {
        // Check if the current user is the host of the playlist
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('host')
            .eq('id', playlistId)
            .single();

        if (playlistError || !playlist) {
            console.error("Error fetching playlist:", playlistError.message);
            throw new Error("Failed to fetch playlist.");
        }

        if (playlist.host !== currentUser.id) {
            console.warn("User is not the host of this playlist.");
            throw new Error("You are not the host of this playlist.");
        }

        // Check if the new host is a member of the playlist
        const playlistMembers = await getPlaylistMembers(playlistId);
        const isMember = playlistMembers.some(member => member.id === userId);
        if (!isMember) {
            console.warn("The new host has to be a member of this playlist.");
            throw new Error("The user you are trying to set as host is not a member of this playlist.");
        }

        // Update the host of the playlist
        const { error: updateError } = await supabase
            .from('playlists')
            .update({ host: userId })
            .eq('id', playlistId);

        if (updateError) {
            console.error("Error updating playlist host:", updateError.message);
            throw new Error("Failed to update playlist host: " + updateError.message);
        }

        return true;
    } catch (error) {
        console.error("Unexpected error:", error.message);
        throw error;
    }
}

// Fetch playlist moderators
export async function getPlaylistModerators(playlistId) {
    try {
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('moderators')
            .eq('id', playlistId)
            .single();

        if (playlistError) throw playlistError;

        const moderatorIds = playlist.moderators || [];
        if (moderatorIds.length === 0) return {};

        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, username')
            .in('id', moderatorIds);

        if (usersError) throw usersError;

        return users.reduce((acc, user) => {
            acc[user.id] = user.username;
            return acc;
        }, {});
    } catch (error) {
        console.error('Error fetching playlist moderators:', error.message);
        throw new Error('Failed to get playlist moderators: ' + error.message);
    }
}
getPlaylistModerators.propTypes = {
    playlistId: PropTypes.number.isRequired
}

// Add a user as a moderator to a playlist
export async function addPlaylistModerator(playlistId, userId) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.warn("No user is currently logged in.");
        throw new Error("No user is currently logged in.");
    }

    try {
        // Check if the current user is the host of the playlist
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('host, moderators')
            .eq('id', playlistId)
            .single();

        if (playlistError) {
            console.error("Error fetching playlist:", playlistError.message);
            throw new Error("Failed to fetch playlist.");
        }

        if (playlist.host !== currentUser.id) {
            console.warn("User is not the host of this playlist.");
            throw new Error("You are not the host of this playlist.");
        }

        const currentModerators = playlist.moderators || [];
        if (!currentModerators.includes(userId)) {
            currentModerators.push(userId);
        }

        // Add the user to the moderators list
        const { data: updatedPlaylist, error: updateError } = await supabase
            .from('playlists')
            .update({ moderators: currentModerators })
            .eq('id', playlistId)
            .select()
            .single();

        if (updateError) {
            console.error("Error adding moderator:", updateError.message);
            throw new Error("Failed to add moderator: " + updateError.message);
        }

        return updatedPlaylist;
    } catch (error) {
        console.error("Unexpected error:", error.message);
        throw error;
    }
}
addPlaylistModerator.propTypes = {
    playlistId: PropTypes.number.isRequired,
    userId: PropTypes.string.isRequired
}

// Remove a user as a moderator from a playlist
export async function removePlaylistModerator(playlistId, userId) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.warn("No user is currently logged in.");
        throw new Error("No user is currently logged in.");
    }

    try {
        // Check if the current user is the host of the playlist
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('host, moderators')
            .eq('id', playlistId)
            .single();

        if (playlistError || !playlist) {
            console.error("Error fetching playlist:", playlistError.message);
            throw new Error("Failed to fetch playlist.");
        }

        if (playlist.host !== currentUser.id) {
            console.warn("User is not the host of this playlist.");
            throw new Error("You are not the host of this playlist.");
        }

        // Remove the user from the moderators list
        const updatedModerators = (playlist.moderators || []).filter(id => id !== userId);
        const { data: updatedPlaylist, error: updateError } = await supabase
            .from('playlists')
            .update({ moderators: updatedModerators })
            .eq('id', playlistId)
            .select()
            .single();

        if (updateError) {
            console.error("Error removing moderator:", updateError.message);
            throw new Error("Failed to remove moderator: " + updateError.message);
        }

        return updatedPlaylist;
    } catch (error) {
        console.error("Unexpected error:", error.message);
        throw error;
    }
}
removePlaylistModerator.propTypes = {
    playlistId: PropTypes.number.isRequired,
    userId: PropTypes.string.isRequired
}

// Join a playlist
export async function joinPlaylist(playlistId) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.warn("No user is currently logged in.");
        throw new Error("No user is currently logged in.");
    }

    try {
        // Check if the playlist exists
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('id, banned_users')
            .eq('id', playlistId)
            .single();

        if (playlistError || !playlist) {
            console.error("Playlist not found:", playlistError?.message);
            throw new Error("Playlist not found.");
        }

        // Check if the user is banned from the playlist
        const bannedUsers = playlist.banned_users || [];
        if (bannedUsers.includes(currentUser.id)) {
            console.warn("User is banned from this playlist.");
            throw new Error("You are banned from this playlist.");
        }

        // Check if the user is already joined
        const joinedPlaylists = await getJoinedPlaylists(currentUser);
        if (joinedPlaylists.includes(playlistId)) {
            console.warn("User already joined this playlist.");
            return true; // User is already joined
        }

        // Add the playlist to the user's joined playlists
        const updatedPlaylists = [...joinedPlaylists, playlistId];
        const { error: updateError } = await supabase
            .from('users')
            .update({ playlists: updatedPlaylists })
            .eq('id', currentUser);

        if (updateError) {
            console.error("Error updating user's playlists:", updateError.message);
            throw new Error("Failed to join playlist: " + updateError.message);
        }

        return true;
    } catch (error) {
        console.error("Unexpected error:", error.message);
        throw error;
    }
}
joinPlaylist.propTypes = {
    playlistId: PropTypes.number.isRequired,
}

// Leave a playlist or remove a specified user from a playlist
export async function leavePlaylist(playlistId, userId) {
    let targetUser = userId;

    if (!userId) {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
            console.warn("No user is currently logged in.");
            throw new Error("No user is currently logged in.");
        }
        targetUser = currentUser.id;
    }

    const joinedPlaylists = await getJoinedPlaylists(userId);
    if (!joinedPlaylists || !joinedPlaylists.includes(playlistId)) {
        console.warn("Playlist not joined.");
        throw new Error("You have not joined this playlist.");
    }

    try {
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('moderators')
            .eq('id', playlistId)
            .single();

        if (playlistError) {
            console.error("Error fetching playlist moderators:", playlistError.message);
            throw new Error("Failed to fetch playlist moderators: " + playlistError.message);
        }

        // If the user is the host, they cannot leave the playlist
        if (currentUser.id === playlistId) {
            console.warn("Host cannot leave the playlist.");
            throw new Error("You are the host of this playlist and cannot leave it.");
        }

        // Remove user from the playlist's moderators if they are one
        const moderators = playlist.moderators || [];
        if (moderators.includes(targetUser)) {
            const updatedModerators = moderators.filter(id => id !== targetUser);
            const { error: updateError } = await supabase
                .from('playlists')
                .update({ moderators: updatedModerators })
                .eq('id', playlistId);

            if (updateError) {
                console.error("Error updating playlist moderators:", updateError.message);
                throw new Error("Failed to update playlist moderators: " + updateError.message);
            }
        }

        // Delete all user's songs in this playlist
        const { error: deleteSongsError } = await supabase
            .from("queue")
            .delete()
            .eq("playlist", playlistId)
            .eq("user_id", targetUser);

        if (deleteSongsError) {
            console.error("Error deleting songs:", deleteSongsError.message);
            throw new Error("Failed to delete songs: " + deleteSongsError.message);
        }

        // Delete all user's votes in this playlist
        const { data: songIds, error: songIdsError } = await supabase
            .from("queue")
            .select("id")
            .eq("playlist", playlistId);

        if (songIdsError) {
            console.error("Error fetching song IDs:", songIdsError.message);
            throw new Error("Failed to fetch song IDs: " + songIdsError.message);
        }

        const { error: deleteVotesError } = await supabase
            .from("votes")
            .delete()
            .eq("user_id", targetUser)
            .in("song_id", songIds.map(song => song.id));

        if (deleteVotesError) {
            console.error("Error deleting votes:", deleteVotesError.message);
            throw new Error("Failed to delete votes: " + deleteVotesError.message);
        }

        // Remove the playlist from the user's joined playlists
        const updatedPlaylists = joinedPlaylists.filter(id => id !== playlistId);
        const { error } = await supabase
            .from("users")
            .update({ playlists: updatedPlaylists })
            .eq("id", targetUser);

        if (error) {
            console.error("Error leaving playlist:", error.message);
        }
    } catch (error) {
        console.error("Unexpected error:", error.message);
        throw error;
    }
}
leavePlaylist.propTypes = {
    playlistId: PropTypes.number.isRequired,
    userId: PropTypes.string
}

// Delete a playlist
export async function deletePlaylist(playlistId) {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
        console.warn("No user is currently logged in.");
        throw new Error("No user is currently logged in.");
    }

    try {
        // Check if the current user is the host of the playlist
        const { data: playlist, error: playlistError } = await supabase
            .from('playlists')
            .select('host')
            .eq('id', playlistId)
            .single();

        if (playlistError || !playlist) {
            console.error("Error fetching playlist:", playlistError.message);
            throw new Error("Failed to fetch playlist.");
        }

        if (playlist.host !== currentUser.id) {
            console.warn("User is not the host of this playlist.");
            throw new Error("You are not the host of this playlist.");
        }

        // Delete the playlist (songs & votes should be deleted automatically due to foreign key constraints)
        const { error: deletePlaylistError } = await supabase
            .from('playlists')
            .delete()
            .eq('id', playlistId);

        if (deletePlaylistError) {
            console.error("Error deleting playlist:", deletePlaylistError.message);
            throw new Error("Failed to delete playlist: " + deletePlaylistError.message);
        }

        return true;
    } catch (error) {
        console.error("Unexpected error:", error.message);
        return false;
    }
}
deletePlaylist.propTypes = {
    playlistId: PropTypes.number.isRequired
}
