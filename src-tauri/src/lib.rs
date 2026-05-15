use device_query::{DeviceQuery, DeviceState};
use std::thread;
use std::time::Duration;
use tauri::{Emitter, Manager};

// 프론트엔드에서 호출할 명령
#[tauri::command]
fn start_listening(app_handle: tauri::AppHandle) {
    println!("Starting OS level keyboard listener (Polling mode)...");
    
    // 마우스 클릭 통과 설정 (Click-through)
    if let Some(window) = app_handle.get_webview_window("main") {
        let _ = window.set_ignore_cursor_events(true);
    }
    
    // 별도의 스레드에서 무한 루프를 돌며 키 상태를 체크
    thread::spawn(move || {
        let device_state = DeviceState::new();
        let mut prev_keys = Vec::new();

        loop {
            let current_keys = device_state.get_keys();
            
            // 새로 눌린 키 각각에 대해 이벤트를 보냄 (연타 및 동시 입력 대응)
            for key in &current_keys {
                if !prev_keys.contains(key) {
                    let _ = app_handle.emit("typing", ());
                }
            }
            
            prev_keys = current_keys;
            
            // 극단적인 반응성을 위해 2ms로 단축
            thread::sleep(Duration::from_millis(2));
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![start_listening])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
