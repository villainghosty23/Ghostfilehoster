// DOM Elements
const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const uploadBtn = document.getElementById('upload-btn');
const clearBtn = document.getElementById('clear-btn');
const progressContainer = document.getElementById('progressContainer');
const progressBar = document.getElementById('progressBar');
const resultContainer = document.getElementById('resultContainer');
const urlDisplay = document.getElementById('urlDisplay');
const copyBtn = document.getElementById('copy-btn');
const newUploadBtn = document.getElementById('new-upload-btn');

let selectedFile = null;

// Event Listeners
browseBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
dropArea.addEventListener('dragover', handleDragOver);
dropArea.addEventListener('dragleave', handleDragLeave);
dropArea.addEventListener('drop', handleDrop);
uploadBtn.addEventListener('click', uploadFile);
clearBtn.addEventListener('click', resetUI);
copyBtn.addEventListener('click', copyToClipboard);
newUploadBtn.addEventListener('click', resetUI);

// Functions
function handleFileSelect(e) {
    selectedFile = e.target.files[0];
    updateUI();
}

function handleDragOver(e) {
    e.preventDefault();
    dropArea.classList.add('highlight');
}

function handleDragLeave() {
    dropArea.classList.remove('highlight');
}

function handleDrop(e) {
    e.preventDefault();
    dropArea.classList.remove('highlight');
    
    if (e.dataTransfer.files.length) {
        selectedFile = e.dataTransfer.files[0];
        fileInput.files = e.dataTransfer.files;
        updateUI();
    }
}

function updateUI() {
    if (selectedFile) {
        dropArea.innerHTML = `<strong>${selectedFile.name}</strong><p>${formatFileSize(selectedFile.size)}</p>`;
        uploadBtn.disabled = false;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function uploadFile() {
    if (!selectedFile) return;
    
    progressContainer.style.display = 'block';
    uploadBtn.disabled = true;
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    try {
        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
            // Progress event can be added here for real progress tracking
        });
        
        if (!response.ok) {
            throw new Error(await response.text());
        }
        
        const data = await response.json();
        showResult(data.url);
    } catch (error) {
        console.error('Upload failed:', error);
        alert('Upload failed. Please try again.');
        resetUI();
    }
}

function showResult(url) {
    uploadBtn.disabled = false;
    progressContainer.style.display = 'none';
    urlDisplay.textContent = url;
    resultContainer.style.display = 'block';
}

function copyToClipboard() {
    const text = urlDisplay.textContent;
    navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = 'Copy Link';
        }, 2000);
    });
}

function resetUI() {
    selectedFile = null;
    fileInput.value = '';
    dropArea.innerHTML = `<h3>Drag & Drop Files Here</h3><p>or</p><button class="btn" id="browse-btn">Browse Files</button>`;
    uploadBtn.disabled = true;
    progressBar.style.width = '0%';
    progressContainer.style.display = 'none';
    resultContainer.style.display = 'none';
    
    // Re-attach event listeners to the new browse button
    document.getElementById('browse-btn').addEventListener('click', () => fileInput.click());
}
