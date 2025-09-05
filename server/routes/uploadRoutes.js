const express = require('express');
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { authenticateToken } = require('../middleware/auth');

// Check if Cloudinary is configured
const isCloudinaryConfigured = !!process.env.CLOUDINARY_URL;

if (isCloudinaryConfigured) {
  cloudinary.config({ secure: true }); // uses process.env.CLOUDINARY_URL
} else {
  console.error('CLOUDINARY_URL not found in environment variables. File uploads are disabled.');
}

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

// Upload routes require authentication
router.use(authenticateToken);

router.post('/', upload.array('files', 10), async (req, res) => {
  try {
    // Check if Cloudinary is configured
    if (!isCloudinaryConfigured) {
      return res.status(500).json({ 
        message: 'File upload service not configured', 
        error: 'CLOUDINARY_URL environment variable is missing. Please configure Cloudinary to enable file uploads.' 
      });
    }

    // Check if files were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        message: 'No files uploaded', 
        error: 'Please select at least one file to upload.' 
      });
    }

    console.log(`Uploading ${req.files.length} file(s) to Cloudinary...`);

    const uploads = await Promise.all(
      req.files.map(
        (f) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { resource_type: 'auto' },
              (err, result) => {
                if (err) {
                  console.error('❌ Cloudinary upload error:', err);
                  reject(err);
                } else {
                  console.log('✅ File uploaded to Cloudinary:', result.secure_url);
                  resolve(result.secure_url);
                }
              }
            );
            stream.end(f.buffer);
          })
      )
    );

    console.log(`✅ Successfully uploaded ${uploads.length} file(s)`);
    res.status(200).json({ urls: uploads });
  } catch (e) {
    console.error('❌ Upload failed:', e);
    res.status(500).json({ 
      message: 'Upload failed', 
      error: e.message,
      details: 'Check server logs for more information'
    });
  }
});

module.exports = router;