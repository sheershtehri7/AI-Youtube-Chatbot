# 🚀 **Installation Guide for AI YouTube Chatbot Extension**

## **Step 1: Build the Extension**
```bash
cd chrome-extension
npm install
npm run build
```

## **Step 2: Load in Chrome**
1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top right)
3. Click **"Load unpacked"**
4. Select the `chrome-extension` folder (not the dist folder)

## **Step 3: Test the Extension**
1. Navigate to any YouTube video page
2. Click the extension icon in your toolbar
3. The popup should show video detection
4. A sidebar should appear on the right side of YouTube pages

## **Troubleshooting**

### **If you get a blank white screen:**
- Make sure you're on a YouTube video page (`youtube.com/watch?v=...`)
- Check the browser console for errors
- Try refreshing the page

### **If the sidebar doesn't appear:**
- Make sure you're on a YouTube video page
- Check if the extension is enabled
- Try refreshing the page

### **If you get icon errors:**
- Create a simple 16x16 PNG icon and save it as `icons/icon16.png`
- Or use any existing icon file

## **Features**
✅ **Auto-detects YouTube videos**  
✅ **Popup interface** when clicking extension icon  
✅ **Sidebar chat** on YouTube video pages  
✅ **Video processing** via backend API  
✅ **AI chat interface** for video questions  

## **Backend Required**
Make sure your Python backend is running on `localhost:8000` for full functionality.
