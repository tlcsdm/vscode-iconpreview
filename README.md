# VSCode Icon Preview

Preview image files as their own thumbnails in VS Code Explorer. This extension replaces the default file icons for image files with their actual content as thumbnails.

Now supports VS Code 1.107.0 and later, macOS, Linux, and Windows.

Now supports the following image formats:
* png
* jpg/jpeg
* gif
* bmp
* ico
* svg
* webp

## Use
![screenshot](https://raw.github.com/tlcsdm/vscode-iconpreview/master/images/example.png)

## Features

* **Auto-activation**: Automatically activates the icon theme when opening a workspace
* **Live preview**: Image files are shown with their actual content as thumbnails
* **Configurable extensions**: Customize which image formats to preview
* **Configurable icon size**: Adjust the thumbnail size (8-32 pixels)
* **Auto-refresh**: Icons are automatically refreshed when image files are added, modified, or deleted

## Usage

### Automatic Activation
The extension automatically activates its icon theme when you open VS Code. Image files in your workspace will display as thumbnails in the Explorer view.

### Manual Refresh
If icons don't update automatically:
1. Open Command Palette (`Ctrl+Shift+P`)
2. Search for "Icon Preview: Refresh Icons"

### Activate Icon Theme
If the icon theme is not active:
1. Open Command Palette (`Ctrl+Shift+P`)
2. Search for "Icon Preview: Activate Icon Theme"

## Configuration

Open VS Code Settings and search for "Icon Preview" to configure:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `tlcsdm.iconpreview.autoActivate` | boolean | true | Automatically activate the icon theme when opening a workspace |
| `tlcsdm.iconpreview.supportedExtensions` | array | See below | Image file extensions to preview as thumbnails |
| `tlcsdm.iconpreview.iconSize` | number | 16 | Size of the icon thumbnails in pixels (8-32) |

### Default Supported Extensions

* png
* jpg
* jpeg
* gif
* bmp
* ico
* svg
* webp

## Installation

### From VS Code Marketplace
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Icon Preview"
4. Click Install

### From VSIX File
1. Download the `.vsix` file from [Releases](https://github.com/tlcsdm/vscode-iconpreview/releases)
2. In VS Code, open Command Palette (`Ctrl+Shift+P`)
3. Search for "Extensions: Install from VSIX..."
4. Select the downloaded `.vsix` file

### From Jenkins  
Download from [Jenkins](https://jenkins.tlcsdm.com/job/vscode-plugin/job/vscode-iconpreview/)

## Build

This project uses TypeScript and npm (Node.js 22).

```bash
# Install dependencies
npm install

# Compile
npm run compile

# Watch mode (for development)
npm run watch

# Lint
npm run lint

# Package
npx @vscode/vsce package

# Test
npm run test
```

## Related Projects

* [eclipse-iconpreview](https://github.com/tlcsdm/eclipse-iconpreview) - Eclipse version of this plugin

## License

MIT License - see [LICENSE](LICENSE) for details.
