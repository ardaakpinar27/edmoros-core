ipcMain.handle('get-wifi-list', async () => {
  return new Promise((resolve) => {
    // nmcli yüklü mü ve çalışıyor mu kontrol ederek tara
    exec('nmcli -t -f SSID,SIGNAL,SECURITY dev wifi', (error, stdout, stderr) => {
      if (error) {
        console.error("Wi-Fi Hatası:", stderr);
        resolve([{ ssid: "Hata: Ağ Kartı Bulunamadı", strength: "0" }]); 
      } else {
        const networks = stdout.split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            const parts = line.split(':');
            return { 
              ssid: parts[0] || "Gizli Ağ", 
              strength: parts[1] || "0",
              security: parts[2] || "Açık"
            };
          });
        resolve(networks);
      }
    });
  });
});