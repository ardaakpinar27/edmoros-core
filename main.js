const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: true,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // ARTIK İNTERNETTEN DEĞİL, DİSKTEN YÜKLÜYORUZ
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // GERİ TUŞU VE YENİLEME KORUMASI
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.type === 'mouseDown' && (input.button === 'button4' || input.button === 'button5')) {
      event.preventDefault();
    }
  });
}

// --- DOSYA YÖNETİCİSİ MOTORU ---
ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true });
    return files.map(file => ({
      name: file.name,
      isDirectory: file.isDirectory(),
      path: path.join(dirPath, file.name)
    }));
  } catch (err) { return []; }
});

// --- PAKET YÜKLEYİCİ MOTORU ---
ipcMain.handle('install-package', async (event, filePath) => {
  return new Promise((resolve) => {
    const command = `sudo gdebi -n "${filePath}"`;
    exec(command, (error, stdout, stderr) => {
      resolve({ success: !error, message: error ? stderr : "Kurulum Tamamlandı!" });
    });
  });
});

// --- AYARLARI KAYDETME (REBOOT SONRASI İÇİN) ---
ipcMain.handle('save-settings', async (event, data) => {
  const settingsPath = '/home/edmor/edmor_data/settings.json';
  fs.writeFileSync(settingsPath, JSON.stringify(data), 'utf8');
  return { success: true };
});

app.whenReady().then(createWindow);