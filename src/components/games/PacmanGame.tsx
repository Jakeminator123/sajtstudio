"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const CELL_SIZE = 24;

// Maze layout - # = wall, . = pellet, o = power pellet, P = pacman start, - = empty
const MAZE = [
  "############################",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o####.#####.##.#####.####o#",
  "#..........................#",
  "#.####.##.########.##.####.#",
  "#......##....##....##......#",
  "######.##### ## #####.######",
  "     #.##          ##.#     ",
  "######.## ###--### ##.######",
  "#      .  #      #  .      #",
  "######.## ######## ##.######",
  "     #.##          ##.#     ",
  "######.## ######## ##.######",
  "#............##............#",
  "#.####.#####.##.#####.####.#",
  "#o..##.......P .......##..o#",
  "###.##.##.########.##.##.###",
  "#......##....##....##......#",
  "#.##########.##.##########.#",
  "#..........................#",
  "############################",
];

const COLS = MAZE[0]?.length || 28;
const ROWS = MAZE.length;

interface Position {
  x: number;
  y: number;
}

export default function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const pelletsRef = useRef<Set<string>>(new Set());

  // Game speed: update every 150ms (slower than before)
  const GAME_SPEED = 150;

  // Pacman state
  const pacmanRef = useRef<Position & { dx: number; dy: number; mouth: number; dir: number }>({
    x: 13, y: 16, dx: 0, dy: 0, mouth: 0, dir: 1
  });

  // Ghost state
  const ghostsRef = useRef<Array<Position & { dx: number; dy: number; color: string }>>([
    { x: 13, y: 10, dx: 1, dy: 0, color: "#ff6b9d" }
  ]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize pellets
    MAZE.forEach((row, y) => {
      for (let x = 0; x < row.length; x++) {
        if (row[x] === "." || row[x] === "o") {
          pelletsRef.current.add(`${x},${y}`);
        }
      }
    });

    const drawMaze = () => {
      // Semi-transparent dark background to maintain game contrast while showing CSS background
      // Reduced opacity to better show the 8-bit background image
      ctx.fillStyle = "rgba(7, 20, 39, 0.25)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let y = 0; y < ROWS; y++) {
        const row = MAZE[y];
        if (!row) continue;
        for (let x = 0; x < COLS; x++) {
          const cell = row[x];
          if (!cell) continue;
          const px = x * CELL_SIZE;
          const py = y * CELL_SIZE;

          if (cell === "#") {
            // Wall with glow effect
            ctx.shadowColor = "#69a7ff";
            ctx.shadowBlur = 8;
            ctx.fillStyle = "#1b6ffd";
            ctx.fillRect(px + 2, py + 2, CELL_SIZE - 4, CELL_SIZE - 4);
            ctx.shadowBlur = 0;
          } else if (pelletsRef.current.has(`${x},${y}`)) {
            if (cell === ".") {
              // Regular pellet
              ctx.fillStyle = "#e9f2ff";
              ctx.beginPath();
              ctx.arc(px + CELL_SIZE / 2, py + CELL_SIZE / 2, 3, 0, Math.PI * 2);
              ctx.fill();
            } else if (cell === "o") {
              // Power pellet
              ctx.fillStyle = "#e9f2ff";
              ctx.shadowColor = "#69a7ff";
              ctx.shadowBlur = 10;
              ctx.beginPath();
              ctx.arc(px + CELL_SIZE / 2, py + CELL_SIZE / 2, 6, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          }
        }
      }
    };

    const drawPacman = () => {
      const { x, y, mouth, dir } = pacmanRef.current;
      const px = x * CELL_SIZE + CELL_SIZE / 2;
      const py = y * CELL_SIZE + CELL_SIZE / 2;

      ctx.fillStyle = "#5fd3ff";
      ctx.shadowColor = "#69a7ff";
      ctx.shadowBlur = 15;

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate((dir * Math.PI) / 2);

      ctx.beginPath();
      ctx.arc(0, 0, CELL_SIZE / 2 - 2, 0.2 * mouth, Math.PI * 2 - 0.2 * mouth);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
      ctx.shadowBlur = 0;
    };

    const drawGhosts = () => {
      ghostsRef.current.forEach(ghost => {
        const px = ghost.x * CELL_SIZE + CELL_SIZE / 2;
        const py = ghost.y * CELL_SIZE + CELL_SIZE / 2;

        ctx.fillStyle = ghost.color;
        ctx.beginPath();
        ctx.arc(px, py, CELL_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const update = () => {
      if (gameOver || gameWon) return;

      // Update pacman position
      const pacman = pacmanRef.current;
      const nx = pacman.x + pacman.dx;
      const ny = pacman.y + pacman.dy;

      if (MAZE[ny] && MAZE[ny][nx] && MAZE[ny][nx] !== "#") {
        pacman.x = nx;
        pacman.y = ny;

        // Eat pellets
        const pelletKey = `${pacman.x},${pacman.y}`;
        if (pelletsRef.current.has(pelletKey)) {
          pelletsRef.current.delete(pelletKey);
          setScore(prev => prev + 10);

          if (pelletsRef.current.size === 0) {
            setGameWon(true);
          }
        }
      }

      // Animate mouth
      pacman.mouth = (pacman.mouth + 0.3) % 1;

      // Move ghosts with improved AI - aggressive chase
      ghostsRef.current.forEach(ghost => {
        // Smart AI - chase Pacman aggressively
        const dirs = [
          { dx: 0, dy: -1 }, // Up
          { dx: 1, dy: 0 },  // Right
          { dx: 0, dy: 1 },  // Down
          { dx: -1, dy: 0 }  // Left
        ];

        // Calculate distance to Pacman for each possible direction
        const possibleMoves = dirs
          .map(dir => {
            const nx = ghost.x + dir.dx;
            const ny = ghost.y + dir.dy;

            // Check if this direction is valid (not a wall)
            const isValid = MAZE[ny] && MAZE[ny][nx] && MAZE[ny][nx] !== "#";

            if (!isValid) return null;

            // Calculate Manhattan distance to Pacman (faster and more direct)
            const distX = Math.abs(nx - pacman.x);
            const distY = Math.abs(ny - pacman.y);
            const distance = distX + distY; // Manhattan distance for more direct pathfinding

            return { ...dir, distance, nx, ny };
          })
          .filter(move => move !== null) as Array<{ dx: number; dy: number; distance: number; nx: number; ny: number }>;

        if (possibleMoves.length > 0) {
          // Always choose the direction that gets closest to Pacman (90% chase, 10% random for unpredictability)
          let chosenMove;
          if (Math.random() < 0.9) {
            // Aggressive chase mode: choose closest to Pacman
            chosenMove = possibleMoves.reduce((best, current) =>
              current.distance < best.distance ? current : best
            );
          } else {
            // Small chance for random move to add unpredictability
            chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
          }

          // Update ghost direction
          ghost.dx = chosenMove.dx;
          ghost.dy = chosenMove.dy;
        } else {
          // If no valid moves, try to reverse direction as last resort
          ghost.dx = -ghost.dx;
          ghost.dy = -ghost.dy;
        }

        // Move ghost
        const nx = ghost.x + ghost.dx;
        const ny = ghost.y + ghost.dy;

        if (MAZE[ny] && MAZE[ny][nx] && MAZE[ny][nx] !== "#") {
          ghost.x = nx;
          ghost.y = ny;
        } else {
          // If can't move in current direction, try to find any valid direction
          const validDirs = dirs.filter(dir => {
            const testX = ghost.x + dir.dx;
            const testY = ghost.y + dir.dy;
            return MAZE[testY] && MAZE[testY][testX] && MAZE[testY][testX] !== "#";
          });

          if (validDirs.length > 0) {
            const randomDir = validDirs[Math.floor(Math.random() * validDirs.length)];
            ghost.dx = randomDir.dx;
            ghost.dy = randomDir.dy;
          }
        }

        // Check collision with pacman
        if (ghost.x === pacman.x && ghost.y === pacman.y) {
          setGameOver(true);
        }
      });
    };

    const gameLoop = (currentTime: number) => {
      // Throttle game updates to control speed
      if (currentTime - lastUpdateRef.current >= GAME_SPEED) {
        update();
        lastUpdateRef.current = currentTime;
      }

      // Always redraw for smooth animation
      drawMaze();
      drawGhosts();
      drawPacman();
      animationRef.current = requestAnimationFrame(gameLoop);
    };

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      const pacman = pacmanRef.current;
      switch (e.key) {
        case "ArrowUp":
        case "w":
          pacman.dx = 0;
          pacman.dy = -1;
          pacman.dir = 3;
          break;
        case "ArrowRight":
        case "d":
          pacman.dx = 1;
          pacman.dy = 0;
          pacman.dir = 0;
          break;
        case "ArrowDown":
        case "s":
          pacman.dx = 0;
          pacman.dy = 1;
          pacman.dir = 1;
          break;
        case "ArrowLeft":
        case "a":
          pacman.dx = -1;
          pacman.dy = 0;
          pacman.dir = 2;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    // Initialize lastUpdateRef with current time
    lastUpdateRef.current = performance.now();
    gameLoop(performance.now());

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameOver, gameWon]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    pelletsRef.current.clear();
    lastUpdateRef.current = performance.now();
    pacmanRef.current = { x: 13, y: 16, dx: 0, dy: 0, mouth: 0, dir: 1 };
    ghostsRef.current = [{ x: 13, y: 10, dx: 1, dy: 0, color: "#ff6b9d" }];
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Score display */}
      <div className="mb-4 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">PACMAN</h3>
        <p className="text-xl text-white">Score: {score}</p>
        <p className="text-sm text-white/70 mt-2">Use arrow keys or WASD to move</p>
      </div>

      {/* Game canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={COLS * CELL_SIZE}
          height={ROWS * CELL_SIZE}
          className="shadow-2xl"
        />

        {/* Game over / Win overlay */}
        {(gameOver || gameWon) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg"
          >
            <div className="text-center">
              <h3 className="text-4xl font-bold text-white mb-4">
                {gameWon ? "🎉 YOU WIN!" : "💀 GAME OVER"}
              </h3>
              <p className="text-xl text-white mb-6">
                Final Score: {score}
              </p>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition"
              >
                Play Again
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
