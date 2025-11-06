import React from 'react';
import { IoPlayOutline, IoPauseOutline } from 'react-icons/io5';

export const RecordingPlayerButtons = ({ BUTTON_CONFIG, url }) => {
  const [audio, setAudio] = React.useState(null);
  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    if (!url) {
      setAudio(null);
      setIsPlaying(false);
      return;
    }
    const audioEl = new Audio(url);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    audioEl.addEventListener('play', onPlay);
    audioEl.addEventListener('pause', onPause);
    audioEl.addEventListener('ended', onEnded);
    setAudio(audioEl);
    return () => {
      audioEl.pause();
      audioEl.removeEventListener('play', onPlay);
      audioEl.removeEventListener('pause', onPause);
      audioEl.removeEventListener('ended', onEnded);
    };
  }, [url]);

  const handlePlay = () => {
    if (audio) {
      audio.play();
    }
  };

  const handlePause = () => {
    if (audio) {
      audio.pause();
    }
  };

  const handleReload = () => {
    if (audio) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  const handleDownload = () => {
    if (!url) return;
    const link = document.createElement('a');
    link.href = url;
    link.download = 'recording.wav';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const buttonClass =
    "p-2 border border-gray-300 rounded-full bg-[#BAA377] bg-hover hover:text-white hover:border-gray-600 cursor-pointer transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

  const onClickByKey = {
    play: isPlaying ? handlePause : handlePlay,
    reload: handleReload,
    download: handleDownload,
  };

  const disabled = !url;

  return (
    <div className="flex items-center space-x-2">
      {BUTTON_CONFIG.map(({ Icon, label, key }) => {
        const isPlayButton = key === 'play';
        const EffectiveIcon = isPlayButton ? (isPlaying ? IoPauseOutline : IoPlayOutline) : Icon;
        const effectiveLabel = isPlayButton ? (isPlaying ? 'Pause recording' : 'Play recording') : label;
        return (
        <button
          key={key}
          className={buttonClass}
          aria-label={effectiveLabel}
          onClick={onClickByKey[key]}
          disabled={disabled}
          title={disabled ? 'No recording available' : effectiveLabel}
        >
          {EffectiveIcon && <EffectiveIcon className="text-lg" style={{ color: '#ffffff' }} />}
        </button>
        );
      })}
    </div>
  );
};