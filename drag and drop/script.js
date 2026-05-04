class FileUploader {
    constructor() {
        this.dropArea = document.getElementById('dropArea');
        this.fileInput = document.getElementById('fileInput');
        this.errorMessage = document.getElementById('errorMessage');
        this.gallery = document.getElementById('gallery');
        this.clearBtn = document.getElementById('clearBtn');
        
        this.allowedFormats = ['image/jpeg', 'image/png', 'image/gif'];
        this.maxFileSize = 5 * 1024 * 1024; // 5MB
        this.uploadedImages = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.renderGallery();
    }

    setupEventListeners() {
        // Click to select file
        this.dropArea.addEventListener('click', () => this.fileInput.click());

        // Drag and drop events
        this.dropArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.dropArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.dropArea.addEventListener('drop', (e) => this.handleDrop(e));

        // File input change
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Clear all button
        this.clearBtn.addEventListener('click', () => this.clearAllImages());

        // Prevent default drag behavior on document
        document.addEventListener('dragover', (e) => e.preventDefault());
        document.addEventListener('drop', (e) => e.preventDefault());
    }

    handleDragOver(e) {
        e.preventDefault();
        this.dropArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.dropArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.dropArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        this.processFiles(files);
    }

    handleFileSelect(e) {
        const files = e.target.files;
        this.processFiles(files);
        // Reset input for same file re-upload
        this.fileInput.value = '';
    }

    processFiles(files) {
        this.hideError();
        
        for (let file of files) {
            const validation = this.validateFile(file);
            
            if (!validation.valid) {
                this.showError(validation.error);
                continue;
            }

            this.readAndUploadFile(file);
        }
    }

    validateFile(file) {
        // Check file type
        if (!this.allowedFormats.includes(file.type)) {
            return {
                valid: false,
                error: `❌ Invalid file format: ${file.name}. Only JPG, PNG, and GIF are allowed.`
            };
        }

        // Check file size
        if (file.size > this.maxFileSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
            return {
                valid: false,
                error: `❌ File too large: ${file.name} (${sizeMB}MB). Maximum size is 5MB.`
            };
        }

        return { valid: true };
    }

    readAndUploadFile(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const imageData = {
                id: Date.now() + Math.random(),
                src: e.target.result,
                name: file.name,
                size: file.size,
                uploadedAt: new Date().toLocaleString()
            };

            // Add to array and upload with progress simulation
            this.uploadedImages.push(imageData);
            this.saveToLocalStorage();
            this.renderGallery();
            this.simulateProgress(imageData.id);
        };

        reader.onerror = () => {
            this.showError(`❌ Error reading file: ${file.name}`);
        };

        reader.readAsDataURL(file);
    }

    simulateProgress(imageId) {
        const progressBar = document.querySelector(`[data-id="${imageId}"] .image-progress`);
        if (!progressBar) return;

        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress > 100) progress = 100;

            progressBar.style.width = progress + '%';

            if (progress === 100) {
                clearInterval(interval);
            }
        }, 200);
    }

    renderGallery() {
        this.gallery.innerHTML = '';

        if (this.uploadedImages.length === 0) {
            this.gallery.innerHTML = '<div class="empty-state">No images uploaded yet. Start by dragging and dropping images above! 👆</div>';
            this.clearBtn.style.display = 'none';
            return;
        }

        this.uploadedImages.forEach(image => {
            const card = this.createImageCard(image);
            this.gallery.appendChild(card);
        });

        this.clearBtn.style.display = 'block';
    }

    createImageCard(image) {
        const card = document.createElement('div');
        card.className = 'image-card';
        card.setAttribute('data-id', image.id);

        const sizeMB = (image.size / (1024 * 1024)).toFixed(2);

        card.innerHTML = `
            <img src="${image.src}" alt="${image.name}" class="image-preview">
            <div class="image-progress" style="width: 0%"></div>
            <div class="image-info">
                <div class="image-name" title="${image.name}">${image.name}</div>
                <div class="image-size">${sizeMB}MB</div>
            </div>
            <button class="delete-btn" title="Delete image">✕</button>
        `;

        // Delete button functionality
        const deleteBtn = card.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteImage(image.id);
        });

        return card;
    }

    deleteImage(imageId) {
        this.uploadedImages = this.uploadedImages.filter(img => img.id !== imageId);
        this.saveToLocalStorage();
        this.renderGallery();
        this.showError(`✅ Image deleted successfully!`, true);
    }

    clearAllImages() {
        if (confirm('Are you sure you want to delete all images? This cannot be undone.')) {
            this.uploadedImages = [];
            this.saveToLocalStorage();
            this.renderGallery();
            this.showError(`✅ All images cleared successfully!`, true);
        }
    }

    showError(message, isSuccess = false) {
        this.errorMessage.textContent = message;
        this.errorMessage.classList.add('show');
        
        if (isSuccess) {
            this.errorMessage.style.background = '#efe';
            this.errorMessage.style.color = '#3c3';
            this.errorMessage.style.borderLeftColor = '#3c3';
        } else {
            this.errorMessage.style.background = '#fee';
            this.errorMessage.style.color = '#c33';
            this.errorMessage.style.borderLeftColor = '#c33';
        }

        // Auto-hide after 4 seconds
        setTimeout(() => this.hideError(), 4000);
    }

    hideError() {
        this.errorMessage.classList.remove('show');
    }

    saveToLocalStorage() {
        localStorage.setItem('uploadedImages', JSON.stringify(this.uploadedImages));
    }

    loadFromLocalStorage() {
        const stored = localStorage.getItem('uploadedImages');
        if (stored) {
            try {
                this.uploadedImages = JSON.parse(stored);
            } catch (error) {
                console.error('Error loading images from localStorage:', error);
                this.uploadedImages = [];
            }
        }
    }
}

// Initialize the uploader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FileUploader();
});
