import '@/styles/globals.css';
import NavMenu from '@/components/NavMenu';

export default function App({ Component, pageProps }) {
    return (
        <>
            <NavMenu />
            <Component {...pageProps} />
        </>
    );
}
