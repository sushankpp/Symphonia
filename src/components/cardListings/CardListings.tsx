const CardListings = () => {
    return (
        <section className="card-listings">
            <div className="card-listings__header">
                <h2 className="card-listings__title">Top Artists</h2>
                <a href="#" className="card-listings__link">See All</a>
            </div>
            <div className="card-listings__grid">
                <div className="card-listings__item">
                    <a href="#" className="screen-link">artist</a>
                    <figure className="card-listings__media">
                        <img src="/uploads/pig.png" alt="artist name"/>
                    </figure>
                    <h3 className="card-listings__item-title">Omah Lay</h3>
                    <p className="card-listings__item-description"><span>8.5M</span> Plays</p>
                </div>
                <div className="card-listings__item">
                    <figure className="card-listings__media">
                        <img src="/uploads/pig.png" alt="artist name"/>
                    </figure>
                    <h3 className="card-listings__item-title">Omah Lay</h3>
                    <p className="card-listings__item-description"><span>8.5M</span> Plays</p>
                </div>
                <div className="card-listings__item">
                    <figure className="card-listings__media">
                        <img src="/uploads/pig.png" alt="artist name"/>
                    </figure>
                    <h3 className="card-listings__item-title">Omah Lay</h3>
                    <p className="card-listings__item-description"><span>8.5M</span> Plays</p>
                </div>
                <div className="card-listings__item">
                    <figure className="card-listings__media">
                        <img src="/uploads/pig.png" alt="artist name"/>
                    </figure>
                    <h3 className="card-listings__item-title">Omah Lay</h3>
                    <p className="card-listings__item-description"><span>8.5M</span> Plays</p>
                </div>
                <div className="card-listings__item">
                    <figure className="card-listings__media">
                        <img src="/uploads/pig.png" alt="artist name"/>
                    </figure>
                    <h3 className="card-listings__item-title">Omah Lay</h3>
                    <p className="card-listings__item-description"><span>8.5M</span> Plays</p>
                </div>
            </div>
        </section>
    );
}

export default CardListings;