import React, { useRef, useState, useEffect } from "react";
import AudioPlayer from "./AudioPlayer.jsx";

const App = () => {

   const [gameStarted, setGameStarted] = useState(false);   
   const audioRef = useRef(null);
   const blockRef = useRef([]);
   const blocksPerRow = 8;
   const numberOfRows = 3;
   const blockWidth = 60;
   const blockHeight = 20;
   const blockGap = 8;
   const blockPosition = { x: 30, y: 30 };
   const blockRadius = 10;
   const paddleRadius = 4;

   const resetBlocks = () => {
      blockRef.current = []; 
      for (let row = 0; row < numberOfRows; row++) {
         for (let col = 0; col < blocksPerRow; col++) {
            blockRef.current.push({
               x: blockPosition.x + (blockWidth + blockGap) * col,
               y: blockPosition.y + (blockHeight + blockGap) * row,
               width: blockWidth,
               height: blockHeight,
               blockRadius: blockRadius,
               visible: true
            });
         }
      }
   }

   const canvasRef = useRef(null);
   const sphereRef = useRef({ x: 300, y: 400, radius: 10, dx: 0, dy: 0 });
   const paddleRef = useRef({ x: 250, y: 500, width: 75, height: 10 });

   useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.width = 600;
      canvas.height = 600;

      const drawPaddle = () => {
         const { x, y, width } = paddleRef.current;
         context.fillStyle = "blue"; 
         context.beginPath();
         context.moveTo(x + paddleRadius, y);
         context.lineTo(x + width - paddleRadius, y);
         context.arcTo(x + width, y, x + width, y + paddleRadius, paddleRadius);
         context.lineTo(x + width, y + 10 - paddleRadius); 
         context.arcTo(x + width, y + 10, x, y + 10, paddleRadius);
         context.lineTo(x + paddleRadius, y + 10);
         context.arcTo(x, y + 10, x, y, paddleRadius);
         context.lineTo(x, y + paddleRadius);
         context.arcTo(x, y, x + width - paddleRadius, y, paddleRadius);
         context.closePath();
         context.fill();
      };

      const drawBlock = () => {
         blockRef.current.forEach((block) => {
            if (block.visible) {
               context.fillStyle = "white";
               context.beginPath();
               const { x, y, width, height, blockRadius } = block;
               context.moveTo(x + blockRadius, y);
               context.lineTo(x + width - blockRadius, y);
               context.arcTo(x + width, y, x + width, y + height, blockRadius);
               context.lineTo(x + width, y + height - blockRadius);
               context.arcTo(x + width, y + height, x, y + height, blockRadius);
               context.lineTo(x + blockRadius, y + height);
               context.arcTo(x, y + height, x, y, blockRadius);
               context.lineTo(x, y + blockRadius);
               context.arcTo(x, y, x + width - blockRadius, y, blockRadius);
               context.closePath();
               context.fill();
            }
         });
      };

      const drawSphere = () => {
         const sphere = sphereRef.current;
         context.beginPath();
         context.arc(sphere.x, sphere.y, sphere.radius, 0, Math.PI * 2);
         context.fillStyle = "red";
         context.fill();
         context.closePath();
      };

      const handleMouseMove = (event) => {
         const rect = canvas.getBoundingClientRect();
         const mouseX = event.clientX - rect.left;
         paddleRef.current.x = Math.max(0, Math.min(mouseX - paddleRef.current.width / 2, canvas.width - paddleRef.current.width));
      };

      const restartBallMovement = () => {
         const speed = 3.0;
         const randomAngle = Math.random() * Math.PI / 2 + Math.PI / 4;
         sphereRef.current.x = 300;
         sphereRef.current.y = 400;
         sphereRef.current.dx = speed * Math.cos(randomAngle);
         sphereRef.current.dy = -speed * Math.sin(randomAngle);
      };

      const updateBall = () => {
         const sphere = sphereRef.current;
         const paddle = paddleRef.current;

         /* Update Position */
         sphere.x += sphere.dx;
         sphere.y += sphere.dy;

         /* Boundary Check X */
         if (sphere.x - sphere.radius <= 0 || sphere.x + sphere.radius >= canvas.width)
            sphere.dx = -sphere.dx;

         /* Boundary Check Y */
         if (sphere.y - sphere.radius <= 0 || sphere.y + sphere.radius >= canvas.height)
            sphere.dy = -sphere.dy;

         /* Paddle Collision */
         if (sphere.y + sphere.radius >= paddle.y && 
            sphere.y - sphere.radius <= paddle.y + paddle.height &&      
            sphere.x >= paddle.x &&
            sphere.x <= paddle.x + paddle.width) 
            sphere.dy = -sphere.dy;

         /* Block Collision */
         blockRef.current.forEach((block) => {
            if (block.visible) {
               if (sphere.x + sphere.radius > block.x &&
                   sphere.x - sphere.radius < block.x + block.width &&
                   sphere.y + sphere.radius > block.y &&
                   sphere.y - sphere.radius < block.y + block.height) {
                     block.visible = false;
                     if (sphere.x + sphere.radius > block.x && sphere.x - sphere.radius < block.x + block.width) 
                        sphere.dy = -sphere.dy;
                     else 
                        sphere.dx = -sphere.dx;         
               }   
            }
         });
      };

      resetBlocks();

      const gameLoop = () => {

         context.clearRect(0, 0, canvas.width, canvas.height);
         context.fillStyle = "black";
         context.fillRect(0, 0, canvas.width, canvas.height);
         drawBlock();
         drawSphere();
         drawPaddle();
         
         if (!gameStarted) return;
         
         updateBall();
      };

      const handleMouseClick = () => {
   
            restartBallMovement();
            resetBlocks();
            setGameStarted(true);
            if (audioRef.current)
               audioRef.current.play();
         
      };

      /* Smooth Framerate 120 */
      const intervalId = setInterval(() => gameLoop(), 1000 / 120);

      /* "Canvas" Listeners */
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("click", handleMouseClick);

      return () => {
         clearInterval(intervalId);
         canvas.removeEventListener("mousemove", handleMouseMove);
         canvas.removeEventListener("click", handleMouseClick);
      };
   }, [gameStarted]); 

   return (
      <div className="rounded-xl flex items-center justify-center h-screen bg-gray-100">
         
         <AudioPlayer className="bg-black" audioRef={ audioRef }  width={600} height={60} />
         <canvas ref={ canvasRef } width={ 600 } height={ 600 } style={{ cursor: "none", borderRadius: "30px"}}></canvas>
      </div>
   );
};

export default App;
