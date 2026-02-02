/**
 * MediaMessage Component
 * Displays media attachments (images and files) in chat messages
 */

import { useState } from 'react';
import { uploadService } from '../../services/upload.service';
import ImageViewer from './ImageViewer';
import './MediaMessage.css';

/**
 * File icon component
 */
const FileIcon = ({ type }) => {
  switch (type) {
    case 'pdf':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 4h7l5 5v11H6V4zm3 9h2v5H9v-5zm3 0h2v5h-2v-5zm3 0h1v5h-1v-5z"/>
        </svg>
      );
    case 'word':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM15.5 18h-1l-2-6-2 6h-1l-2-9h1.2l1.4 5.5 1.9-5.5h1l1.9 5.5 1.4-5.5H17l-1.5 9z"/>
        </svg>
      );
    case 'excel':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM8 18l1.5-2.5L11 18h1.5l-2.25-3.5L12.5 11H11l-1.5 2.5L8 11H6.5l2.25 3.5L6.5 18H8z"/>
        </svg>
      );
    case 'archive':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-2 6h-2v2h2v2h-2v2h-2v-2h2v-2h-2v-2h2v-2h-2V8h2v2h2v2z"/>
        </svg>
      );
    case 'text':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM6 4h7l5 5v11H6V4zm2 8v2h8v-2H8zm0 4v2h5v-2H8z"/>
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/>
        </svg>
      );
  }
};

/**
 * MediaMessage component
 * @param {Object} props - Component props
 * @param {Array} props.attachments - Array of attachment objects
 * @param {boolean} props.isSent - Whether message is sent by current user
 */
const MediaMessage = ({ attachments, isSent }) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!attachments || attachments.length === 0) return null;

  // Separate images and files
  const images = attachments.filter(a => a.type === 'image');
  const files = attachments.filter(a => a.type === 'file');

  // Handle image click
  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setViewerOpen(true);
  };

  // Handle file download
  const handleDownload = (attachment) => {
    const url = uploadService.getMediaUrl(attachment.url);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`media-message ${isSent ? 'sent' : 'received'}`}>
      {/* Images Grid */}
      {images.length > 0 && (
        <div className={`media-images ${images.length === 1 ? 'single' : images.length === 2 ? 'double' : 'grid'}`}>
          {images.map((img, index) => (
            <div 
              key={index} 
              className="media-image-wrapper"
              onClick={() => handleImageClick(index)}
            >
              <img
                src={uploadService.getMediaUrl(img.url)}
                alt={img.name}
                className="media-image"
                loading="lazy"
              />
              <div className="media-image-overlay">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="media-files">
          {files.map((file, index) => {
            const fileIcon = uploadService.getFileIcon(file.name, file.mimetype);
            return (
              <div 
                key={index} 
                className="media-file"
                onClick={() => handleDownload(file)}
              >
                <div className={`media-file-icon ${fileIcon}`}>
                  <FileIcon type={fileIcon} />
                </div>
                <div className="media-file-info">
                  <span className="media-file-name">{file.name}</span>
                  <span className="media-file-size">
                    {uploadService.formatFileSize(file.size)}
                  </span>
                </div>
                <button className="media-file-download" title="Download">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewerOpen && (
        <ImageViewer
          images={images}
          currentIndex={selectedImageIndex}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </div>
  );
};

export default MediaMessage;
