const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readDir: (path) => ipcRenderer.invoke('read-directory', path),
  installPkg: (path) => ipcRenderer.invoke('install-package', path),
  saveSettings: (data) => ipcRenderer.invoke('save-settings', data),
  getSettings: () => ipcRenderer.invoke('get-settings'),
  scanWifi: () => ipcRenderer.invoke('get-wifi-list')
});