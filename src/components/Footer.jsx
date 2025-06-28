import {Github} from "lucide-react";

const authors = [
    {name: "Guliveer", url: "https://github.com/Guliveer"},
    {name: "lifeoverthinker", url: "https://github.com/lifeoverthinker"},
    {name: "Deerion", url: "https://github.com/Deerion"},
    {name: "lukaszgrzecznik", url: "https://github.com/lukaszgrzecznik"},
];

export default function Footer() {
    return (
        <footer
            id="site-footer"
            className="w-full z-10 relative mt-auto px-4 py-5 border-t border-border bg-card text-muted-foreground text-[15px] flex flex-col md:flex-row items-center justify-between gap-3"
        >
            {/* Repozytorium */}
            <div className="flex items-center gap-2 mb-2 md:mb-0">
                <Github className="w-5 h-5 text-muted-foreground"/>
                <a
                    href="https://github.com/Guliveer/song-request"
                    target="_blank"
                    rel="noopener"
                    className="font-medium hover:text-primary transition-colors underline-offset-2 hover:underline"
                >
                    Project repo
                </a>
            </div>

            {/* Autorzy */}
            <div className="flex items-center gap-3 flex-wrap mb-2 md:mb-0">
                {authors.map((author) => (
                    <a
                        key={author.url}
                        href={author.url}
                        target="_blank"
                        rel="noopener"
                        className="inline-flex items-center gap-1 px-1 py-0.5 rounded transition-colors font-semibold hover:text-primary"
                    >
                        <Github className="w-4 h-4"/>
                        <span className="text-[15px]">{author.name}</span>
                    </a>
                ))}
            </div>

            {/* Copyright */}
            <span className="font-normal tracking-wide text-[13px]">
                                    © {new Date().getFullYear()} Track Drop
                                </span>
        </footer>
    );
}