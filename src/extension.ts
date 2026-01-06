import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import sharp from 'sharp';

// Icon theme file path (will be generated in the extension's output directory)
let iconThemePath: string;
let outputIconsDir: string;

// File system watcher for image files
let fileWatcher: vscode.FileSystemWatcher | undefined;

// Debounce timer for regenerating icons
let regenerateTimer: ReturnType<typeof setTimeout> | undefined;

/**
 * Get supported image extensions from configuration
 */
function getSupportedExtensions(): string[] {
    const config = vscode.workspace.getConfiguration('tlcsdm.iconpreview');
    return config.get<string[]>('supportedExtensions', ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'ico', 'svg', 'webp']);
}

/**
 * Get icon size from configuration
 */
function getIconSize(): number {
    const config = vscode.workspace.getConfiguration('tlcsdm.iconpreview');
    return config.get<number>('iconSize', 16);
}

/**
 * Check if auto activate is enabled
 */
function isAutoActivateEnabled(): boolean {
    const config = vscode.workspace.getConfiguration('tlcsdm.iconpreview');
    return config.get<boolean>('autoActivate', true);
}

/**
 * Find all image files in the workspace
 */
async function findImageFiles(): Promise<vscode.Uri[]> {
    const extensions = getSupportedExtensions();
    const pattern = `**/*.{${extensions.join(',')}}`;
    
    try {
        return await vscode.workspace.findFiles(pattern, '**/node_modules/**');
    } catch {
        return [];
    }
}

/**
 * Generate a thumbnail for an image file
 */
async function generateThumbnail(imagePath: string, outputPath: string): Promise<boolean> {
    const iconSize = getIconSize();
    
    try {
        await sharp(imagePath)
            .resize(iconSize, iconSize, {
                fit: 'contain',
                background: { r: 0, g: 0, b: 0, alpha: 0 }
            })
            .png()
            .toFile(outputPath);
        return true;
    } catch {
        // Silently skip unsupported image formats - this is expected for some files
        return false;
    }
}

/**
 * Generate a unique icon ID for a file
 */
function generateIconId(filePath: string): string {
    // Create a unique ID based on the file path
    const normalized = filePath.replace(/[^a-zA-Z0-9]/g, '_');
    return `img_${normalized}`;
}

/**
 * Generate icon theme JSON with all image file thumbnails
 */
async function generateIconTheme(): Promise<void> {
    const imageFiles = await findImageFiles();
    const supportedExtensions = getSupportedExtensions();
    
    // Ensure output directories exist
    if (!fs.existsSync(outputIconsDir)) {
        fs.mkdirSync(outputIconsDir, { recursive: true });
    }
    
    const iconDefinitions: Record<string, { iconPath: string }> = {};
    const fileNames: Record<string, string> = {};
    
    // Process each image file
    for (const imageUri of imageFiles) {
        const filePath = imageUri.fsPath;
        const fileName = path.basename(filePath);
        const ext = path.extname(filePath).toLowerCase().slice(1);
        
        if (!supportedExtensions.includes(ext)) {
            continue;
        }
        
        const iconId = generateIconId(filePath);
        const thumbnailPath = path.join(outputIconsDir, `${iconId}.png`);
        
        // Generate thumbnail
        const success = await generateThumbnail(filePath, thumbnailPath);
        
        if (success) {
            // Use relative path from icon theme file to thumbnail
            const relativePath = path.relative(path.dirname(iconThemePath), thumbnailPath).replace(/\\/g, '/');
            
            iconDefinitions[iconId] = {
                iconPath: relativePath
            };
            
            // Map this specific file to its icon
            fileNames[fileName] = iconId;
        }
    }
    
    // Create the icon theme JSON
    // Only define icons for specific image files, don't override default file/folder icons
    const iconTheme = {
        iconDefinitions: iconDefinitions,
        fileNames: fileNames
    };
    
    // Write the icon theme file
    fs.writeFileSync(iconThemePath, JSON.stringify(iconTheme, null, 2));
}

/**
 * Debounced icon regeneration
 */
function scheduleIconRegeneration(): void {
    if (regenerateTimer) {
        clearTimeout(regenerateTimer);
    }
    
    regenerateTimer = setTimeout(async () => {
        await generateIconTheme();
    }, 500);
}

/**
 * Activate the icon theme
 */
async function activateIconTheme(): Promise<void> {
    const config = vscode.workspace.getConfiguration('workbench');
    await config.update('iconTheme', 'iconpreview', vscode.ConfigurationTarget.Global);
}

/**
 * Extension activation
 */
export async function activate(context: vscode.ExtensionContext): Promise<void> {
    // Set up paths
    outputIconsDir = path.join(context.extensionPath, 'out', 'icons');
    iconThemePath = path.join(outputIconsDir, 'iconpreview-icon-theme.json');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputIconsDir)) {
        fs.mkdirSync(outputIconsDir, { recursive: true });
    }
    
    // Generate initial icon theme
    await generateIconTheme();
    
    // Auto-activate the icon theme if enabled
    if (isAutoActivateEnabled()) {
        await activateIconTheme();
    }
    
    // Register commands
    const refreshCmd = vscode.commands.registerCommand('tlcsdm.iconpreview.refresh', async () => {
        await generateIconTheme();
        vscode.window.showInformationMessage('Icon Preview: Icons refreshed');
    });
    
    const activateCmd = vscode.commands.registerCommand('tlcsdm.iconpreview.activate', async () => {
        await activateIconTheme();
        vscode.window.showInformationMessage('Icon Preview: Theme activated');
    });
    
    context.subscriptions.push(refreshCmd, activateCmd);
    
    // Watch for image file changes
    const extensions = getSupportedExtensions();
    const pattern = `**/*.{${extensions.join(',')}}`;
    
    fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
    
    fileWatcher.onDidCreate(() => scheduleIconRegeneration());
    fileWatcher.onDidDelete(() => scheduleIconRegeneration());
    fileWatcher.onDidChange(() => scheduleIconRegeneration());
    
    context.subscriptions.push(fileWatcher);
    
    // Watch for configuration changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration((e) => {
            if (e.affectsConfiguration('tlcsdm.iconpreview')) {
                scheduleIconRegeneration();
            }
        })
    );
    
    // Watch for workspace folder changes
    context.subscriptions.push(
        vscode.workspace.onDidChangeWorkspaceFolders(() => {
            scheduleIconRegeneration();
        })
    );
}

/**
 * Extension deactivation
 */
export function deactivate(): void {
    if (regenerateTimer) {
        clearTimeout(regenerateTimer);
    }
    
    if (fileWatcher) {
        fileWatcher.dispose();
    }
}
