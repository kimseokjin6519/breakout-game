import React, { useEffect, useRef } from 'react';
import myAudioFile from './assets/game-music.mp3';

const AudioPlayer = () => {
  const audioRef = useRef(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      audioElement.play();
    }
  }, []);

  return (
    <div>
      <audio ref={audioRef} src={myAudioFile} loop style = {{ width: '600px' }}>
        Your browser does not support the audio element.
      </audio>
    </div>
  );
};

export default AudioPlayer;
