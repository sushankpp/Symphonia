import {useEffect, useRef, useState} from "react";

const MusicPlayer = () => {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateTime = () => setCurrentTime(audio.currentTime);
        const updateDuration = () => setDuration(audio.duration);

        audio.addEventListener('timeupdate', updateTime);
        audio.addEventListener('loadedmetadata', updateDuration);

        return () => {
            audio.removeEventListener('timeupdate', updateTime);
            audio.removeEventListener('loadedmetadata', updateDuration);
        }
    }, []);

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;

        if (audio.paused) {
            audio.play();
            setIsPlaying(true);
        } else {
            audio.pause();
            setIsPlaying(false);
        }
    }

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const audio = audioRef.current;
        if (!audio) return;

        const seekTime = parseFloat(e.target.value);
        audio.currentTime = seekTime;
        setCurrentTime(seekTime);
    }

    return (
        <section className="music-player">
            <h2 className="music-player__title">
                <svg className="icon icon-playlist">
                    <use xlinkHref="#icon-playlist"></use>
                </svg>
                Now Playing
            </h2>
            <figure className="music-player__media">
                <img src="/uploads/pig.png" alt="artist name"/>
            </figure>
            <div className="music-player__meta">
                <h3 className="music-player__meta-title">Omah Lay</h3>
                <p className="music-player__meta-description">Godly</p>
            </div>
            <div className="custom-audio-player">
                <audio src="/audio/demo.mp3" ref={audioRef} id="audio"></audio>
                <div className="controls">
                    <button onClick={togglePlay} className="play">{isPlaying ? '❚❚' : '▶'}</button>
                    <input type="range" min="0" max={duration} value={currentTime}
                           onChange={handleSeek}/>
                    <span
                        id="currentTime">{Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}</span>
                    / <span
                    id="duration">{Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}</span>
                </div>
            </div>

            <div className="music-player__suggested">
                <div className="music-player__suggested-item">
                    <div className="music-player__suggested-banner">

                        <figure className="music-player__suggested-media">
                            <img src="/uploads/pig.png" alt="artist name"/>
                        </figure>
                        <div className="music-player__suggested-meta">
                            <div className="meta-header">
                                <h3 className="music-player__suggested-meta-title">Omah Lay</h3>
                                <p className="music-player__suggested-meta-description">Godly</p>
                            </div>
                        </div>
                    </div>
                    <p className="timeStamp">2:02</p>
                </div>
            </div>
        </section>
    )
}

export default MusicPlayer;