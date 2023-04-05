const path = require('path');
const os = require('os');
const fs = require('fs');
const resizeImg = require('resize-img');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');

process.env.NODE_ENV = 'production';

const isDev = process.env.NODE_ENV !== 'production';
const isWindows = process.platform === 'win32';
let mainWindow;

// Create main window
const createMainWindow = () => {
  mainWindow = new BrowserWindow({
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

  // remove main window from memory on close
  mainWindow.on('close', () => mainWindow = null);

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
ipcMain.on('image:resize', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageresizer');
  resizeImage(options);
});

// main resizing function
const resizeImage = async ({ imgPath, height, width, dest }) => {
  try {
    const newImg = await resizeImg(fs.readFileSync(imgPath), {
      width: +width,
      height: +height,
    });

    // assign new file a name
    const filename = path.basename(imgPath);

    // create dest folder if it does not exist
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // write file to that folder
    fs.writeFileSync(path.join(dest, filename), newImg);

    // send success message
    mainWindow.webContents.send('image:done');

    // open the dest folder
    shell.openPath(dest);
  } catch (error) {
    console.log(error);
  }
}

app.on('window-all-closed', () => {
  if (isWindows) app.quit();
});
