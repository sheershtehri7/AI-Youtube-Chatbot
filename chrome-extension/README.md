# AI YouTube Chatbot - Chrome Extension

A powerful Chrome extension that transforms any YouTube video into an interactive AI conversation. The extension automatically detects YouTube videos and provides an AI chatbot interface right on the page.

## ✨ Features

### 🎯 **Automatic Video Detection**
- **Auto-fetch**: Automatically detects when you're on a YouTube video page
- **Smart Recognition**: Extracts video ID, title, and metadata automatically
- **No Manual Input**: Works seamlessly without copying/pasting URLs

### 🎨 **Dual Interface Options**

#### 1. **Popup Interface** (Click Extension Icon)
- **Compact Design**: 400x600px popup window
- **Video Processing**: Process videos with one click
- **Chat Interface**: Full AI conversation capabilities
- **Suggested Questions**: Quick-start question templates

#### 2. **Sidebar Interface** (On YouTube Page)
- **Right Sidebar**: Takes up 20% of page width
- **Video Integration**: Seamlessly integrated with YouTube layout
- **Real-time Chat**: Ask questions while watching
- **Non-intrusive**: Doesn't interfere with video playback

### 🚀 **Smart Functionality**
- **Instant Processing**: AI-powered video analysis
- **Context-Aware**: Responses based on video content
- **Real-time Chat**: Live conversation with AI
- **Copy Responses**: One-click copying of AI answers
- **Suggested Questions**: Pre-built question categories

## 🛠️ Technology Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Chrome APIs**: Extension Manifest V3
- **Backend Integration**: RESTful API calls
- **State Management**: React Hooks

## 📱 Installation & Setup

### Prerequisites
- Node.js 18+ 
- Chrome browser
- Python backend running on localhost:8000

### 1. **Build the Extension**
```bash
cd chrome-extension
npm install
npm run build
```

### 2. **Load in Chrome**
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (top right toggle)
3. Click "Load unpacked"
4. Select the `chrome-extension/dist` folder

### 3. **Extension Permissions**
The extension will request:
- **Active Tab**: To detect YouTube videos
- **Storage**: To save user preferences
- **Scripting**: To inject content scripts
- **Host Permissions**: For YouTube and localhost

## 🎯 How It Works

### **Popup Mode** (Extension Icon Click)
1. **Auto-Detection**: Automatically detects current YouTube video
2. **Video Processing**: One-click video processing with AI
3. **Chat Interface**: Full conversation capabilities
4. **Compact Design**: Optimized for popup window

### **Sidebar Mode** (On YouTube Page)
1. **Automatic Injection**: Content script runs on YouTube video pages
2. **Right Sidebar**: Creates 20% width sidebar on the right
3. **Video Context**: Integrates with current video information
4. **Seamless Experience**: No interruption to video watching

## 🔧 Configuration

### **Environment Variables**
Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000
```

### **Backend Endpoints Required**
- `POST /process` - Process YouTube video
- `POST /ask` - Ask questions to AI

### **Extension Settings**
- **Auto-process**: Automatically process videos
- **Theme**: Light/dark mode preference
- **Sidebar Position**: Left/right sidebar placement

## 📱 User Experience

### **First Time Use**
1. Navigate to any YouTube video
2. Click the extension icon
3. Video is automatically detected
4. Click "Process Video" to start
5. Begin asking questions!

### **Daily Usage**
1. **Watch YouTube videos normally**
2. **Extension automatically detects videos**
3. **Right sidebar appears automatically**
4. **Ask questions while watching**
5. **Get AI-powered insights instantly**

### **Keyboard Shortcuts**
- `Ctrl+Shift+Y` (or `Cmd+Shift+Y` on Mac): Toggle chat sidebar
- `Enter` in chat: Send message
- `Shift+Enter`: New line in chat

## 🎨 Design Features

### **Responsive Layout**
- **Popup**: 400x600px optimized design
- **Sidebar**: 20% page width, full height
- **Mobile**: Responsive design for all screen sizes

### **Visual Elements**
- **Gradient Headers**: Professional blue gradients
- **Smooth Animations**: Framer Motion animations
- **Professional Icons**: Lucide React icon set
- **Modern Typography**: Clean, readable fonts

### **User Interface**
- **Glassmorphism Effects**: Modern visual design
- **Hover States**: Interactive feedback
- **Loading Indicators**: Beautiful spinners
- **Error Handling**: Graceful error messages

## 🔒 Security & Privacy

### **Data Handling**
- **Local Processing**: Video processing happens locally
- **No Data Storage**: No personal data stored
- **Secure API**: HTTPS communication with backend
- **Permission Minimal**: Only necessary permissions requested

### **Privacy Features**
- **No Tracking**: No user behavior tracking
- **Local Storage**: Settings stored locally only
- **Secure Communication**: Encrypted API calls
- **Transparent**: Open source, auditable code

## 🚀 Performance Features

### **Optimization**
- **Lazy Loading**: Components loaded on demand
- **Efficient Rendering**: React optimization
- **Minimal DOM**: Lightweight content injection
- **Fast Response**: Optimized API calls

### **Resource Usage**
- **Low Memory**: Minimal memory footprint
- **Fast Loading**: Quick extension startup
- **Smooth Animations**: 60fps animations
- **Efficient Updates**: Smart re-rendering

## 🐛 Troubleshooting

### **Common Issues**

#### **Extension Not Loading**
- Check if Developer mode is enabled
- Verify the dist folder is selected
- Check Chrome console for errors

#### **Video Not Detected**
- Ensure you're on a YouTube video page
- Check if the URL contains `/watch?v=`
- Refresh the page and try again

#### **Backend Connection Failed**
- Verify backend is running on localhost:8000
- Check CORS settings in backend
- Ensure network connectivity

#### **Sidebar Not Appearing**
- Check if content script is injected
- Verify YouTube page is fully loaded
- Check browser console for errors

### **Debug Mode**
Enable debug logging:
1. Right-click extension icon
2. Select "Inspect popup"
3. Check console for detailed logs

## 🔮 Future Enhancements

### **Planned Features**
- [ ] **Multiple Video Support**: Process multiple videos simultaneously
- [ ] **Chat History**: Persistent conversation history
- [ ] **Export Conversations**: Save chat logs
- [ ] **Advanced Analytics**: Video content insights
- [ ] **Custom Prompts**: User-defined question templates
- [ ] **Voice Input**: Speech-to-text questions
- [ ] **Multi-language**: International language support

### **Technical Improvements**
- [ ] **Service Worker**: Background processing
- [ ] **Offline Mode**: Cached responses
- [ ] **Push Notifications**: Real-time updates
- [ ] **Sync**: Cross-device synchronization
- [ ] **Performance**: Further optimization

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Install dependencies: `npm install`
4. Start development: `npm run dev`
5. Build for production: `npm run build`

### **Code Standards**
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **TypeScript**: Type safety (future)
- **Testing**: Unit and integration tests

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Chrome Extension APIs**: Google's extension platform
- **React Team**: Modern frontend framework
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide Icons**: Beautiful icon set
- **YouTube**: Video platform integration

## 📞 Support

### **Getting Help**
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Comprehensive setup guides
- **Community**: Developer community support
- **Email**: Direct support contact

### **Resources**
- **Chrome Extensions**: Official documentation
- **React**: Frontend framework docs
- **Tailwind CSS**: Styling framework docs
- **API Documentation**: Backend integration guide

---

**Transform your YouTube experience with AI-powered conversations! 🚀**

*Built with ❤️ for the future of interactive video content*
