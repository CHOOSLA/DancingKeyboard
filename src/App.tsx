import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import "./App.css";

function App() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // 1. Rust 백엔드에 키보드 리스너 시작 명령 전달
    invoke("start_listening")
      .then(() => console.log("Rust 리스너가 시작되었습니다."))
      .catch((error) => console.error("리스너 시작 실패 : ", error));

    // 2. Rust에서 보내는 'typing'이벤트를 구독
    const unlisten = listen("typing", () => {
      console.log("키보드 입력 감지!");
      setCount((prev) => prev + 1);
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

      <div className="cunter-box">
        <span style={{ fontSize: "5rem" }}>{count}</span>
      </div>

      {count > 0 && (
        <p style={{ animation: "bounce 0.5s infinite" }}>
          캐릭터가 춤출 준비가 되었습니다!
        </p>
      )}
    </main>
  );
}

export default App;
