import React, { useEffect, useRef } from 'react';

const Audio = () => {
  const canvasRef = useRef(null);
  const errorRef = useRef(null);

  useEffect(() => {
    let audioContext = null;
    let input = null;
    let analyzer = null;
    let freqByteData = null;

    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    const errorDiv = errorRef.current;

    const showError = () => {
      console.log('Error: Unable to access audio input');
      c.style.display = 'none';
      errorDiv.style.display = 'block';
    };

    const errorCallback = (e) => {
      console.log('Could not get user media!', e);
      showError();
    };

    const successCallback = (stream) => {
      console.log('Successfully accessed audio stream');
      audioContext = new AudioContext();
      input = audioContext.createMediaStreamSource(stream);

      analyzer = audioContext.createAnalyser();
      freqByteData = new Uint8Array(analyzer.frequencyBinCount);

      input.connect(analyzer);

      console.log('Audio context and analyzer connected');

      analyze();
    };

    const analyze = () => {
      analyzer.getByteFrequencyData(freqByteData);

      ctx.clearRect(0, 0, c.width, c.height);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, c.width, c.height);

      const scaleX = (c.width / 1024) * 1.4;
      const scaleY = c.height / 512;
      const yOffset = 25;

      console.log('Analyzing frequency data:', freqByteData);

      for (let i = 0; i < freqByteData.length; i++) {
        const xPos = Math.ceil(i * scaleX);

        // Debug: Log the frequency data at each index
        console.log(`Frequency index ${i}:`, freqByteData[i]);

        // Draw top half
        ctx.fillStyle = hsv2rgb(256 - freqByteData[i], 1, 1);
        ctx.fillRect(
          xPos,
          (256 + yOffset) * scaleY,
          Math.ceil(scaleX),
          -freqByteData[i] * scaleY
        );

        // Draw gray bottom half
        ctx.fillStyle = '#444444';
        ctx.fillRect(
          xPos,
          (256 + yOffset) * scaleY,
          Math.ceil(scaleX),
          (freqByteData[i] * scaleY) / 2
        );
      }

      setTimeout(analyze, 10);
    };

    const hsv2rgb = (h, s, v) => {
      let rgb, i, data = [];
      if (s === 0) {
        rgb = [v, v, v];
      } else {
        h = h / 60;
        i = Math.floor(h);
        data = [v * (1 - s), v * (1 - s * (h - i)), v * (1 - s * (1 - (h - i)))];
        switch (i) {
          case 0:
            rgb = [v, data[2], data[0]];
            break;
          case 1:
            rgb = [data[1], v, data[0]];
            break;
          case 2:
            rgb = [data[0], v, data[2]];
            break;
          case 3:
            rgb = [data[0], data[1], v];
            break;
          case 4:
            rgb = [data[2], data[0], v];
            break;
          default:
            rgb = [v, data[0], data[1]];
            break;
        }
      }
      return (
        '#' +
        rgb
          .map((x) => ('0' + Math.round(x * 255).toString(16)).slice(-2))
          .join('')
      );
    };

    const resizeCanvas = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      console.log('Resizing canvas to:', w, h);

      c.style.width = `${w}px`;
      c.style.height = `${h}px`;

      ctx.canvas.width = w;
      ctx.canvas.height = h;
    };

    if (navigator.mediaDevices) {
      console.log('Attempting to access user media...');
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(successCallback)
        .catch(errorCallback);
    } else {
      console.log('MediaDevices API is not supported in this browser');
      showError();
    }

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    return () => {
      if (audioContext) {
        console.log('Closing audio context');
        audioContext.close();
      }
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} id="soundCanvas"></canvas>
      <div ref={errorRef} id="error" style={{ display: 'none' }}>
        Unable to access audio input. Please check your device settings.
      </div>
    </>
  );
};

export default Audio;
