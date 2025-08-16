@echo off
echo Building AI YouTube Chatbot Chrome Extension...
echo.

echo Creating icon files...
if not exist "icons" mkdir icons

echo Creating a simple icon...
echo ^<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"^>^<rect width="16" height="16" rx="3" fill="#3B82F6"/^>^<path d="M4 4L12 8L4 12V4Z" fill="white"/^>^<circle cx="12" cy="4" r="2" fill="#EF4444"/^>^</svg^> > icons\icon16.svg

echo Installing dependencies...
npm install

echo.
echo Building extension...
npm run build

echo.
echo Build complete! 
echo Load the 'dist' folder in Chrome extensions.
echo.
echo Note: If you get icon errors, manually create a 16x16 PNG icon
echo and save it as 'icons/icon16.png'
echo.
pause
