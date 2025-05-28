const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

const watchedFolder = path.join(__dirname, 'uploads');
const analyzedFiles = new Set();

setInterval(() => {
  fs.readdir(watchedFolder, async (err, files) => {
    if (err) return console.error('Klasör okunamadı:', err);

    const mp4Files = files.filter(f => f.endsWith('.mp4'));

    for (const file of mp4Files) {
      if (analyzedFiles.has(file)) continue;

      analyzedFiles.add(file);
      const filePath = path.join(watchedFolder, file);
      const form = new FormData();
      form.append('video', fs.createReadStream(filePath));

      console.log(`Analiz ediliyor: ${file}`);

      try {
        const res = await axios.post('http://localhost:3000/api/analyze', form, {
          headers: form.getHeaders(),
        });
        console.log(`${file} için analiz sonucu:`, res.data);
      } catch (err) {
        console.error(`${file} analiz hatası:`, err.message);
      }
    }
  });
}, 10000);
