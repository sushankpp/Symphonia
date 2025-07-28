import {Link} from "react-router-dom";
import svgSprite from '../../../templates/template-svg.html?raw';
import MenuPlaylist from "../menus/MenuPlaylist.tsx";
// import svgSprite from '@templates/template-svg.html?raw';


const SidebarHeader = () => {
    return (
        <>
            <div dangerouslySetInnerHTML={{__html: svgSprite}} style={{display: 'none'}}/>
            <header className="side-header">
                <div className="header-logo">
                    <a href="/public"><img src="/uploads/symphonia-logo.svg" alt="symphonia-logo"/></a>
                </div>
                <div className="header-navigation">
                    <div className="header-navigation__items">
                        <h2 className="header-navigation__title">Menu</h2>
                        <ul className="header-navigation__item">
                            <li><Link to="/">
                                <svg className="icon icon-home">
                                    <use xlinkHref="#icon-home"></use>
                                </svg>
                                Home
                            </Link>
                            </li>
                            <li><Link to="/music">
                                <svg className="icon icon-music">
                                    <use xlinkHref="#icon-music"></use>
                                </svg>
                                Music
                            </Link>
                            </li>
                            <li><Link to="/artists">
                                <svg className="icon icon-artist">
                                    <use xlinkHref="#icon-artist"></use>
                                </svg>
                                Artists</Link>
                            </li>
                            <li><Link to="/record">
                                <svg className="icon icon-record">
                                    <use xlinkHref="#icon-record"></use>
                                </svg>
                                Record</Link></li>
                        </ul>
                    </div>
                    <div className="header-navigation__items">
                        <h2 className="header-navigation__title">Library</h2>
                        <ul className="header-navigation__item">
                            <li><Link to="/recent">
                                <svg className="icon icon-recent">
                                    <use xlinkHref="#icon-recent"></use>
                                </svg>
                                Recent</Link></li>
                            <li><Link to="/albums">
                                <svg className="icon icon-albums">
                                    <use xlinkHref="#icon-albums"></use>
                                </svg>
                                Albums</Link></li>
                            <li><Link to="/downloads">
                                <svg className="icon icon-download">
                                    <use xlinkHref="#icon-download"></use>
                                </svg>
                                Downloads</Link></li>
                        </ul>
                    </div>
                    <MenuPlaylist/>
                </div>
            </header>
        </>
    )

}

export default SidebarHeader;