const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { VideoIntelligenceServiceClient } = require('@google-cloud/video-intelligence');

const app = express();
const PORT = 3000;
const client = new VideoIntelligenceServiceClient({ keyFilename: 'gcp-key.json' });

const upload = multer({ dest: 'uploads/' });

app.post('/api/analyze', upload.single('video'), async (req, res) => {
  const filePath = req.file.path;

  try {
    const file = fs.readFileSync(filePath);
    const inputContent = file.toString('base64');

    const [operation] = await client.annotateVideo({
      inputContent,
      features: ['LABEL_DETECTION'],
    });

    const [response] = await operation.promise();
    const labels = response.annotationResults[0].segmentLabelAnnotations;

    const result = labels.map(label => ({
      description: label.entity.description,
      startTime: label.segments[0].segment.startTimeOffset.seconds || 0,
      endTime: label.segments[0].segment.endTimeOffset.seconds || 0,
    }));

    res.json(result);
  } catch (error) {
    console.error('Hata:', error);
    res.status(500).json({ error: 'Video analiz hatası' });
  } finally {
    fs.unlinkSync(filePath);
  }
});

app.listen(PORT, () => {
  console.log(`Server http://localhost:${PORT} üzerinde çalışıyor`);
});
