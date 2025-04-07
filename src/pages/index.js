import AddSongForm from '@/components/AddSongForm';
import Queue from '@/components/Queue';
import SetTitle from "@/components/SetTitle";

export default function Home() {
    return (
        <>
        <SetTitle />
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            placeItems: 'center',
            gap: '2rem',
        }}>
            <AddSongForm />
            <Queue />
        </div>
        </>
    );
}
