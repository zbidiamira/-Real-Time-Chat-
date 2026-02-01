/**
 * ImageViewer Component
 * Full-screen modal for viewing images
 */

import { useState, useEffect, useCallback } from 'react';
import { uploadService } from '../../services/upload.service';
import './ImageViewer.css';

/**
 * ImageViewer component for full-screen image viewing
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text
 * @param {Function} props.onClose - Close handler
 * @param {Array} props.images - Array of images for navigation (optional)
 * @param {number} props.currentIndex - Current image index (optional)
 */
const ImageViewer = ({ src, alt, onClose, images = [], currentIndex = 0 }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);

  const hasMultiple = images.length > 1;
  const currentImage = hasMultiple ? images[currentImageIndex] : { url: src, name: alt };

  // Get full URL
  const imageUrl = uploadService.getMediaUrl(currentImage.url || currentImage);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        if (hasMultiple && currentImageIndex > 0) {
          setCurrentImageIndex(prev => prev - 1);
          setLoading(true);
        }
        break;
      case 'ArrowRight':
        if (hasMultiple && currentImageIndex < images.length - 1) {
          setCurrentImageIndex(prev => prev + 1);
          setLoading(true);
        }
        break;
      case '+':
      case '=':
        setScale(prev => Math.min(prev + 0.5, 3));
        break;
      case '-':
        setScale(prev => Math.max(prev - 0.5, 0.5));
        break;
      case '0':
        setScale(1);
        break;
      default:
        break;
    }
  }, [onClose, hasMultiple, currentImageIndex, images.length]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  // Navigation handlers
  const goToPrevious = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setLoading(true);
      setScale(1);
    }
  };

  const goToNext = () => {
    if (currentImageIndex < images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setLoading(true);
      setScale(1);
    }
  };

  // Zoom handlers
  const zoomIn = () => setScale(prev => Math.min(prev + 0.5, 3));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.5, 0.5));
  const resetZoom = () => setScale(1);

  // Download handler
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = currentImage.name || 'image';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="image-viewer-header">
          <div className="image-viewer-title">
            {currentImage.name || 'Image'}
            {hasMultiple && (
              <span className="image-viewer-count">
                {currentImageIndex + 1} / {images.length}
              </span>
            )}
          </div>
          <div className="image-viewer-actions">
            <button 
              className="image-viewer-btn" 
              onClick={zoomOut} 
              title="Zoom out (-)"
              disabled={scale <= 0.5}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35M8 11h6" />
              </svg>
            </button>
            <button 
              className="image-viewer-btn" 
              onClick={resetZoom} 
              title="Reset zoom (0)"
            >
              <span className="zoom-level">{Math.round(scale * 100)}%</span>
            </button>
            <button 
              className="image-viewer-btn" 
              onClick={zoomIn} 
              title="Zoom in (+)"
              disabled={scale >= 3}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
              </svg>
            </button>
            <button 
              className="image-viewer-btn" 
              onClick={handleDownload} 
              title="Download"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
            </button>
            <button 
              className="image-viewer-btn close-btn" 
              onClick={onClose} 
              title="Close (Esc)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="image-viewer-content">
          {/* Previous Button */}
          {hasMultiple && currentImageIndex > 0 && (
            <button 
              className="image-viewer-nav prev" 
              onClick={goToPrevious}
              title="Previous (←)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          )}

          {/* Image */}
          <div className="image-viewer-image-wrapper">
            {loading && (
              <div className="image-viewer-loading">
                <div className="spinner" />
              </div>
            )}
            <img
              src={imageUrl}
              alt={currentImage.name || alt}
              className="image-viewer-image"
              style={{ transform: `scale(${scale})` }}
              onLoad={() => setLoading(false)}
              onError={() => setLoading(false)}
              draggable={false}
            />
          </div>

          {/* Next Button */}
          {hasMultiple && currentImageIndex < images.length - 1 && (
            <button 
              className="image-viewer-nav next" 
              onClick={goToNext}
              title="Next (→)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          )}
        </div>

        {/* Thumbnails */}
        {hasMultiple && (
          <div className="image-viewer-thumbnails">
            {images.map((img, index) => (
              <button
                key={index}
                className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                onClick={() => {
                  setCurrentImageIndex(index);
                  setLoading(true);
                  setScale(1);
                }}
              >
                <img 
                  src={uploadService.getMediaUrl(img.url || img)} 
                  alt={`Thumbnail ${index + 1}`} 
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageViewer;
