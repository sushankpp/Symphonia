import {Link} from "react-router-dom";

const TopHeader = () => {
    return (
        <section className="main-header">
            <div className="main-header__nav">
                <ul className="main-header__nav-items">
                    <li><Link to="/music">Music</Link></li>
                    <li><Link to="/upload">Upload Music</Link></li>
                </ul>
            </div>
            <div className="search-music">
                <input type="text" name="Music-Input" id="searchMusic" className="search-music__input"
                       placeholder="Search music name here"/>
                <button className="search-music__btn">
                    <svg className="icon icon-search">
                        <use xlinkHref="#icon-search"></use>
                    </svg>
                </button>
            </div>
            <div className="header__links">
                <Link to="/notification">
                    <svg className="icon icon-notification">
                        <use xlinkHref="#icon-notification"></use>
                    </svg>
                </Link>
                <Link to="/settings">
                    <svg className="icon icon-settings">
                        <use xlinkHref="#icon-settings"></use>
                    </svg>
                </Link>
                <Link to="/profile" className="user__profile">
                    <figure className="header__media">
                        <img src="/uploads/pig.png" alt="user image"/>
                    </figure>
                </Link>
            </div>
        </section>
    )
}

export default TopHeader;