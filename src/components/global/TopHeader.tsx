const TopHeader = () => {
    return (
        <section className="main-header">
            <div className="main-header__nav">
                <ul className="main-header__nav-items">
                    <li><a href="">Music</a></li>
                    <li><a href="">Upload Music</a></li>
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
                <a href="#">
                    <svg className="icon icon-notification">
                        <use xlinkHref="#icon-notification"></use>
                    </svg>
                </a>
                <a href="#">
                    <svg className="icon icon-settings">
                        <use xlinkHref="#icon-settings"></use>
                    </svg>
                </a>
                <a href="#" className="user__profile">
                    <figure className="header__media">
                        <img src="/uploads/pig.png" alt="user image"/>
                    </figure>
                </a>
            </div>
        </section>
    )
}

export default TopHeader;