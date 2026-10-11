const fs = require('fs');
const path = require('path');

const backendPath = path.join(__dirname, 'backend');
const srcPath = path.join(backendPath, 'src');

// List of modules to create
const modules = [
    'auth', 'shop', 'inventory', 'order', 'customer', 
    'ai-agent', 'whatsapp', 'voice', 'dashboard', 'notification'
];

// Standard files inside each module
const standardFiles = ['.controller.js', '.service.js', '.model.js', '.route.js', '.validation.js'];

// Base directories in src
const baseDirs = [
    'config', 'database', 'middleware', 'routes', 'services', 'utils', 'modules'
];

console.log('🚀 Folder structure banana shuru ho raha hai...\n');

// 1. Create backend and src folders
fs.mkdirSync(srcPath, { recursive: true });

// 2. Create base directories
baseDirs.forEach(dir => {
    fs.mkdirSync(path.join(srcPath, dir), { recursive: true });
});

// 3. Create module folders and their files
modules.forEach(mod => {
    const modPath = path.join(srcPath, 'modules', mod);
    fs.mkdirSync(modPath, { recursive: true });
    
    standardFiles.forEach(ext => {
        const filePath = path.join(modPath, `${mod}${ext}`);
        // Create an empty file with a comment
        if (!fs.existsSync(filePath)) {
            fs.writeFileSync(filePath, `// TODO: Implement ${mod}${ext}\n`);
        }
    });
});

// 4. Create main entry files
const mainFiles = [
    { path: path.join(srcPath, 'app.js'), content: '// Express app setup\nconst express = require("express");\nconst app = express();\nmodule.exports = app;' },
    { path: path.join(srcPath, 'server.js'), content: '// Server entry point\nconst app = require("./app");\napp.listen(3000, () => console.log("Server running on port 3000"));' },
    { path: path.join(srcPath, 'config', 'db.js'), content: '// MongoDB Connection\n' },
    { path: path.join(srcPath, 'routes', 'index.js'), content: '// Main router combining all module routes\n' }
];

mainFiles.forEach(file => {
    if (!fs.existsSync(file.path)) {
        fs.writeFileSync(file.path, file.content);
    }
});

console.log('✅ Ekdum perfect! Saare folders aur files create ho gaye hain.');
console.log('Aap "backend" folder check kar sakte hain.');
