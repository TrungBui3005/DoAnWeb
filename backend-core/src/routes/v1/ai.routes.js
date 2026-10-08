const express = require('express');
const multer = require('multer');
const router = express.Router();
const aiController = require('../../controllers/ai.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// POST /api/v1/ai/chat
router.post('/chat', verifyToken, aiController.chat);
// POST /api/v1/ai/analyze-image  (form-data, field tên "image")
router.post('/analyze-image', verifyToken, upload.single('image'), aiController.analyzeImage);

module.exports = router;