import React, { useRef, useEffect } from "react";

const App = () => {
   const canvasRef = useRef(null);
   const sphereRef = useRef({ x: 300, y: 400, radius: 10, dx: 0, dy: 0 });
   const paddleRef = useRef({ x: 250, width: 100 });

   useEffect(() => {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = 600;
      canvas.height = 600;

      const drawPaddle = () => {
         context.fillStyle = "blue";
         context.fillRect(paddleRef.current.x, canvas.height - 100, paddleRef.current.width, 10);
      };

      const drawSphere = () => {
         const sphere = sphereRef.current;
         const sphereX = sphere.x;
         const sphereY = sphere.y;

         context.beginPath();
         context.arc(sphereX, sphereY, sphere.radius, 0, Math.PI * 2);
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
         const speed = 1.5;
         const randomAngle = Math.random() * Math.PI / 2 + Math.PI / 4;

         sphereRef.current.x = 300;
         sphereRef.current.y = 400;

         sphereRef.current.dx = speed * Math.cos(randomAngle);
         sphereRef.current.dy = -speed * Math.sin(randomAngle);
      };

      const updateBallPosition = () => {
         const sphere = sphereRef.current;

         sphere.x += sphere.dx;
         sphere.y += sphere.dy;

         if (sphere.x - sphere.radius <= 0 || sphere.x + sphere.radius >= canvas.width) {
            sphere.dx = -sphere.dx;
         }

         if (sphere.y - sphere.radius <= 0 || sphere.y + sphere.radius >= canvas.height) {
            sphere.dy = -sphere.dy;
         }

         if (
            sphere.y + sphere.radius >= canvas.height - 100 &&
            sphere.x >= paddleRef.current.x &&
            sphere.x <= paddleRef.current.x + paddleRef.current.width
         ) {
            sphere.dy = -sphere.dy;
         }
      };

      const gameLoop = () => {
         context.clearRect(0, 0, canvas.width, canvas.height);
         context.fillStyle = "black";
         context.fillRect(0, 0, canvas.width, canvas.height);

         updateBallPosition();

         drawPaddle();
         drawSphere();
      };

      restartBallMovement();

      const handleMouseClick = () => {
         restartBallMovement();
      };

      const intervalId = setInterval(() => {
         gameLoop();
      }, 1000 / 120);

      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("click", handleMouseClick);

      return () => {
         clearInterval(intervalId);
         canvas.removeEventListener("mousemove", handleMouseMove);
         canvas.removeEventListener("click", handleMouseClick);
      };
   }, []);

   return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
         <canvas ref={canvasRef} width={600} height={600} style={{ cursor: "none" }}></canvas>
      </div>
   );
};

export default App;
