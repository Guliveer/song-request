import Link from "next/link";

export default function SongCard({id, title, artist, url, userId, score, rank, addedAt}) {
    // const addedAtDate = new Date(addedAt);
    // const addedAtString = addedAtDate.toDateString();

    return (
        <div className={"song-card"} id={id}>
            <div className={"rank"}>{rank}</div>

            <div className={"about"}>
                <div className={"song"}>
                    <span className={"title"}>
                        <Link href={url} target={"_blank"}>{title}</Link>
                    </span>
                    <span className={"artist"}>{artist}</span>
                </div>
                <div className={"details"}>
                    <span className={"user"}>{userId}</span>
                    <span className={"add-time"}></span>
                </div>
            </div>

            <div className={"voting"}>
                <span className={"vote-up"}>BTN1</span>
                <span className={"score"}>{score}</span>
                <span className={"vote-down"}>BTN2</span>
            </div>
        </div>
    )
}