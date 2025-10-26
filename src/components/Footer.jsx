import { Typography } from "shadcn/typography";
import { cn } from "@/lib/utils";
import { Github as GitHubIcon } from "lucide-react";
import Link from "next/link";

const authors = [
    {name: "Guliveer", url: "https://github.com/Guliveer"},
    {name: "lifeoverthinker", url: "https://github.com/lifeoverthinker"},
    {name: "Deerion", url: "https://github.com/Deerion"},
    {name: "lukaszgrzecznik", url: "https://github.com/lukaszgrzecznik"},
];

export default function Footer() {
    return (
        <footer id="site-footer"
                className={cn("mt-auto px-4 py-6 w-full", "bg-gradient-to-r from-slate-800/90 to-slate-700/90", "border-t border-slate-600/50", "text-muted-foreground", "flex flex-col md:flex-row", "items-center justify-between", "gap-4 text-sm", "relative z-10")}>
            {/* Repository */}
            <div className="flex items-center gap-3 mb-2 md:mb-0">
                <GitHubIcon className="w-4 h-4 text-muted-foreground"/>
                <Link href="https://github.com/Guliveer/song-request" target="_blank" rel="noopener"
                      className="text-inherit hover:text-primary hover:underline font-medium transition-colors">
                    Project repo
                </Link>
            </div>

            {/* Authors */}
            <div className="flex items-center gap-4 mb-2 md:mb-0">
                {authors.map((author) => (
                    <Link key={author.url} href={author.url} target="_blank" rel="noopener"
                          className={cn("inline-flex items-center gap-1", "px-2 py-1 rounded", "text-inherit hover:text-primary", "transition-colors duration-200")}>
                        <GitHubIcon className="w-4 h-4"/>
                        <Typography variant="sm" className="font-semibold">
                            {author.name}
                        </Typography>
                    </Link>
                ))}
            </div>

            {/* Copyright */}
            <Typography variant="xs" className="font-normal tracking-wide">
                © {new Date().getFullYear()} Track Drop
            </Typography>
        </footer>
    );
}
