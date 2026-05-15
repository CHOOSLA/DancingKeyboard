import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

// 캐릭터 리스트
const CHARACTERS = ["💃", "🕺", "✨", "🔥", "🐱", "🐰", "🐥"];

function App() {
  const [particles, setParticles] = useState<
    { id: number; char: string; x: number; y: number }[]
  >([]);

  useEffect(() => {
    // 1. Rust 백엔드에 키보드 리스너 시작 명령 전달
    invoke("start_listening")
      .then(() => console.log("Rust 리스너가 시작되었습니다."))
      .catch((error) => console.error("리스너 시작 실패 : ", error));

    // 2. Rust에서 보내는 'typing'이벤트를 구독
    const unlisten = listen("typing", () => {
      const id = Math.random() + Date.now(); // 더 유니크한 ID
      const newParticle = {
        id: id,
        char: CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)],
        x: Math.random() * (window.innerWidth - 150),
        y: Math.random() * (window.innerHeight - 150),
      };

      setParticles((prev) => [...prev.slice(-40), newParticle]); // 최대 동시 노출 40개로 증설

      // 애니메이션 종료 후 자동 제거
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 800);
    });

    // 앱이 꺼질 떄 리스너 해제 ( 메모리 관리 )
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <div className="container">
      {particles.map((p) => (
        <div
          key={p.id}
          className="dancing-character"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            animation: "pop-and-dance 0.8s forwards",
          }}
        >
          {p.char}
        </div>
      ))}
    </div>
  );
}

export default App;
