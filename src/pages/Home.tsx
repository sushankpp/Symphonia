import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import Trending from "../components/ui/cards/Trending.tsx";
import CardListings from "../components/ui/cards/CardListings.tsx";
import RecentlyPlayed from "../components/ui/cards/RecentlyPlayed.tsx";
import MusicPlayer from "../components/ui/cards/MusicPlayer.tsx";
import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";

type MusicPlayerProps = {
    src: string | null;
};

interface Artist {
    id: number;
    artist_name: string;
    artist_image: string;
    music_count: number;
}

export default function Home({src}: MusicPlayerProps) {
    const [artists, setArtists] = useState<Artist[]>([]);
    const apiURL = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        fetch(`${apiURL}/api/artists`)
            .then(response => response.json())
            .then(data => setArtists(data))
            .catch(error => console.error("Error fetching artists:", error));
    }, []);

    const handleArtistClick = (artistId: number) => {
        navigate(`/artists/${artistId}`);
    };

    return (
        <>
            <SidebarHeader/>
            <main className="page__home" id="primary">
                <div className="container">
                    <TopHeader/>
                    <div className="music-items__wrapper">
                        <Trending/>
                        <CardListings
                            artists={artists}
                            onArtistClick={handleArtistClick}
                        />
                        <RecentlyPlayed limit={2}/>
                        <MusicPlayer/>
                    </div>
                </div>
            </main>
        </>
    );
}
