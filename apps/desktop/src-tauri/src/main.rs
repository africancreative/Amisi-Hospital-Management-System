// AmisiMedOS Local Node — Tauri v2 Entry Point
// Manages: System Tray, LAN Server sidecars, Auto-start, Auto-updater

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, TrayIconBuilder, TrayIconEvent},
    Manager, Runtime,
};
use tauri_plugin_shell::ShellExt;
use local_ip_address::local_ip;

// ---------------------------------------------------------------------------
// Tauri Commands (callable from the frontend via invoke)
// ---------------------------------------------------------------------------

/// Returns the local machine's LAN IP and port for display in the UI.
#[tauri::command]
fn get_node_info() -> serde_json::Value {
    let ip = local_ip()
        .map(|ip| ip.to_string())
        .unwrap_or_else(|_| "127.0.0.1".to_string());

    serde_json::json!({
        "lanIp": ip,
        "webPort": 3000,
        "apiPort": 8080,
        "version": env!("CARGO_PKG_VERSION"),
        "nodeId": "amisimedos-local-edge",
    })
}

// ---------------------------------------------------------------------------
// Main Entry
// ---------------------------------------------------------------------------

fn main() {
    tauri::Builder::default()
        // ── Plugins ─────────────────────────────────────────────────────────
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--autostarted"]),
        ))
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_notification::init())

        // ── App Setup ───────────────────────────────────────────────────────
        .setup(|app| {
            let handle = app.handle().clone();

            // 1. Spawn the Node.js API sidecar (Express on :8080)
            let sidecar_api = app
                .shell()
                .sidecar("node")
                .expect("failed to find node sidecar")
                .args(["dist/index.js"])
                .env("PORT", "8080")
                .spawn()
                .expect("failed to start API sidecar");

            println!("[AmisiMedOS] API Sidecar started (PID: {})", sidecar_api.pid());

            // 2. Spawn the Next.js standalone server (on :3000, LAN accessible)
            let sidecar_web = app
                .shell()
                .sidecar("node")
                .expect("failed to find node sidecar")
                .args([".next/standalone/server.js"])
                .env("PORT", "3000")
                .env("HOSTNAME", "0.0.0.0")  // Critical: LAN accessible
                .spawn()
                .expect("failed to start Next.js sidecar");

            println!("[AmisiMedOS] Web Server started (PID: {})", sidecar_web.pid());

            // 3. Build the System Tray
            let lan_ip = local_ip()
                .map(|ip| ip.to_string())
                .unwrap_or_else(|_| "127.0.0.1".to_string());

            let tray_menu = Menu::with_items(
                app,
                &[
                    &MenuItem::with_id(app, "info", format!("AmisiMedOS • {}", lan_ip), false, None::<&str>)?,
                    &MenuItem::with_id(app, "open", "Open Dashboard", true, None::<&str>)?,
                    &MenuItem::with_id(app, "sync", "Force Sync Now", true, None::<&str>)?,
                    &MenuItem::with_id(app, "quit", "Quit Node", true, None::<&str>)?,
                ],
            )?;

            let _tray = TrayIconBuilder::new()
                .menu(&tray_menu)
                .tooltip("AmisiMedOS Local Node — Running")
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "open" => {
                        if let Some(window) = app.get_webview_window("main") {
                            window.show().unwrap();
                            window.set_focus().unwrap();
                        }
                    }
                    "quit" => {
                        println!("[AmisiMedOS] Shutdown requested from tray.");
                        app.exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { button: MouseButton::Left, .. } = event {
                        if let Some(window) = tray.app_handle().get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;

            Ok(())
        })

        // ── Commands ────────────────────────────────────────────────────────
        .invoke_handler(tauri::generate_handler![get_node_info])

        // ── Window Behaviour ────────────────────────────────────────────────
        .on_window_event(|window, event| {
            // Minimize to tray instead of closing
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                window.hide().unwrap();
                api.prevent_close();
            }
        })

        .run(tauri::generate_context!())
        .expect("error running AmisiMedOS Local Node");
}
