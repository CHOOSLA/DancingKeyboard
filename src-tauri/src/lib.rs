use device_query::{DeviceQuery, DeviceState};
use std::thread;
use std::time::Duration;
use tauri::Emitter;

// 프론트엔드에서 호출할 명령
#[tauri::command]
fn start_listening(app_handle: tauri::AppHandle) {
    println!("Starting OS level keyboard listener (Polling mode)...");
    
    // 별도의 스레드에서 무한 루프를 돌며 키 상태를 체크
    thread::spawn(move || {
        let device_state = DeviceState::new();
        let mut prev_keys = Vec::new();

        loop {
            let current_keys = device_state.get_keys();
            
            // 이전에 눌려있지 않았던 새로운 키가 감지되었을 때만 이벤트 발생
            if current_keys != prev_keys && !current_keys.is_empty() {
                // 새로운 키가 추가되었는지 확인
                let has_new_press = current_keys.iter().any(|k| !prev_keys.contains(k));
                
                if has_new_press {
                    let _ = app_handle.emit("typing", ());
                }
            }
            
            prev_keys = current_keys;
            
            // CPU 점유율 과부하 방지를 위한 미세한 대기 (약 100fps 수준)
            thread::sleep(Duration::from_millis(10));
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
