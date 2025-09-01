# Success Code · Lean 🌟

A **simple personal wellness app** that helps you track your daily feelings and create positive self-talk recordings. Perfect for building better self-awareness and personal growth habits!

![Success Code App Screenshot](https://github.com/user-attachments/assets/6f2cac1f-d3bc-4594-8998-21cb3d7ef005)

## What Does This App Do? 🤔

Think of this as your **digital wellness journal** that you can use every day. It has two main features:

### 1. 📝 Daily Check-ins
- Set up **5 reminders throughout your day** (like 8am, 11am, 2pm, 5pm, 8pm)
- When reminded, answer: *"How does it feel to be me right now?"*
- Write down:
  - Your current **feeling** (happy, stressed, excited, etc.)
  - What you were **thinking about** just before that feeling
- Optionally **record your voice** explaining how you feel

### 2. 🎙️ Belief Audio
- Write **positive statements** about yourself (like "I am enough" or "I can handle challenges")
- **Record yourself** saying these statements out loud
- Listen back to build confidence and positive thinking

![Belief Audio Screenshot](https://github.com/user-attachments/assets/9c706a7e-3e53-408a-bd44-492b5cfab788)

## Why Is This Useful? 💡

- **Track patterns** in your emotions throughout the day
- **Build self-awareness** about what affects your mood
- **Create positive self-talk** through belief recordings  
- **Export your data** to see your progress over time
- **Private & secure** - everything stays on your computer, never uploaded anywhere

## How to Run This App 🚀

### What You Need First
- A **computer** with internet connection
- **Node.js** installed ([download here](https://nodejs.org/))
- A **code editor** like VS Code ([download here](https://code.visualstudio.com/))
- A **web browser** like Chrome or Firefox

### Step-by-Step Instructions

1. **Get the code** (if you don't have it already):
   ```bash
   git clone https://github.com/Upsidedownjudge/successcodeapp.git
   cd successcodeapp
   ```

2. **Install the app's dependencies**:
   ```bash
   npm install
   ```
   *(This downloads all the code libraries the app needs)*

3. **Start the app**:
   ```bash
   npm run dev
   ```
   *(This starts a mini web server on your computer)*

4. **Open your web browser** and go to: `http://localhost:5173`

5. **You're done!** The app should now be running and you can start using it.

### Other Useful Commands
- `npm run build` - Creates a production version of the app
- `npm run preview` - Shows what the built app looks like
- `npm run lint` - Checks the code for common mistakes

## What Are All These Files? 📁

Here's what the important files and folders do:

```
successcodeapp/
├── src/                          # The main app code
│   ├── App.jsx                   # The main app component (most important!)
│   ├── main.jsx                  # Tells the browser to start the app
│   ├── index.css                 # Basic styles for the whole app
│   └── App.css                   # Styles specific to the main app
├── public/                       # Files that don't change (like icons)
├── package.json                  # Lists all the libraries the app uses
├── vite.config.js               # Settings for the build tool
├── index.html                   # The web page that loads the app
└── README.md                    # This file you're reading!
```

### The Most Important File: `src/App.jsx`
This file contains **all the app's functionality**! It's written in **React** (a popular way to build web apps) and includes:
- The daily check-in form
- The belief audio recorder
- Data storage (saves to your browser)
- All the buttons and interactive parts

## Technical Stuff (For When You're Ready) 🔧

This app is built with modern web technologies:

- **React 19**: A JavaScript library for building user interfaces
- **Vite**: A fast build tool that makes development easier  
- **Progressive Web App (PWA)**: Can be installed like a mobile app
- **Local Storage**: Saves your data in your browser (not on a server)
- **IndexedDB**: Stores your audio recordings locally
- **ES6 Modules**: Modern JavaScript code organization

### Data Storage
- Your daily check-ins are saved in **localStorage** (like a filing cabinet in your browser)
- Voice recordings are saved in **IndexedDB** (a database in your browser)
- **Nothing is sent to the internet** - it's all private on your device

### Browser Compatibility
- Works in modern browsers (Chrome, Firefox, Safari, Edge)
- Requires microphone permission for voice recordings
- Can be installed as a standalone app on phones and computers

## Customizing the App 🎨

Want to make changes? Here are some easy modifications:

1. **Change the daily schedule**: Edit the `defaultTimes` array in `App.jsx`
2. **Modify the default belief script**: Change the `beliefScript` text
3. **Update the app colors**: Modify the CSS variables in `index.css`
4. **Add new features**: Edit the React components in `App.jsx`

## Getting Help 🆘

New to coding? Here are some great resources:
- [React Tutorial](https://react.dev/learn) - Learn the basics of React
- [JavaScript Basics](https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/JavaScript_basics) - Learn JavaScript fundamentals
- [HTML & CSS Tutorial](https://www.freecodecamp.org/learn/responsive-web-design/) - Learn web page structure and styling

## License 📄

Check the `LICENSE` file for details about how you can use this code.
