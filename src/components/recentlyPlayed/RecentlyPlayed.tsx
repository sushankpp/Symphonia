const RecentlyPlayed = ()=>{
    return(
        <section className="recently-played">
            <div className="recently-played__header">
                <h2 className="recently-played__title">Recently Played</h2>
                <a href="#" className="recently-played__link">See All</a>
            </div>
            <div className="recently-played__wrapper">
                <div className="recently-played__item">
                    <figure className="recently-played__media">
                        <img src="/uploads/pig.png" alt="artist name"/>
                    </figure>
                    <div className="recently-played__meta">
                        <h3 className="recently-played__item-title">Omah Lay</h3>
                        <h4 className="recently-played__item-subtitle">Omah Lay</h4>
                        <p className="timeStamp">3:21</p>
                        <button className="recently-played__music-add" id="add-playlist">
                            <svg className="icon icon-add">
                                <use xlinkHref="#icon-add"></use>
                            </svg>
                        </button>
                    </div>
                </div>
                <div className="recently-played__item">
                    <figure className="recently-played__media">
                        <img src="/uploads/pig.png" alt="artist name"/>
                    </figure>
                    <div className="recently-played__meta">
                        <h3 className="recently-played__item-title">Omah Lay</h3>
                        <h4 className="recently-played__item-subtitle">Omah Lay</h4>
                        <p className="timeStamp">3:21</p>
                        <button className="recently-played__music-add" id="add-playlist">
                            <svg className="icon icon-add">
                                <use xlinkHref="#icon-add"></use>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default RecentlyPlayed;