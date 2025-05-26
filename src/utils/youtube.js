export function extractYoutubeVideoId(url) {
    const regExp = /^.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[1].length === 11 ? match[1] : null;
}

export const extractVideoId = (url) => {
    const match = url.match(
        /(?:youtube\.com\/.*v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
};

export const fetchYouTubeMetadata = async (videoId) => {
    const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`
    );
    const data = await res.json();

    if (data.items && data.items.length > 0) {
        const video = data.items[0].snippet;
        return {
            title: video.title,
            author: video.channelTitle,
        };
    }

    return null;
};
