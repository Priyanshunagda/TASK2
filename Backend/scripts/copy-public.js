const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dirPath) {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            console.log(`Created directory: ${dirPath}`);
        }
    } catch (err) {
        console.warn(`Warning: Could not create directory ${dirPath}. Error: ${err.message}`);
        // Don't throw - this might be a permission issue we can ignore
    }
}

function copyFile(source, target) {
    try {
        if (fs.existsSync(source)) {
            fs.copyFileSync(source, target);
            console.log(`Successfully copied ${source} to ${target}`);
        } else {
            console.warn(`Warning: Source file ${source} does not exist`);
        }
    } catch (err) {
        console.warn(`Warning: Could not copy file from ${source} to ${target}. Error: ${err.message}`);
        // Don't throw - this might be a permission issue we can ignore
    }
}

// Get the absolute path to the project root
const projectRoot = path.resolve(__dirname, '..');
const sourceDir = path.join(projectRoot, 'public');
const targetDirs = [
    '/opt/render/project/src/public',
    path.join(projectRoot, 'public')
];

console.log('Starting public directory setup...');
console.log(`Project root: ${projectRoot}`);
console.log(`Source directory: ${sourceDir}`);

// Ensure both source and target directories exist
targetDirs.forEach(dir => {
    console.log(`Ensuring directory exists: ${dir}`);
    ensureDirectoryExists(dir);
});

// Copy index.html to all target directories
const sourceFile = path.join(sourceDir, 'index.html');
targetDirs.forEach(dir => {
    const targetFile = path.join(dir, 'index.html');
    copyFile(sourceFile, targetFile);
});

console.log('Public directory setup completed'); 