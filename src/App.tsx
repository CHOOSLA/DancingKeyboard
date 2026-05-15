import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);
  const [isDancing, setIsDancing] = useState(false);

  useEffect(() => {
    // 1. Rust 백엔드에 키보드 리스너 시작 명령 전달
    invoke("start_listening")
      .then(() => console.log("Rust 리스너가 시작되었습니다."))
      .catch((error) => console.error("리스너 시작 실패 : ", error));

    // 2. Rust에서 보내는 'typing'이벤트를 구독
    const unlisten = listen("typing", () => {
      console.log("키보드 입력 감지!");
      setCount((prev) => prev + 1);

      // 타이핑이 감지되면 춤추기
      setIsDancing(true);

      // 0.3 초 이후에 원래 상태로
      setTimeout(() => {
        setIsDancing(false);
      }, 300);
    });

    // 앱이 꺼질 떄 리스너 해제 ( 메모리 관리 )
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  return (
    <main className="container">
      <h1>Dancing Keybaord</h1>
      <p>아무 키나 눌러보세요 (다른 창에서도 작동)</p>

      {/* isDancing 상태에 따라 클래스 토클 */}
      <div 
        className={`dancing-character ${isDancing ? "is-dancing" : ""}`}
        style={{ marginTop: "4rem", marginBottom: "2rem" }}
      >
        🧑‍🩰
      </div>

      <div style={{ marginTop: "2rem" }}>
        <h3>Total Count</h3>
        <span style={{ fontSize: "3rem", fontWeight: "bold" }}>{count}</span>
      </div>
    </main>
  );
}

export default App;
