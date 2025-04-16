const SidebarHeader = () => {
    return (
        <header className="side-header">
            <div className="header-logo">
                <a href="/"><img src="/uploads/symphonia-logo.svg" alt="symphonia-logo"/></a>
            </div>
            <div className="header-navigation">
                <div className="header-navigation__items">
                    <h2 className="header-navigation__title">Menu</h2>
                    <ul className="header-navigation__item">
                        <li><a href="#">
                            <svg className="icon icon-home">
                                <use xlinkHref="#icon-home"></use>
                            </svg>
                            Home</a></li>
                        <li><a href="#">
                            <svg className="icon icon-music">
                                <use xlinkHref="#icon-music"></use>
                            </svg>
                            Music</a></li>
                        <li><a href="#">
                            <svg className="icon icon-artist">
                                <use xlinkHref="#icon-artist"></use>
                            </svg>
                            Artists</a></li>
                        <li><a href="#">
                            <svg className="icon icon-record">
                                <use xlinkHref="#icon-record"></use>
                            </svg>
                            Record</a></li>
                    </ul>
                </div>
                <div className="header-navigation__items">
                    <h2 className="header-navigation__title">Library</h2>
                    <ul className="header-navigation__item">
                        <li><a href="#">
                            <svg className="icon icon-recent">
                                <use xlinkHref="#icon-recent"></use>
                            </svg>
                            Recent</a></li>
                        <li><a href="#">
                            <svg className="icon icon-albums">
                                <use xlinkHref="#icon-albums"></use>
                            </svg>
                            Albums</a></li>
                        <li><a href="#">
                            <svg className="icon icon-download">
                                <use xlinkHref="#icon-download"></use>
                            </svg>
                            Downloads</a></li>
                    </ul>
                </div>
                <div className="header-navigation__items">
                    <h2 className="header-navigation__title">Playlists</h2>
                    <ul className="header-navigation__item">
                        <li><a href="#">
                            <svg className="icon icon-playlist">
                                <use xlinkHref="#icon-playlist"></use>
                            </svg>
                            Create New Playlist</a></li>
                        <li><a href="#">
                            <svg className="icon icon-playlist">
                                <use xlinkHref="#icon-playlist"></use>
                            </svg>
                            Playlist 1</a></li>
                        <li><a href="#">
                            <svg className="icon icon-playlist">
                                <use xlinkHref="#icon-playlist"></use>
                            </svg>
                            Playlist 2</a></li>
                    </ul>
                </div>
            </div>
        </header>
    )

}

export default SidebarHeader;