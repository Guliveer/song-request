import AddSongForm from '@/components/AddSongForm';
import Queue from '@/components/Queue';

export default function Home() {
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
