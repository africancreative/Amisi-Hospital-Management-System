// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use local_ip_address::local_ip;
use tauri::api::process::{Command, CommandEvent};
use tauri::Manager;
use std::sync::{Arc, Mutex};

#[tauri::command]
fn get_local_ip() -> String {
    match local_ip() {
        Ok(ip) => ip.to_string(),
        Err(_) => "127.0.0.1".to_string(),
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_handle = app.handle();
            
            // Define data directory for the local postgres instance
            let data_dir = app_handle.path_resolver()
                .app_data_dir()
                .unwrap_or_else(|| std::path::PathBuf::from("./local-db"));
                
            let data_dir_str = data_dir.to_string_lossy().to_string();
            
            // Spawn the Postgres sidecar binary
            let (mut rx, child) = Command::new_sidecar("postgres")
                .expect("Failed to create postgres sidecar command")
                // Pass args to the postgres binary to run in the local data directory
                .args(&["-D", &data_dir_str])
                .spawn()
                .expect("Failed to spawn postgres sidecar");
                
            // Keep track of the child process to kill it on exit
            let child_arc = Arc::new(Mutex::new(Some(child)));
            let child_clone = child_arc.clone();

            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event {
                        CommandEvent::Stdout(line) => println!("[Postgres] {}", line),
                        CommandEvent::Stderr(line) => eprintln!("[Postgres Error] {}", line),
                        CommandEvent::Error(err) => eprintln!("[Postgres Spawn Error] {}", err),
                        CommandEvent::Terminated(payload) => {
                            println!("[Postgres] Terminated with code {:?}", payload.code);
                            // Clear the child handle so we don't try to kill it again
                            if let Ok(mut c) = child_clone.lock() {
                                *c = None;
                            }
                        }
                        _ => {}
                    }
                }
            });

            // Ensure the Postgres process shuts down when Tauri exits
            app_handle.listen_global("tauri://destroyed", move |_| {
                println!("Shutting down local postgres server...");
                if let Ok(mut c) = child_arc.lock() {
                    if let Some(child) = c.take() {
                        let _ = child.kill();
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_local_ip])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
