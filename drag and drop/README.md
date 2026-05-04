# 📁 Drag & Drop File Uploader

A modern, feature-rich drag-and-drop file uploader built with vanilla JavaScript, HTML5, and CSS3. Upload images with real-time preview, validation, and persistent storage.

## ✨ Features

### Core Functionality
✅ **Drag & Drop Support** - Drag files directly into the designated area  
✅ **Click to Upload** - Click the drop area to select files from your device  
✅ **Image Preview** - Instant preview of uploaded images in a responsive gallery  
✅ **Progress Simulation** - Animated progress bar during upload (simulated with setTimeout)  
✅ **File Validation** - Only accepts JPG, PNG, and GIF formats  
✅ **Size Validation** - Enforces 5MB maximum file size limit  
✅ **Error Handling** - Clear, user-friendly error messages  
✅ **LocalStorage Persistence** - Images persist even after page refresh  
✅ **Delete Functionality** - Remove individual images or clear all at once  

## 🎓 Learning Concepts

### HTML5 APIs
- **Drag & Drop API** - `dragover`, `dragleave`, `drop` events
- **File Input API** - Selecting and accessing file properties
- **FileReader API** - Reading files and converting to Data URLs for preview
- **LocalStorage API** - Persisting data in browser storage

### CSS3 Features
- **Flexbox & Grid Layout** - Responsive gallery design
- **Animations** - Smooth transitions and keyframe animations (float, bounce, slideIn, fadeInUp)
- **Gradients** - Linear gradients for modern styling
- **Media Queries** - Mobile-responsive design
- **Pseudo-classes** - Hover effects and interactive states

### JavaScript Concepts
- **Event Listeners** - Handling multiple event types
- **File Validation** - Type and size checking
- **Object-Oriented Programming** - Class-based architecture
- **Data Persistence** - JSON serialization with localStorage
- **DOM Manipulation** - Creating, updating, and removing elements

## 📂 Project Structure

```
drag and drop/
├── index.html       # Main HTML structure
├── style.css        # Complete styling with animations
├── script.js        # Vanilla JavaScript functionality
└── README.md        # This file
```

## 🚀 Getting Started

### Quick Start
1. Open `index.html` in your web browser
2. Drag and drop image files into the drop area
3. Or click the drop area to select files manually
4. View your uploaded images in the gallery below
5. Refresh the page - your images are still there! (localStorage)

### File Requirements
- **Supported Formats**: JPG, PNG, GIF
- **Maximum Size**: 5MB per file
- **Multiple Upload**: You can upload multiple files at once

## 🎯 How It Works

### Drag & Drop Process
1. User drags files over the drop area → Visual feedback (dragover state)
2. User drops files → `drop` event triggers file processing
3. Files are validated for type and size
4. Valid files are read using FileReader API
5. Base64 encoded images are stored and displayed
6. Progress bar animates to completion
7. Data is saved to localStorage

### Image Preview
- Each uploaded image is displayed in a responsive card grid
- Cards show image thumbnail, filename, and file size
- Hover effect reveals delete button
- Smooth animations on card appearance

### Progress Simulation
- Simulates upload progress using `setInterval`
- Progress bar gradually fills with random increments
- Completes after ~2 seconds of simulation
- Each image has its own independent progress bar

### Data Persistence
- All uploaded images are serialized to JSON
- Stored in browser's localStorage under `uploadedImages` key
- Automatically loaded when page refreshes
- Can be cleared manually using the "Clear All" button

## 💡 Key JavaScript Features

### File Validation
```javascript
validateFile(file) {
    // Check MIME type
    if (!this.allowedFormats.includes(file.type)) {
        return { valid: false, error: "Invalid format" };
    }
    
    // Check file size
    if (file.size > this.maxFileSize) {
        return { valid: false, error: "File too large" };
    }
    
    return { valid: true };
}
```

### FileReader for Preview
```javascript
const reader = new FileReader();
reader.onload = (e) => {
    const base64 = e.target.result;
    // Use base64 as image src
};
reader.readAsDataURL(file);
```

### LocalStorage Persistence
```javascript
// Save
localStorage.setItem('uploadedImages', JSON.stringify(this.uploadedImages));

// Load
const stored = localStorage.getItem('uploadedImages');
this.uploadedImages = JSON.parse(stored);
```

## 🎨 Styling Highlights

### Animations
- **float**: Subtle up-down animation of upload icon
- **bounce**: Icon bounces on drag-over
- **slideIn**: Error message slides in smoothly
- **fadeInUp**: Gallery cards fade in from below

### Color Scheme
- Primary: Gradient from `#667eea` (purple-blue) to `#764ba2` (deep purple)
- Background: Matching gradient for modern aesthetic
- Accents: Red for delete, green for success messages
- Hover States: Color transitions and scale effects

### Responsive Design
- Desktop: Full-size cards in responsive grid
- Tablet & Mobile: Optimized card sizes and padding
- Touch-friendly: Larger buttons and spacing
- Media breakpoint: 600px

## 🔧 Customization

### Change Allowed Formats
Edit `script.js` line 11:
```javascript
this.allowedFormats = ['image/jpeg', 'image/png', 'image/gif'];
```

### Change Maximum File Size
Edit `script.js` line 12:
```javascript
this.maxFileSize = 5 * 1024 * 1024; // Change the number
```

### Modify Color Scheme
Edit `style.css` to change gradient colors:
```css
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

## 🐛 Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

**Note**: Requires support for:
- FileReader API
- Drag & Drop API
- LocalStorage API
- CSS Grid & Flexbox
- CSS Gradients & Animations

## 📝 Future Enhancements

- Image cropping/editing
- Drag to reorder images
- Export images as ZIP
- Integration with cloud storage (AWS S3, Firebase)
- Image compression before upload
- Multiple file format support
- Drag and drop reordering
- Image annotation/comments

## 📄 License

This project is open-source and available for educational purposes.

---

**Created for learning HTML5, CSS3, and Vanilla JavaScript** 🎓
