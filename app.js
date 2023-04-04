const path = require('path');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');

const isDev = process.env.NODE_ENV !== 'production';
const isWindows = process.platform === 'win32';

// Create main window
const createMainWindow = () => {
  const mainWindow = new BrowserWindow({
    title: 'Image Resizer',
    width: isDev ? 1000 : 500,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    }
  });

  // Open dev tools if in dev env
  if (isDev) mainWindow.webContents.openDevTools();

  mainWindow.loadFile(path.join(__dirname, './renderer/index.html'));
}

// Create About window
const createAboutWindow = () => {
  const aboutWindow = new BrowserWindow({
    title: 'about Image Resizer',
    width: 300,
    height: 300
  });

  aboutWindow.loadFile(path.join(__dirname, './renderer/about.html'));
}

// App is Ready
app.whenReady().then(() => {
  createMainWindow();

  // Implement menu
  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

const menu = [
  {
    role: 'fileMenu'
  },
  ...(isWindows ? [{
    label: 'Help',
    submenu: [{
      label: 'About',
      click: createAboutWindow,
    }],
  }] : [])
];

// respond to ipc renderer resize

app.on('window-all-closed', () => {
  if (isWindows) app.quit();
});
