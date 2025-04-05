import AddSongForm from '@/components/AddSongForm';
import Queue from '@/components/Queue';
import { useEffect } from 'react';

export default function Home() {
    useEffect(function () {
        document.title = 'Home - Song Request';
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/png';
        link.href = '/logo.png';

        document.head.appendChild(link);
    }, []);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            placeItems: 'center',
            gap: '2rem',
        }}>
            <AddSongForm />
            <Queue />
        </div>
    );
}
