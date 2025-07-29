const Trending = () => {
  return (
    <section className="trending">
      <div className="trending-wrapper">
        <div className="trending-content">
          <p className="trending-status">Trending</p>
          <h2 className="trending-title">Godly</h2>
          <div className="trending-artist">Omah Lay</div>
          <div className="trending-play">
            <button
              className="trending-play__song btn"
              id="play-song"
              value="play now"
            >
              Play Now{" "}
              <svg className="icon icon-play">
                <use xlinkHref="#icon-play"></use>
              </svg>
            </button>
            <button className="trending-add__song btn" id="add-playlist">
              <svg className="icon icon-add">
                <use xlinkHref="#icon-add"></use>
              </svg>
            </button>
          </div>
        </div>
        <figure className="trending-media">
          <span className="trending-media__item">
            <img
              src="../../../../public/uploads/pig-nobg.png"
              alt="trending artist image"
            />
          </span>
        </figure>
      </div>
    </section>
  );
};

export default Trending;
