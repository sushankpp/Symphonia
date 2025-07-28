import SidebarHeader from "../components/ui/headers/SidebarHeader.tsx";
import TopHeader from "../components/ui/headers/TopHeader.tsx";
import RecentlyPlayed from "../components/ui/cards/RecentlyPlayed.tsx";

export default function Recent() {
    return (
        <>
            <SidebarHeader/>
            <main className="page__home" id="primary">
                <div className="container">
                    <TopHeader/>
                    <RecentlyPlayed/>
                </div>
            </main>
        </>
    )

}