/**
 * MediaUpload Component
 * Handles file selection, preview, and upload for chat messages
 */

import { useState, useRef, useCallback } from 'react';
import { uploadService } from '../../services/upload.service';
import './MediaUpload.css';

/**
 * MediaUpload component
 * @param {Object} props - Component props
 * @param {Function} props.onFilesSelected - Callback when files are selected
 * @param {Function} props.onCancel - Callback to cancel selection
 * @param {Array} props.selectedFiles - Currently selected files
 * @param {number} props.uploadProgress - Upload progress (0-100)
 * @param {boolean} props.isUploading - Whether upload is in progress
 */
const MediaUpload = ({ 
  onFilesSelected, 
  onCancel, 
  selectedFiles = [], 
  uploadProgress = 0, 
  isUploading = false 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Allowed file types
  const acceptedTypes = 'image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,application/zip,application/x-rar-compressed';

  // Handle file selection
  const handleFiles = useCallback((files) => {
    const fileArray = Array.from(files);
    
    // Validate file count
    if (fileArray.length > 5) {
      alert('You can only upload up to 5 files at once');
      return;
    }

    // Validate file sizes
    const oversizedFiles = fileArray.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      alert('Some files exceed the 10MB limit');
      return;
    }

    // Create preview URLs for images
    const filesWithPreviews = fileArray.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      type: file.type.startsWith('image/') ? 'image' : 'file'
    }));

    onFilesSelected(filesWithPreviews);
  }, [onFilesSelected]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  // Handle drop
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  // Handle file input change
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Remove a file from selection
  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    // Revoke preview URL
    if (selectedFiles[index].preview) {
      URL.revokeObjectURL(selectedFiles[index].preview);
    }
    onFilesSelected(newFiles);
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="media-upload">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={handleInputChange}
        className="media-upload-input"
      />

      {/* No files selected - show drop zone */}
      {selectedFiles.length === 0 && (
        <div
          className={`media-upload-dropzone ${dragActive ? 'active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={openFilePicker}
        >
          <div className="dropzone-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="dropzone-text">
            <span className="dropzone-highlight">Click to upload</span> or drag and drop
          </p>
          <p className="dropzone-hint">
            Images, PDF, Word, Excel, ZIP (max 10MB each, up to 5 files)
          </p>
        </div>
      )}

      {/* Files selected - show preview */}
      {selectedFiles.length > 0 && (
        <div className="media-upload-preview">
          <div className="preview-header">
            <span className="preview-title">
              {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
            </span>
            {!isUploading && (
              <button className="preview-add-more" onClick={openFilePicker}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add more
              </button>
            )}
          </div>

          <div className="preview-list">
            {selectedFiles.map((item, index) => (
              <div key={index} className="preview-item">
                {item.type === 'image' && item.preview ? (
                  <img src={item.preview} alt={item.name} className="preview-image" />
                ) : (
                  <div className="preview-file-icon">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
                    </svg>
                  </div>
                )}
                <div className="preview-item-info">
                  <span className="preview-item-name">{item.name}</span>
                  <span className="preview-item-size">
                    {uploadService.formatFileSize(item.size)}
                  </span>
                </div>
                {!isUploading && (
                  <button 
                    className="preview-item-remove" 
                    onClick={() => removeFile(index)}
                    title="Remove"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Upload progress */}
          {isUploading && (
            <div className="upload-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="progress-text">{uploadProgress}%</span>
            </div>
          )}

          {/* Actions */}
          {!isUploading && (
            <div className="preview-actions">
              <button className="preview-cancel" onClick={onCancel}>
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaUpload;
