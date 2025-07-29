import CustomAudioPlayer from "./CustomAudioPlayer.tsx";

type MusicPlayerProps = {
  src: string;
};
const MusicPlayer = ({ src }: MusicPlayerProps) => {
  return (
    <section className="music-player">
      <h2 className="music-player__title">
        <svg className="icon icon-playlist">
          <use xlinkHref="#icon-playlist"></use>
        </svg>
        Now Playing
      </h2>
      <figure className="music-player__media">
        <img src="/uploads/pig.png" alt="artist name" />
      </figure>
      <div className="music-player__meta">
        <h3 className="music-player__meta-title">Omah Lay</h3>
        <p className="music-player__meta-description">Godly</p>
      </div>

      <CustomAudioPlayer src={src} />
      <div className="music-player__suggested">
        <div className="music-player__suggested-item">
          <div className="music-player__suggested-banner">
            <figure className="music-player__suggested-media">
              <img src="/uploads/pig.png" alt="artist name" />
            </figure>
            <div className="music-player__suggested-meta">
              <div className="meta-header">
                <h3 className="music-player__suggested-meta-title">Omah Lay</h3>
                <p className="music-player__suggested-meta-description">
                  Godly
                </p>
              </div>
            </div>
          </div>
          <p className="timeStamp">2:02</p>
        </div>
      </div>
    </section>
  );
};

export default MusicPlayer;
