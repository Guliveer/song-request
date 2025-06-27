'use server'
import SkeletonSongCard from "@/components/skeletons/SkeletonSongCard";
import { Skeleton } from "shadcn/skeleton";
import PropTypes from "prop-types";

export default function SkeletonQueue({length = 3}) {
    return (
        <div className="flex flex-col items-center w-full px-4 py-6 min-w-[100px]">
            <div className="w-full flex flex-wrap justify-center gap-6">
                {Array.from({ length: length }).map((_, index) => (
                    <SkeletonSongCard key={index} />
                ))}
            </div>
        </div>
    );
}

SkeletonQueue.propTypes = {
    length: PropTypes.number
}
