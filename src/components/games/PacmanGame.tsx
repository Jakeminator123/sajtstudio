"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

type Direction = "up" | "right" | "down" | "left";

const detectTouchDevice = () => {
  if (typeof window === "undefined") return false;
  if ("ontouchstart" in window) return true;
  if (typeof navigator !== "undefined" && navigator.maxTouchPoints > 0) return true;
  return window.matchMedia ? window.matchMedia("(pointer: coarse)").matches : false;
};

interface Position {
  x: number;
  y: number;
}

export default function PacmanGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const pelletsRef = useRef<Set<string>>(new Set());
  const [isTouchDevice, setIsTouchDevice] = useState(false);

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

  const changeDirection = useCallback((direction: Direction) => {
    const pacman = pacmanRef.current;
    switch (direction) {
      case "up":
        pacman.dx = 0;
        pacman.dy = -1;
        pacman.dir = 3;
        break;
      case "right":
        pacman.dx = 1;
        pacman.dy = 0;
        pacman.dir = 0;
        break;
      case "down":
        pacman.dx = 0;
        pacman.dy = 1;
        pacman.dir = 1;
        break;
      case "left":
        pacman.dx = -1;
        pacman.dy = 0;
        pacman.dir = 2;
        break;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frameId = requestAnimationFrame(() => {
      setIsTouchDevice(detectTouchDevice());
    });

    if (!window.matchMedia) {
      return () => {
        cancelAnimationFrame(frameId);
      };
    }

    const mediaQuery = window.matchMedia("(pointer: coarse)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsTouchDevice(event.matches);
    };
    mediaQuery.addEventListener("change", handleChange);

    return () => {
      cancelAnimationFrame(frameId);
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, []);

  useEffect(() => {
    if (!isTouchDevice) return;
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (!touch) return;
      touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchMove = () => {
      // Touch move tracking - no need to prevent default for swipe detection
    };

    const handleTouchEnd = (event: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = event.changedTouches[0];
      if (!touch) {
        touchStartRef.current = null;
        return;
      }

      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      const swipeThreshold = 30;

      if (Math.max(absX, absY) < swipeThreshold) {
        return;
      }

      if (absX > absY) {
        changeDirection(deltaX > 0 ? "right" : "left");
      } else {
        changeDirection(deltaY > 0 ? "down" : "up");
      }
    };

    container.addEventListener("touchstart", handleTouchStart, { passive: true });
    container.addEventListener("touchmove", handleTouchMove, { passive: true });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isTouchDevice, changeDirection]);

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
      switch (e.key) {
        case "ArrowUp":
        case "w":
          changeDirection("up");
          break;
        case "ArrowRight":
        case "d":
          changeDirection("right");
          break;
        case "ArrowDown":
        case "s":
          changeDirection("down");
          break;
        case "ArrowLeft":
        case "a":
          changeDirection("left");
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
  }, [gameOver, gameWon, changeDirection]);

  const resetGame = () => {
    setScore(0);
    setGameOver(false);
    setGameWon(false);
    pelletsRef.current.clear();
    lastUpdateRef.current = performance.now();
    pacmanRef.current = { x: 13, y: 16, dx: 0, dy: 0, mouth: 0, dir: 1 };
    ghostsRef.current = [{ x: 13, y: 10, dx: 1, dy: 0, color: "#ff6b9d" }];
  };

  const controlHint = isTouchDevice
    ? "Swipe across the game area or tap the arrows to move"
    : "Use arrow keys or WASD to move";

  const controlButtonClass =
    "rounded-2xl bg-white/15 border border-white/30 text-white text-2xl h-14 w-14 flex items-center justify-center shadow-lg active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70 backdrop-blur";

  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Score display */}
      <div className="mb-4 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">PACMAN</h3>
        <p className="text-xl text-white">Score: {score}</p>
        <p className="text-sm text-white/70 mt-2 text-center">{controlHint}</p>
      </div>

      {/* Game canvas */}
      <div
        className="relative"
        ref={containerRef}
        style={{ touchAction: isTouchDevice ? "none" : "auto" }}
      >
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

      {isTouchDevice && (
        <div className="mt-6 flex flex-col items-center gap-3 text-white/80 w-full">
          <div className="grid grid-cols-3 gap-3 w-full max-w-[220px] select-none">
            <span />
            <button
              type="button"
              className={controlButtonClass}
              onPointerDown={(event) => {
                event.preventDefault();
                changeDirection("up");
              }}
              aria-label="Move up"
            >
              ↑
            </button>
            <span />
            <button
              type="button"
              className={controlButtonClass}
              onPointerDown={(event) => {
                event.preventDefault();
                changeDirection("left");
              }}
              aria-label="Move left"
            >
              ←
            </button>
            <button
              type="button"
              className={controlButtonClass}
              onPointerDown={(event) => {
                event.preventDefault();
                changeDirection("down");
              }}
              aria-label="Move down"
            >
              ↓
            </button>
            <button
              type="button"
              className={controlButtonClass}
              onPointerDown={(event) => {
                event.preventDefault();
                changeDirection("right");
              }}
              aria-label="Move right"
            >
              →
            </button>
          </div>
          <p className="text-xs text-white/60 text-center px-4">
            Quick swipes across the game area also change direction instantly.
          </p>
        </div>
      )}
    </div>
  );
}
