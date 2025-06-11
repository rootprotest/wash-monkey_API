const axios = require('axios');
const { Storage } = require('@google-cloud/storage');
const path = require('path');

const storage = new Storage({
  keyFilename: path.join(__dirname, '..', 'file', 'email-js-1a09b-firebase-adminsdk-ensw9-93ddb0e54d.json'),
  projectId: 'email-js-1a09b',
});

const bucketName = 'email-js-1a09b.appspot.com';
const bucket = storage.bucket(bucketName);

const uploadHandlers = async (imageUrl) => {
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) {
    throw new Error(`Invalid image URL: ${imageUrl}`);
  }

  try {
    // Download the image from the URL using Axios
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const imageData = response.data;

    // Generate a unique filename
    const imageFileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const destination = `winterbear/${imageFileName}`; // Destination path in Firebase Storage

    // Create a writable stream and upload the image buffer to Firebase Storage
    const fileStream = bucket.file(destination).createWriteStream({
      metadata: {
        contentType: response.headers['content-type'], // Derive content type from response headers
      },
    });

    // Handle stream events
    fileStream.on('error', (error) => {
      console.error('Error uploading image to Firebase Storage:', error);
      throw error;
    });

    fileStream.on('finish', () => {
      console.log(`Image ${imageFileName} uploaded successfully.`);
    });

    // Pipe the image buffer to the stream
    fileStream.end(imageData);

    // Return the URL of the uploaded image
    return `https://storage.googleapis.com/${bucketName}/${destination}`;
  } catch (error) {
    console.error('Error downloading or uploading image:', error);
    throw error;
  }
};

module.exports = { uploadHandlers };
