const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: true, // OS hissi için tam ekran
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // Preload dosyasını buradan okur
    }
  });

  // KRİTİK DEĞİŞİKLİK: İnternet linki yerine yerel dosyayı yükler
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Sayfa yüklenemezse beyaz ekran yerine hata ver
  mainWindow.webContents.on('did-fail-load', () => {
    mainWindow.loadFile(path.join(__dirname, 'index.html'));
  });
}

// Wi-Fi Tarama Motoru (nmcli kullanarak)
ipcMain.handle('get-wifi-list', async () => {
  return new Promise((resolve) => {
    exec('nmcli -t -f SSID,SIGNAL,SECURITY dev wifi', (error, stdout, stderr) => {
      if (error) {
        resolve([{ ssid: "Wi-Fi Kartı Hazır Değil", strength: "0" }]);
      } else {
        const networks = stdout.split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            const parts = line.split(':');
            return { ssid: parts[0] || "Gizli Ağ", strength: parts[1] || "0" };
          });
        resolve(networks);
      }
    });
  });
});

// Sistem Komutları (Kapatma/Yeniden Başlatma)
ipcMain.on('system-command', (event, command) => {
  if (command === 'shutdown') exec('sudo shutdown -h now');
  if (command === 'reboot') exec('sudo reboot');
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});