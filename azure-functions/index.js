// azure-functions/ImageProcessor/index.js
const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const sharp = require('sharp');

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

app.storageBlob('ImageProcessor', {
  path: 'business-photos/{name}',
  connection: 'AZURE_STORAGE_CONNECTION_STRING',
  handler: async (blob, context) => {
    try {
      context.log(`Processing blob: ${context.triggerMetadata.name}`);
      
      const blobName = context.triggerMetadata.name;
      const originalBlob = blob;
      
      // Skip if it's already a processed thumbnail
      if (blobName.includes('_thumb') || blobName.includes('_optimized')) {
        context.log('Skipping already processed image');
        return;
      }

      // Get container clients
      const sourceContainer = blobServiceClient.getContainerClient('business-photos');
      const processedContainer = blobServiceClient.getContainerClient('processed-photos');
      
      // Ensure processed container exists
      await processedContainer.createIfNotExists();

      // Process image with Sharp
      const optimizedBuffer = await sharp(originalBlob)
        .resize(800, 600, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toBuffer();

      const thumbnailBuffer = await sharp(originalBlob)
        .resize(200, 150, {
          fit: 'cover'
        })
        .jpeg({ 
          quality: 80 
        })
        .toBuffer();

      // Upload optimized image
      const optimizedBlobName = blobName.replace(/\.[^/.]+$/, '_optimized.jpg');
      const optimizedBlobClient = processedContainer.getBlockBlobClient(optimizedBlobName);
      await optimizedBlobClient.uploadData(optimizedBuffer, {
        blobHTTPHeaders: {
          blobContentType: 'image/jpeg'
        }
      });

      // Upload thumbnail
      const thumbnailBlobName = blobName.replace(/\.[^/.]+$/, '_thumb.jpg');
      const thumbnailBlobClient = processedContainer.getBlockBlobClient(thumbnailBlobName);
      await thumbnailBlobClient.uploadData(thumbnailBuffer, {
        blobHTTPHeaders: {
          blobContentType: 'image/jpeg'
        }
      });

      // Optionally, update business record in Cosmos DB with processed image URLs
      // This would require Cosmos DB SDK and additional logic

      context.log(`Successfully processed image: ${blobName}`);
      context.log(`Optimized URL: ${optimizedBlobClient.url}`);
      context.log(`Thumbnail URL: ${thumbnailBlobClient.url}`);

    } catch (error) {
      context.log('Error processing image:', error); // <-- FIXED
      throw error;
    }
  }
});

// HTTP trigger for manual image processing
app.http('ProcessImage', {
  methods: ['POST'],
  authLevel: 'function',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const { blobUrl } = body;

      if (!blobUrl) {
        return {
          status: 400,
          body: JSON.stringify({ error: 'blobUrl is required' })
        };
      }

      // Extract blob name from URL
      const urlParts = blobUrl.split('/');
      const blobName = urlParts[urlParts.length - 1];

      context.log(`Manual processing requested for: ${blobName}`);

      // Download original blob
      const containerClient = blobServiceClient.getContainerClient('business-photos');
      const blobClient = containerClient.getBlobClient(blobName);
      
      const downloadResponse = await blobClient.download();
      const originalBuffer = await streamToBuffer(downloadResponse.readableStreamBody);

      // Process the image
      const processedContainer = blobServiceClient.getContainerClient('processed-photos');
      await processedContainer.createIfNotExists();

      // Create optimized version
      const optimizedBuffer = await sharp(originalBuffer)
        .resize(800, 600, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .jpeg({ 
          quality: 85,
          progressive: true 
        })
        .toBuffer();

      // Create thumbnail
      const thumbnailBuffer = await sharp(originalBuffer)
        .resize(200, 150, {
          fit: 'cover'
        })
        .jpeg({ 
          quality: 80 
        })
        .toBuffer();

      // Upload processed images
      const optimizedBlobName = blobName.replace(/\.[^/.]+$/, '_optimized.jpg');
      const thumbnailBlobName = blobName.replace(/\.[^/.]+$/, '_thumb.jpg');

      const optimizedBlobClient = processedContainer.getBlockBlobClient(optimizedBlobName);
      const thumbnailBlobClient = processedContainer.getBlockBlobClient(thumbnailBlobName);

      await optimizedBlobClient.uploadData(optimizedBuffer, {
        blobHTTPHeaders: { blobContentType: 'image/jpeg' }
      });

      await thumbnailBlobClient.uploadData(thumbnailBuffer, {
        blobHTTPHeaders: { blobContentType: 'image/jpeg' }
      });

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Image processed successfully',
          originalUrl: blobUrl,
          optimizedUrl: optimizedBlobClient.url,
          thumbnailUrl: thumbnailBlobClient.url
        })
      };

    } catch (error) {
      context.log('Error in manual processing:', error);
      return {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Image processing failed' })
      };
    }
  }
});

// Helper function to convert stream to buffer
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

// Health check endpoint
app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    return {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'OK',
        service: 'Image Processing Function',
        timestamp: new Date().toISOString()
      })
    };
  }
});

app.start();