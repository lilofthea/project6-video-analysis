const express = require('express');
const bodyParser = require('body-parser');
const { VideoIntelligenceServiceClient } = require('@google-cloud/video-intelligence');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());


const client = new VideoIntelligenceServiceClient({
  keyFilename: 'gcp-key.json'
});

app.post('/api/analyze', async (req, res) => {
  const videoUri = req.body.uri;

  try {
    const [operation] = await client.annotateVideo({
      inputUri: videoUri,
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
    console.error('Analiz hatası:', error);
    res.status(500).json({ error: 'Video analiz hatası' });
  }
});

app.listen(PORT, () => {
  console.log(`API çalışıyor: http://localhost:${PORT}`);
});
