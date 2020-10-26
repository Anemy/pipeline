const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const isDev = require('electron-is-dev');

let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 680,
    // show: false, // Don't show until window is ready.
    webPreferences: {
      nodeIntegration: true
    }
  });
  mainWindow.loadURL(isDev
    ? 'http://localhost:8080'
    : `file://${path.join(__dirname, './build/index.html')}`
  );
  mainWindow.on('closed', () => (mainWindow = null));
}

app.on('ready', createWindow);
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

console.log('Started electron main.js');
