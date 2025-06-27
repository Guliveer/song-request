import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
    return (
        <Html lang="en" className={"dark"}>
            <Head>
                <link rel="mask-icon" href="/favicon/safari-pinned-tab.svg" color="#000000" />
                <link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
                <link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
                <link rel="shortcut icon" href="/favicon/favicon.ico" />
                <link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
                <link rel="manifest" href="/favicon/site.webmanifest" />
                <meta name="apple-mobile-web-app-title" content="Track Drop" />
                <meta name="application-name" content="Track Drop" />
            </Head>

            <body className="antialiased">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
