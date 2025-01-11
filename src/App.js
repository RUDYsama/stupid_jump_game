import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [dinoY, setDinoY] = useState(0); // ตำแหน่งแนวตั้งของดินโอ
  const [isJumping, setIsJumping] = useState(false); // เช็คว่าดินโออยู่ในระหว่างการกระโดดหรือไม่
  const [isGliding, setIsGliding] = useState(false); // เช็คว่าอยู่ในโหมดการร่อนหรือไม่
  const [glidePower, setGlidePower] = useState(100); // พลังในการร่อน
  const [obstacles, setObstacles] = useState([]); // อุปสรรค
  const [gameOver, setGameOver] = useState(false); // เช็คว่าเกมจบหรือยัง
  const [score, setScore] = useState(0); // คะแนน
  const [speed, setSpeed] = useState(5); // ความเร็วในการเคลื่อนที่ของอุปสรรค
  const [spawnRate, setSpawnRate] = useState(0.005); // ความถี่ในการเกิดของอุปสรรค
  const [canJump, setCanJump] = useState(true); // เช็คว่าดินโอสามารถกระโดดได้หรือไม่

  useEffect(() => {
    if (gameOver) return; // ถ้าเกมจบแล้วจะไม่ทำงาน

    const handleKeyDown = (e) => {
      if ((e.key === ' ' || e.key === 'ArrowUp') && !isJumping && canJump) {
        setIsJumping(true);
        setCanJump(false); // ป้องกันไม่ให้กดกระโดดซ้ำ
      }

      // ฟังก์ชันการร่อน
      if (e.key === 'ArrowDown' && isJumping) {
        setIsGliding(true); // ถ้ากดค้าง ArrowDown จะเริ่มร่อน
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowDown') {
        setIsGliding(false); // เลิกการร่อนเมื่อปล่อยปุ่ม
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const interval = setInterval(() => {
      if (isJumping) {
        setDinoY((prevY) => {
          if (prevY < 150) {  // กระโดดสูงขึ้น
            return prevY + 20; // เพิ่มพลังในการกระโดด
          } else {
            setTimeout(() => {
              setIsJumping(false); // เมื่อถึงจุดสูงสุดแล้วให้เริ่มลง
              setCanJump(true); // สามารถกระโดดได้อีกครั้งเมื่อถึงพื้น
            }, 150); // ให้ดินโออยู่บนอากาศนานขึ้น
            return prevY;
          }
        });
      } else if (dinoY > 0) {
        // เมื่อไม่กระโดด ให้ดินโอค่อยๆ ลงมา
        setDinoY((prevY) => prevY - (isGliding ? 3 : 7)); // ถ้าร่อนจะลงช้าลง
      }

      // เลื่อนอุปสรรคไปทางซ้าย
      setObstacles((prevObstacles) =>
        prevObstacles.map((obstacle) => ({
          ...obstacle,
          x: obstacle.x - speed,
        }))
      );

      // เพิ่มอุปสรรคใหม่ตามความถี่
      if (Math.random() < spawnRate) {
        setObstacles((prevObstacles) => [
          ...prevObstacles,
          { x: 1000, y: 40 + Math.random() * 40, height: 40 + Math.random() * 40 },
        ]);
      }

      // ลบอุปสรรคที่อยู่นอกจอ
      setObstacles((prevObstacles) =>
        prevObstacles.filter((obstacle) => obstacle.x > -20)
      );

      // ตรวจสอบการชนกับอุปสรรค
      if (obstacles.some((obstacle) =>
        obstacle.x < 50 && obstacle.x > 0 &&
        dinoY >= 0 && dinoY <= obstacle.height // ตรวจสอบทั้งแท่งอุปสรรค
      )) {
        setGameOver(true);
        clearInterval(interval); // จบเกมเมื่อชน
      }

      // เพิ่มคะแนน
      setScore((prevScore) => prevScore + 1);

      // ค่อยๆ เพิ่มความเร็วและความถี่ตามคะแนน
      if (score % 100 === 0 && score !== 0) {
        setSpeed((prevSpeed) => prevSpeed + 1); // เพิ่มความเร็วของอุปสรรค
        setSpawnRate((prevRate) => prevRate + 0.002); // เพิ่มความถี่ในการเกิดอุปสรรค
      }

      // ลดพลังในการร่อนเมื่อเวลาไป
      if (isGliding && glidePower > 0) {
        setGlidePower((prevPower) => prevPower - 0.2); // ลดพลังลงทุกๆ รอบ
      } else if (!isGliding && glidePower < 100) {
        setGlidePower((prevPower) => prevPower + 0.1); // เติมพลังในการร่อนเมื่อหยุดร่อน
      }

      if (glidePower <= 0) {
        setIsGliding(false); // เลิกการร่อนเมื่อพลังหมด
      }

    }, 20);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isJumping, dinoY, obstacles, gameOver, score, speed, spawnRate, isGliding, glidePower, canJump]);

  const resetGame = () => {
    setDinoY(0);
    setIsJumping(false);
    setIsGliding(false);
    setGlidePower(100);
    setObstacles([]);
    setGameOver(false);
    setScore(0);
    setSpeed(5);
    setSpawnRate(0.005);
    setCanJump(true);
  };

  const handleTouchStart = () => {
    if (!isJumping && canJump) {
      setIsJumping(true);
      setCanJump(false); // ป้องกันไม่ให้กดกระโดดซ้ำ
    }
  };

  const handleClick = () => {
    if (!isJumping && canJump) {
      setIsJumping(true);
      setCanJump(false); // ป้องกันไม่ให้กดกระโดดซ้ำ
    }
  };

  return (
    <div className="game-container">
      <div className="game-screen">
        {gameOver ? (
          <div className="game-over">
            Game Over! Score: {score} <button onClick={resetGame}>Restart</button>
          </div>
        ) : (
          <div className="dino" style={{ bottom: `${dinoY}px` }}></div>
        )}
        {obstacles.map((obstacle, index) => (
          <div
            key={index}
            className="obstacle"
            style={{
              left: `${obstacle.x}px`,
              height: `${obstacle.height}px`,
            }}
          ></div>
        ))}
        <div className="score">Score: {score}</div>
        <div className="glide-power" style={{ width: `${glidePower}%` }}></div>
      </div>
      <div
        className="jump-button"
        onTouchStart={handleTouchStart}
        onClick={handleClick}  // เพิ่ม onClick สำหรับการคลิกเมาส์
      >
        Jump
      </div>
    </div>
  );
};

export default App;
