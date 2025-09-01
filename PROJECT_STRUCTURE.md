# Project Structure Guide 🗂️

*A detailed walkthrough of every file and folder in this project.*

## Root Level Files 📋

### Configuration Files
- **`package.json`** - Lists all the code libraries this app uses and defines scripts
- **`package-lock.json`** - Locks specific versions of libraries (don't edit this manually)
- **`vite.config.js`** - Settings for Vite (the build tool)
- **`eslint.config.js`** - Rules for checking code quality
- **`.gitignore`** - Tells Git which files not to track

### Documentation
- **`README.md`** - Main description of the project (this file!)
- **`BEGINNER_GUIDE.md`** - Explains programming concepts for beginners
- **`PROJECT_STRUCTURE.md`** - This file explaining all the files
- **`LICENSE`** - Legal terms for using this code

### Web Page Files
- **`index.html`** - The main HTML file that loads the app

## Source Code (`src/` folder) 💻

### Main Application Files
- **`App.jsx`** - The heart of the application! Contains all the React components and functionality
- **`main.jsx`** - The entry point that tells React to start the app
- **`index.css`** - Global styles that apply to the whole app
- **`App.css`** - Specific styles for the App component

### Assets Folder (`src/assets/`)
- Contains images, icons, and other static files used in the app
- Currently has the default Vite logo

## Public Files (`public/` folder) 🌐

### Static Assets
- **`vite.svg`** - The Vite logo (default icon)
- **`icons/`** folder - Contains app icons for when installed as PWA

*Note: Files in `public/` are served directly without processing*

## Build Output (`dist/` folder) 📦

*This folder is created when you run `npm run build`*

Contains the optimized, production-ready version of your app:
- **`index.html`** - Optimized HTML file
- **`assets/`** - Minified CSS and JavaScript files
- **`sw.js`** - Service worker for PWA functionality
- **`manifest.webmanifest`** - PWA configuration

⚠️ **Don't edit these files manually** - they're automatically generated

## Other Folders 📁

### `node_modules/` 
- Contains all the downloaded code libraries
- **Never edit these files**
- **Don't commit this folder** to Git (it's in .gitignore)
- Can be recreated with `npm install`

### `trades-quote-preview/`
- Appears to be a separate, smaller project
- Has its own `package.json` and source code
- Seems unrelated to the main Success Code app

### `.git/` (hidden folder)
- Contains Git version control history
- **Don't touch this folder** unless you know what you're doing

## File Types Explained 📄

### `.jsx` files
```jsx
import React from 'react'

function MyComponent() {
  return <div>Hello World</div>
}
```
- JavaScript files that can contain HTML-like syntax (JSX)
- Used for React components

### `.css` files  
```css
.my-class {
  color: blue;
  font-size: 16px;
}
```
- Define how things look (colors, sizes, layout)

### `.json` files
```json
{
  "name": "my-app",
  "version": "1.0.0",
  "dependencies": {}
}
```
- Store configuration and data in a structured format

### `.js` files
```javascript
const message = "Hello World"
console.log(message)
```
- Regular JavaScript code (no JSX)

### `.html` files
```html
<!DOCTYPE html>
<html>
  <body>
    <div id="root"></div>
  </body>
</html>
```
- Standard web page markup

## Development vs Production 🔧

### Development Mode (`npm run dev`)
- Files are served directly from `src/` folder
- Code is not optimized (easier to debug)
- Hot reloading (changes appear immediately)
- Source maps help with debugging

### Production Mode (`npm run build`)
- Code is optimized and minified
- Files are bundled together for faster loading
- Output goes to `dist/` folder
- Ready for deployment to a web server

## How Files Connect 🔗

1. **`index.html`** loads **`main.jsx`**
2. **`main.jsx`** imports and renders **`App.jsx`**
3. **`App.jsx`** imports **`index.css`** and **`App.css`**
4. **Vite** bundles everything together during build

```
index.html → main.jsx → App.jsx → (all other components)
     ↓
  index.css, App.css (styling)
```

## Important: What NOT to Edit ❌

- `node_modules/` - Downloaded libraries
- `dist/` - Built files (regenerated each build)  
- `package-lock.json` - Library version locks
- `.git/` - Version control data

## Safe to Edit ✅

- `src/` files - Your app code
- `public/` files - Static assets
- `README.md` - Documentation
- `package.json` - Project configuration (be careful!)

## Quick Reference Commands 🏃

```bash
npm install          # Download all libraries
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Check code quality
```

Need help understanding any of these files? Check out the `BEGINNER_GUIDE.md` for more programming concepts!