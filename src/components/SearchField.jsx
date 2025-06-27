import { useState, useEffect } from 'react';
import { Input } from "shadcn/input"
import { Button } from "shadcn/button"
import { Popover, PopoverTrigger, PopoverContent } from "shadcn/popover"
import { Command, CommandList, CommandItem, CommandGroup } from "shadcn/command"
import { ArrowDownWideNarrow, Search, ArrowUpWideNarrow, Filter } from "lucide-react"
import { motion } from "framer-motion";

const FILTERS = [
    { value: 'title',   label: 'Song title' },
    { value: 'author',  label: 'Author' },
    { value: 'user',    label: 'User' },
];

const SORT_OPTIONS = [
    { value: 'score',    label: 'Score' },
    { value: 'title',    label: 'Song title' },
    { value: 'author',   label: 'Author' },
    { value: 'added_at', label: 'Date added' },
];

export default function SearchField({ onSearchChange, onSortOrderChange }) {
    const [query, setQuery]     = useState("");
    const [filter, setFilter]   = useState("title");
    const [sortField, setField] = useState("score");
    const [sortOrder, setOrder] = useState("desc");
    const [openSort, setOpenSort] = useState(false);
    const [openFilter, setOpenFilter] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => onSearchChange(query, filter), 300);
        return () => clearTimeout(timeout);
    }, [query, filter, onSearchChange]);

    const selectField = (field) => {
        setField(field);
        onSortOrderChange(`${field},${sortOrder}`);
        setOpenSort(false);
    };

    const toggleOrder = () => {
        const next = sortOrder === "asc" ? "desc" : "asc";
        setOrder(next);
        onSortOrderChange(`${sortField},${next}`);
    };

    const selectFilter = (selectedFilter) => {
        setFilter(selectedFilter);
        setOpenFilter(false);
    };

    return (
        <div className="flex flex-col sm:flex-row w-full gap-3 max-w-full items-center border rounded-lg bg-card px-5 py-5 shadow-md h-auto sm:h-20 ">
            {/* Top row: search icon + input */}
            <div className="flex w-full items-center gap-2">
                <Search className="w-6 h-auto aspect-square min-w-5 text-primary" />
                <Input
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            {/* Bottom row: filter and sort controls, stacked on mobile */}
            <div className="flex w-full sm:w-auto gap-3 mt-2 sm:mt-0 justify-end">
                {/* Filter Button */}
                <Popover open={openFilter} onOpenChange={setOpenFilter}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className="flex items-center gap-2"
                        >
                            <Filter className="w-4 h-4" />
                            {FILTERS.find(f => f.value === filter)?.label}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent>
                        <Command>
                            <CommandList>
                                <CommandGroup>
                                    {FILTERS.map(f => (
                                        <CommandItem
                                            key={f.value}
                                            onSelect={() => selectFilter(f.value)}
                                        >
                                            {f.label}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>

                {/* Sort Button Group */}
                <div className="flex">
                    <Button
                        variant="outline"
                        onClick={toggleOrder}
                        className="rounded-none rounded-l-md border-r-0 px-3"
                        aria-label="Toggle sort direction"
                    >
                        {sortOrder === "asc" ? (
                            <ArrowUpWideNarrow className="w-4 h-4" />
                        ) : (
                            <ArrowDownWideNarrow className="w-4 h-4" />
                        )}
                    </Button>
                    <Popover open={openSort} onOpenChange={setOpenSort}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className="rounded-none rounded-r-md border-l-0 px-3"
                            >
                                {SORT_OPTIONS.find(opt => opt.value === sortField)?.label}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent>
                            <Command>
                                <CommandList>
                                    <CommandGroup>
                                        {SORT_OPTIONS.map(opt => (
                                            <CommandItem
                                                key={opt.value}
                                                onSelect={() => selectField(opt.value)}
                                            >
                                                {opt.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
}
