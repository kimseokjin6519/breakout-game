import React, { useRef, useEffect } from "react";

const App = () => {
  const canvasRef = useRef(null);
  const sphereRef = useRef({ x: 250, y: 500, radius: 10, dx: 0, dy: 0 });
  const paddleRef = useRef({ x: 250, width: 100 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Canvas Size
    canvas.width = 600;
    canvas.height = 600;

    // Draw paddle
    const drawPaddle = () => {
      context.fillStyle = "blue";
      context.fillRect(paddleRef.current.x, canvas.height - 100, paddleRef.current.width, 10);
    };

    // Draw sphere
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

    // Handle mouse and update position
    
    const handleMouseMove = (event) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      paddleRef.current.x = Math.max(0, Math.min(mouseX - paddleRef.current.width / 2, canvas.width - paddleRef.current.width));
    };

    // Restart ball movement

    const restartBallMovement = () => {
      const speed = 2; // Ball speed
      const randomAngle = Math.random() * Math.PI / 2 + Math.PI / 4;

      sphereRef.current.x = 250; // Reset ball position
      sphereRef.current.y = 500; // Reset ball position

      sphereRef.current.dx = speed * Math.cos(randomAngle);
      sphereRef.current.dy = -speed * Math.sin(randomAngle); // Ball moves upwards
    };

    // Update ball position and detect collisions
    
    const updateBallPosition = () => {
      const sphere = sphereRef.current;

      // Update ball position

      sphere.x += sphere.dx;
      sphere.y += sphere.dy;

      // Reflect off left / right boundaries

      if (sphere.x - sphere.radius <= 0 || sphere.x + sphere.radius >= canvas.width) {
        sphere.dx = -sphere.dx; // Reverse dx direction
      }

      // Reflect off top boundary
      
      if (sphere.y - sphere.radius <= 0) {
        sphere.dy = -sphere.dy; // Reverse dy direction
      }

      // Reflect off bottom boundary
      
      if (sphere.y + sphere.radius >= canvas.height) {
         sphere.dy = -sphere.dy; // Reverse dy direction
       }

      // Ball / Paddle Collision
      
      if (
        sphere.y + sphere.radius >= canvas.height - 100 && // Ball is touching paddle vertical position

        sphere.x + sphere.radius >= paddleRef.current.x && // Ball is within the horizontal bounds of the paddle
        
        sphere.x - sphere.radius <= paddleRef.current.x + paddleRef.current.width
      ) {
        sphere.dy = -sphere.dy; // Reverse vertical direction (reflect off paddle)
      }

      
    };

    // Redraw the game on each frame

    const gameLoop = () => {

      context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
      context.fillStyle = "black";
      context.fillRect(0, 0, canvas.width, canvas.height); // Redraw background
      updateBallPosition(); // Update ball position and reflect if needed
      drawPaddle();
      drawSphere(); // Draw sphere
      requestAnimationFrame(gameLoop);

    };

    // Start ball movement 
    
    restartBallMovement();

    // Handle click to restart ball movement
    
    const handleMouseClick = () => {
      restartBallMovement();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleMouseClick);

    gameLoop(); // Start the game loop

    return () => {
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
