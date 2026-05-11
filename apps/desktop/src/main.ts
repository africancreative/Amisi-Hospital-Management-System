import { app, BrowserWindow, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';
import isDev from 'electron-is-dev';
import { fork, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;
let tray: Tray | null = null;

function startServer() {
    // In dev, we use ts-node via the package.json script
    // In prod, we fork the compiled index.js
    const serverPath = isDev 
        ? path.join(__dirname, 'index.ts') 
        : path.join(__dirname, 'index.js');

    console.log(`[Electron] Starting Local Node server from: ${serverPath}`);
    
    if (isDev) {
        // In dev, the 'npm run dev' script handles this via concurrently
        return;
    }

    serverProcess = fork(serverPath, [], {
        env: { ...process.env, PORT: '5000', NODE_ENV: 'production' },
        stdio: 'inherit'
    });

    serverProcess.on('error', (err) => {
        console.error('[Electron] Server process error:', err);
    });

    serverProcess.on('exit', (code) => {
        console.log(`[Electron] Server process exited with code ${code}`);
    });
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        title: 'AmisiMedOS - Digital Healthcare',
        icon: path.join(__dirname, 'assets/icon.png'),
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        },
        backgroundColor: '#000000',
    });

    // In a real scenario, we might point to a local setup page if not configured
    // For now, we point to the local node which will redirect to the cloud or show its own UI
    const startUrl = isDev 
        ? 'http://localhost:3000' // Next.js dev server
        : 'https://amisigenuine.com'; // Production cloud URL (with local fallback logic in app)

    mainWindow.loadURL(startUrl);

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createTray() {
    const iconPath = path.join(__dirname, 'assets/tray-icon.png');
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon.resize({ width: 16, height: 16 }));

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Open AmisiMedOS', click: () => { if (mainWindow) mainWindow.show(); else createWindow(); } },
        { type: 'separator' },
        { label: 'Local Node Status: Online', enabled: false },
        { label: 'Restart Local Node', click: () => { 
            if (serverProcess) serverProcess.kill();
            startServer();
        } },
        { type: 'separator' },
        { label: 'Quit', click: () => { app.quit(); } }
    ]);

    tray.setToolTip('AmisiMedOS Local Node');
    tray.setContextMenu(contextMenu);
}

app.on('ready', () => {
    startServer();
    createWindow();
    // createTray(); // Disable tray for now until icons are provided
});

app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

process.on('exit', () => {
    if (serverProcess) serverProcess.kill();
});
