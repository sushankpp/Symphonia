import { useEffect, useRef, useState } from "react";
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Rewind,
  FastForward,
  Loader2,
  SkipBack,
  SkipForward,
} from "lucide-react";
import * as React from "react";
import { addToRecentlyPlayed } from "../../../utils/recentlyPlayed.tsx";

type CustomAudioPlayerProps = {
  src: string;
  title?: string;
  artist?: string;
  autoPlay?: boolean;
  onPrevSong?: () => void;
  onNextSong?: () => void;
  onPlay?: () => void;
  hasPrevNext?: boolean;
  songId?: number;
};

function CustomAudioPlayer({
  src,
  title,
  artist,
  autoPlay = false,
  onNextSong,
  onPrevSong,
  onPlay,
  hasPrevNext = false,
  songId,
}: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const [metadataLoaded, setMetadataLoaded] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setMetadataLoaded(false);
    setCurrentTime(0);
    setDuration(0);
  }, [src]);

  const handleSongEnd = () => {
    setIsPlaying(false);
    if (onNextSong && hasPrevNext) {
      onNextSong();
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    //Initial setup
    audio.volume = volume;
    audio.muted = isMuted;
    audio.playbackRate = playbackRate;

    if (autoPlay) {
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    }

    //audio events
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      updateProgressBar();
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
      setMetadataLoaded(true);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => handleSongEnd();
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onError = () => {
      setIsLoading(false);
      console.error("Audio error occurred");
    };

    // Update progress bar
    const updateProgressBar = () => {
      if (progressFillRef.current && audio.duration) {
        const percentage = (audio.currentTime / audio.duration) * 100;
        progressFillRef.current.style.width = `${percentage}%`;
      }
    };

    //event listeners
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("error", onError);

    //clear event listeners
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("error", onError);
    };
  }, [volume, isMuted, playbackRate, autoPlay, onNextSong, hasPrevNext]);

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    }

    if (songId) {
      addToRecentlyPlayed(songId)
        .then(() => console.log("Added to recently played"))
        .catch((error) =>
          console.error("Failed to add to recently played:", error)
        );
    }
  };
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      // Only show loading if metadata hasn't been loaded yet
      if (!metadataLoaded) {
        setIsLoading(true);
      }

      audio
        .play()
        .then(() => {
          setIsPlaying(true);
          handlePlay();
        })
        .catch((error) => {
          console.log("play failed:", error);
          setIsPlaying(false);
          setIsLoading(false);
        });
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const progressBar = progressBarRef.current;
    if (!audio || !progressBar) return;

    const rect = progressBar.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const newTime = clickPosition * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  //toggle mute
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsMuted(!isMuted);
    audio.muted = !isMuted;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audio.volume = newVolume;

    if (newVolume === 0) {
      setIsMuted(true);
      audio.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audio.muted = false;
    }
  };

  // Skip forward 10 seconds
  const skipForward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.min(audio.currentTime + 10, duration);
  };

  // skip backward 10 seconds
  const skipBackward = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.currentTime = Math.max(audio.currentTime - 10, 0);
  };

  //change playback rate
  const changePlaybackRate = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const rates = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    const currentIndex = rates.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % rates.length;
    const newRate = rates[nextIndex];

    setPlaybackRate(newRate);
    audio.playbackRate = newRate;
  };

  // Handle mouse events for volume controls
  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div className="custom-audio-player">
      <audio src={src} ref={audioRef} id="audio" preload="metadata"></audio>
      {(title || artist) && (
        <div className="track-info">
          {title && <h3 className="artist-song-title">{title}</h3>}
          {artist && <h3 className="artist-name">{artist}</h3>}
        </div>
      )}
      <div className="progress-container">
        <div className="progress-bar" ref={progressBarRef} onClick={handleSeek}>
          <div className="progress-filler" ref={progressFillRef}></div>
        </div>
        <div className="time-display">
          <span className="current-time">{formatTime(currentTime)}</span>
          <span className="duration">
            {isLoading ? "--:--" : formatTime(duration)}
          </span>
        </div>
      </div>

      <div className="controls-container">
        {hasPrevNext && (
          <button
            className="prev-song"
            onClick={() => onPrevSong && onPrevSong()}
            disabled={isLoading}
          >
            <SkipBack size={20} />
          </button>
        )}
        <div className="playback-controls">
          <button className="skip-backward" onClick={skipBackward}>
            <Rewind size={20} />
          </button>
          <button
            className="play-pause"
            onClick={togglePlay}
            disabled={isLoading && !metadataLoaded}
          >
            {isLoading && !metadataLoaded ? (
              <Loader2 size={30} className="icon-spin" />
            ) : isPlaying ? (
              <Pause size={30} />
            ) : (
              <Play size={30} />
            )}
          </button>
          <button className="skip-forward" onClick={skipForward}>
            <FastForward size={20} />
          </button>
        </div>
        {hasPrevNext && (
          <button
            className="next-song"
            onClick={() => onNextSong && onNextSong()}
            disabled={isLoading}
          >
            <SkipForward size={20} />
          </button>
        )}
        <div
          className="volume-controls"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="volume-button" onClick={toggleMute}>
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          {isHovering && !isMuted && (
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolumeChange}
            />
          )}
        </div>
        <div className="playback-rate">
          <button className="rate-button" onClick={changePlaybackRate}>
            {" "}
            {playbackRate}x
          </button>
        </div>
      </div>
      {(isLoading && !metadataLoaded) || isBuffering ? (
        <div className="status-indicators">
          {isLoading && !metadataLoaded && (
            <div className="loading-indicator">
              <Loader2 size={16} className="icon-spin" /> Loading...
            </div>
          )}
          {isBuffering && (
            <div className="buffering-indicator">
              <Loader2 size={16} className="icon-spin" /> Buffering....
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default CustomAudioPlayer;
