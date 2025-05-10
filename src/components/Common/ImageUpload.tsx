import React, { useState, useRef } from 'react';
import { Box, Avatar, CircularProgress, IconButton } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { uploadFile } from '../../api/fileApi';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  folder?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, folder = 'avatars' }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    try {
      setUploading(true);
      const url = await uploadFile(file, folder);
      onImageUploaded(url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', position: 'relative' }}>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
        ref={fileInputRef}
      />
      <IconButton
        onClick={() => fileInputRef.current?.click()}
        sx={{
          p: 0,
          borderRadius: '50%',
          border: '4px solid white',
          boxShadow: 2,
          width: 96,
          height: 96,
          background: '#fff',
          position: 'relative',
        }}
        disabled={uploading}
      >
        <Avatar
          src={preview || undefined}
          sx={{ width: 96, height: 96 }}
        >
          {!preview && !uploading && <CloudUploadIcon sx={{ fontSize: 48, color: '#ccc' }} />}
          {uploading && <CircularProgress size={48} sx={{ color: '#1976d2' }} />}
        </Avatar>
      </IconButton>
    </Box>
  );
};

export default ImageUpload; 