   import React, { useEffect, useRef, useState } from 'react';
   import myAudioFile from './assets/game-music.mp3';

   const AudioPlayer = ({ audioRef, width = 600, height = 100 }) => {

      const canvasRef = useRef(null);
      const [audioContext, setAudioContext] = useState(null);
      const [analyser, setAnalyser] = useState(null);
      const [dataArray, setDataArray] = useState(null);

      useEffect(() => {
         const audioElement = audioRef.current;
         if (audioElement) {
            audioElement.onplay = () => {
               const context = new (window.AudioContext || window.webkitAudioContext)();
               const analyserNode = context.createAnalyser();
               analyserNode.fftSize = 512 ;
               const bufferLength = analyserNode.frequencyBinCount;
               const dataArray = new Uint8Array(bufferLength);
               const source = context.createMediaElementSource(audioElement);
               source.connect(analyserNode);
               analyserNode.connect(context.destination);
               setAudioContext(context);
               setAnalyser(analyserNode);
               setDataArray(dataArray);
               context.resume();
            };
         }
      }, [audioRef]);

      useEffect(() => {
         if (analyser && dataArray && canvasRef.current) {
            const canvasElement = canvasRef.current;
            const ctx = canvasElement.getContext('2d');
            const drawVisualizer = () => {
               analyser.getByteFrequencyData(dataArray);
               ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
               const lineWidth = 2; 
               const barWidth = (canvasElement.width / dataArray.length) * 2 - lineWidth;
               let barHeight;
               let x = 0;
           
               const maxDataValue = Math.max(...dataArray);
               const startIndex = Math.floor(dataArray.length / 2);
               const endIndex = dataArray.length;
               const secondHalf = dataArray.slice(startIndex, endIndex);
               const averageValue = secondHalf.reduce((sum, value) => sum + value, 0) / secondHalf.length;
           
               for (let i = 0; i < dataArray.length; i++) {
                   barHeight = (dataArray[i] / maxDataValue) * canvasElement.height;
                   ctx.fillStyle = `rgb(255, 255, 255)`;
                   ctx.fillRect(x, canvasElement.height - barHeight, barWidth, barHeight);
                   ctx.strokeStyle = `rgba(255, 255, 10, ${averageValue * 6 / 255})`;
                   ctx.lineWidth = lineWidth;
                   ctx.strokeRect(x, canvasElement.height - barHeight, barWidth, barHeight);
                   x += barWidth + lineWidth;
               }

               requestAnimationFrame(drawVisualizer);
           };
                     
            drawVisualizer();
         }
         
      }, [analyser, dataArray]);

      return (
         <div>
            <audio ref={audioRef} src={myAudioFile} loop style={{ width: '0px', height: '0px' }}>Your browser does not support the audio element.</audio>
            <canvas ref={canvasRef} width={width} height={height} style={{ backgroundColor: 'black', border: 'none', borderRadius: '30px' }} />
         </div>
      );
   };

   export default AudioPlayer;
