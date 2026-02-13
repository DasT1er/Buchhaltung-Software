const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

// PORTABLE DATA PATH - next to the EXE!
const isPackaged = app.isPackaged;

// Find the correct portable path
let portableRoot;
if (isPackaged) {
  // Try to find the executable directory
  const execDir = path.dirname(process.execPath);

  // Check if we're in a resources/app folder (extracted portable)
  if (execDir.includes('resources')) {
    // Go up to the root folder (where the EXE was double-clicked)
    portableRoot = execDir.split('resources')[0];
  } else {
    // Direct portable mode - data next to EXE
    portableRoot = execDir;
  }
} else {
  // Development mode
  portableRoot = app.getAppPath();
}

const userDataPath = path.join(portableRoot, 'data');

// Ensure data directories exist
const belegeDir = path.join(userDataPath, 'belege');
if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
  console.log('✅ Created data folder:', userDataPath);
}
if (!fs.existsSync(belegeDir)) {
  fs.mkdirSync(belegeDir, { recursive: true });
  console.log('✅ Created belege folder:', belegeDir);
}

// Log wichtige Pfade für Debugging
console.log('🚀 BuchungsProfi gestartet!');
console.log('📁 Data Pfad:', userDataPath);
console.log('💾 EXE Pfad:', process.execPath);
console.log('📦 App Pfad:', app.getAppPath());

// IPC HANDLERS - File System Operations

// Read JSON data file
ipcMain.handle('read-data', async () => {
  try {
    const filePath = path.join(userDataPath, 'buchungen.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error reading data:', error);
    return null;
  }
});

// Write JSON data file
ipcMain.handle('write-data', async (event, data) => {
  try {
    const filePath = path.join(userDataPath, 'buchungen.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return { success: true };
  } catch (error) {
    console.error('Error writing data:', error);
    return { success: false, error: error.message };
  }
});

// Save beleg file
ipcMain.handle('save-beleg', async (event, { id, buffer, name }) => {
  try {
    const filePath = path.join(belegeDir, id);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return { success: true, path: filePath };
  } catch (error) {
    console.error('Error saving beleg:', error);
    return { success: false, error: error.message };
  }
});

// Read beleg file
ipcMain.handle('read-beleg', async (event, id) => {
  try {
    const filePath = path.join(belegeDir, id);
    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return { success: true, buffer: Array.from(buffer) };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    console.error('Error reading beleg:', error);
    return { success: false, error: error.message };
  }
});

// Delete beleg file
ipcMain.handle('delete-beleg', async (event, id) => {
  try {
    const filePath = path.join(belegeDir, id);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting beleg:', error);
    return { success: false, error: error.message };
  }
});

// Get data path (for info/debugging)
ipcMain.handle('get-data-path', async () => {
  return userDataPath;
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'BuchungsProfi',
    icon: path.join(__dirname, '..', 'dist', 'vite.svg'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  // In production, load the built files
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
  win.loadFile(indexPath);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
