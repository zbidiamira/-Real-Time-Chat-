/**
 * MessageInput Component
 * Input area for composing and sending messages with media support
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { uploadService } from '../../services/upload.service';
import { useToast } from '../../hooks/useToast';
import MediaUpload from './MediaUpload';
import './MessageInput.css';

/**
 * MessageInput component for sending messages
 * @param {Object} props - Component props
 * @param {Function} props.onSend - Send handler
 * @param {Function} props.onTyping - Typing handler
 * @param {boolean} props.disabled - Disabled state
 */
const MessageInput = ({ onSend, onTyping, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const { showToast } = useToast();

  /**
   * Handle input change with typing indicator
   */
  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Emit typing event
    if (value && !isTyping) {
      setIsTyping(true);
      onTyping?.(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping?.(false);
    }, 2000);
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    const hasFiles = selectedFiles.length > 0;
    
    if (!trimmedMessage && !hasFiles) return;

    // Stop typing indicator
    setIsTyping(false);
    onTyping?.(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    try {
      let attachments = [];
      
      // Upload files if any
      if (hasFiles) {
        setIsUploading(true);
        setUploadProgress(0);
        
        const files = selectedFiles.map(f => f.file);
        const response = await uploadService.uploadMedia(files, (progress) => {
          setUploadProgress(progress);
        });
        
        attachments = response.data?.attachments || [];
        
        // Clean up preview URLs
        selectedFiles.forEach(f => {
          if (f.preview) URL.revokeObjectURL(f.preview);
        });
      }

      // Send message with attachments
      await onSend(trimmedMessage || 'Shared media', attachments);
      
      // Reset state
      setMessage('');
      setSelectedFiles([]);
      setShowMediaUpload(false);
      setIsUploading(false);
      setUploadProgress(0);
      
      // Focus input after sending
      inputRef.current?.focus();
    } catch (error) {
      console.error('Failed to send message:', error);
      showToast('error', 'Failed to send message');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Handle key press
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  /**
   * Handle file selection from quick attach
   */
  const handleQuickAttach = () => {
    fileInputRef.current?.click();
  };

  /**
   * Handle file input change
   */
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file count
    if (files.length > 5) {
      showToast('error', 'You can only upload up to 5 files at once');
      return;
    }

    // Validate file sizes
    const oversizedFiles = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showToast('error', 'Some files exceed the 10MB limit');
      return;
    }

    // Create preview data
    const filesWithPreviews = files.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      type: file.type.startsWith('image/') ? 'image' : 'file'
    }));

    setSelectedFiles(filesWithPreviews);
    setShowMediaUpload(true);
    
    // Reset file input
    e.target.value = '';
  };

  /**
   * Handle files selected from MediaUpload
   */
  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
    if (files.length === 0) {
      setShowMediaUpload(false);
    }
  };

  /**
   * Cancel media upload
   */
  const handleCancelMedia = () => {
    selectedFiles.forEach(f => {
      if (f.preview) URL.revokeObjectURL(f.preview);
    });
    setSelectedFiles([]);
    setShowMediaUpload(false);
  };

  /**
   * Focus input on mount
   */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /**
   * Cleanup timeout on unmount
   */
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Cleanup preview URLs
      selectedFiles.forEach(f => {
        if (f.preview) URL.revokeObjectURL(f.preview);
      });
    };
  }, []);

  return (
    <div className="message-input-container">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,application/zip"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Media Upload Preview */}
      {showMediaUpload && (
        <div className="media-upload-container">
          <MediaUpload
            selectedFiles={selectedFiles}
            onFilesSelected={handleFilesSelected}
            onCancel={handleCancelMedia}
            uploadProgress={uploadProgress}
            isUploading={isUploading}
          />
        </div>
      )}

      {/* Message Input Form */}
      <form className="message-input-form" onSubmit={handleSubmit}>
        <button 
          type="button"
          className="input-action-btn"
          title="Attach file"
          onClick={handleQuickAttach}
          disabled={disabled || isUploading}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <div className="message-input-wrapper">
          <textarea
            ref={inputRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={selectedFiles.length > 0 ? "Add a caption..." : "Type a message..."}
            className="message-textarea"
            disabled={disabled || isUploading}
            rows={1}
            maxLength={2000}
          />
        </div>

        <button 
          type="button"
          className="input-action-btn emoji-btn"
          title="Emoji (coming soon)"
          disabled
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        </button>

        <button
          type="submit"
          className="send-btn"
          disabled={disabled || isUploading || (!message.trim() && selectedFiles.length === 0)}
          title={selectedFiles.length > 0 ? "Send with attachments" : "Send message"}
        >
          {isUploading ? (
            <div className="spinner small" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
