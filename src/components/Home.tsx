import svgSprite from '../templates-part/template-svg.html?raw';
import SidebarHeader from "./global/SidebarHeader.tsx";
import TopHeader from "./global/TopHeader.tsx";
import Trending from "./trending/Trending.tsx";
import CardListings from "./cardListings/CardListings.tsx";
import RecentlyPlayed from "./recentlyPlayed/RecentlyPlayed.tsx";
import MusicPlayer from "./musicPlayer/MusicPlayer.tsx";

export default function Home() {

    return (
        <>
            <div dangerouslySetInnerHTML={{__html: svgSprite}} style={{display: 'none'}}/>
            <SidebarHeader/>
            <main className="page__home" id="primary">
                <div className="container">
                    <TopHeader/>
                    <div className="music-items__wrapper">
                        <Trending/>
                        <CardListings/>
                        <RecentlyPlayed/>
                        <MusicPlayer/>
                    </div>
                </div>
            </main>
        </>
    )
}