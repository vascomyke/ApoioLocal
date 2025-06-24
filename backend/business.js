// routes/business.js
const express = require('express');
const multer = require('multer');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');
const { BlobServiceClient } = require('@azure/storage-blob');
const { businessContainer } = require('../config/cosmosdb');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Azure Blob Storage configuration
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerName = 'business-photos';

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Validation schema for business
const businessSchema = Joi.object({
  nomeEstablecimento: Joi.string().min(2).max(100).required(),
  tipoEstablecimento: Joi.string().valid(
    'Restaurante', 'Café', 'Loja', 'Serviços', 'Saúde', 
    'Educação', 'Entretenimento', 'Outro'
  ).required(),
  ruaNumero: Joi.string().min(5).max(200).required(),
  codigoPostal: Joi.string().pattern(/^[0-9]{4}-[0-9]{3}$/).required(),
  telemovelEmpresa: Joi.string().pattern(/^[0-9]+$/).min(9).max(15).required(),
  emailEmpresa: Joi.string().email().required(),
  site: Joi.string().uri().optional().allow(''),
  descricao: Joi.string().max(1000).required()
});

// Upload image to blob storage
async function uploadImageToBlob(file, businessId) {
  try {
    const containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Ensure container exists
    await containerClient.createIfNotExists({
      access: 'blob'
    });

    const blobName = `${businessId}/${uuidv4()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(file.buffer, {
      blobHTTPHeaders: {
        blobContentType: file.mimetype
      }
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error('Error uploading to blob storage:', error);
    throw error;
  }
}

// Create business (protected route)
router.post('/', authMiddleware, upload.array('fotos', 10), async (req, res) => {
  try {
    // Validate business data
    const { error, value } = businessSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const businessId = uuidv4();
    const photoUrls = [];

    // Upload photos to blob storage
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const photoUrl = await uploadImageToBlob(file, businessId);
          photoUrls.push(photoUrl);
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
          // Continue with other photos even if one fails
        }
      }
    }

    // Create business object
    const business = {
      id: businessId,
      ...value,
      fotos: photoUrls,
      ownerId: req.user.userId,
      ownerEmail: req.user.email,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Cosmos DB
    const { resource: createdBusiness } = await businessContainer.items.create(business);

    res.status(201).json({
      message: 'Business created successfully',
      business: createdBusiness
    });

  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({ error: 'Failed to create business' });
  }
});

// Get all businesses (public - some info concealed)
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, tipo, cidade } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM c WHERE c.isActive = true';
    const parameters = [];

    // Add filters
    if (tipo) {
      query += ' AND c.tipoEstablecimento = @tipo';
      parameters.push({ name: '@tipo', value: tipo });
    }

    if (cidade) {
      query += ' AND CONTAINS(UPPER(c.ruaNumero), UPPER(@cidade))';
      parameters.push({ name: '@cidade', value: cidade });
    }

    query += ' ORDER BY c.createdAt DESC';
    query += ` OFFSET ${offset} LIMIT ${limit}`;

    const { resources: businesses } = await businessContainer.items
      .query({ query, parameters })
      .fetchAll();

    // Conceal sensitive information for public view
    const publicBusinesses = businesses.map(business => ({
      id: business.id,
      nomeEstablecimento: business.nomeEstablecimento,
      tipoEstablecimento: business.tipoEstablecimento,
      ruaNumero: business.ruaNumero,
      codigoPostal: business.codigoPostal,
      descricao: business.descricao,
      fotos: business.fotos ? business.fotos.slice(0, 1) : [], // Only first photo
      createdAt: business.createdAt
    }));

    res.json({
      businesses: publicBusinesses,
      page: parseInt(page),
      limit: parseInt(limit)
    });

  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({ error: 'Failed to fetch businesses' });
  }
});

// Get specific business (full info for authenticated users)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    const { resource: business } = await businessContainer.item(id, id).read();
    
    if (!business || !business.isActive) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // If user is authenticated, return full info
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        jwt.verify(token, process.env.JWT_SECRET);
        return res.json({ business });
      } catch (error) {
        // Token invalid, fall through to public view
      }
    }

    // Return public view (concealed info)
    const publicBusiness = {
      id: business.id,
      nomeEstablecimento: business.nomeEstablecimento,
      tipoEstablecimento: business.tipoEstablecimento,
      ruaNumero: business.ruaNumero,
      codigoPostal: business.codigoPostal,
      descricao: business.descricao,
      fotos: business.fotos || [],
      createdAt: business.createdAt
    };

    res.json({ business: publicBusiness });

  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({ error: 'Failed to fetch business' });
  }
});

// Get user's businesses (protected route)
router.get('/my/businesses', authMiddleware, async (req, res) => {
  try {
    const query = {
      query: 'SELECT * FROM c WHERE c.ownerId = @ownerId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@ownerId', value: req.user.userId }]
    };

    const { resources: businesses } = await businessContainer.items
      .query(query)
      .fetchAll();

    res.json({ businesses });

  } catch (error) {
    console.error('Error fetching user businesses:', error);
    res.status(500).json({ error: 'Failed to fetch your businesses' });
  }
});

// Update business (protected route - only owner)
router.put('/:id', authMiddleware, upload.array('fotos', 10), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get existing business
    const { resource: existingBusiness } = await businessContainer.item(id, id).read();
    
    if (!existingBusiness) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (existingBusiness.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to update this business' });
    }

    // Validate updated data
    const { error, value } = businessSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    let photoUrls = existingBusiness.fotos || [];

    // Upload new photos if provided
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const photoUrl = await uploadImageToBlob(file, id);
          photoUrls.push(photoUrl);
        } catch (uploadError) {
          console.error('Error uploading photo:', uploadError);
        }
      }
    }

    // Update business
    const updatedBusiness = {
      ...existingBusiness,
      ...value,
      fotos: photoUrls,
      updatedAt: new Date().toISOString()
    };

    const { resource: result } = await businessContainer.item(id, id).replace(updatedBusiness);

    res.json({
      message: 'Business updated successfully',
      business: result
    });

  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({ error: 'Failed to update business' });
  }
});

// Delete business (protected route - only owner)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const { resource: business } = await businessContainer.item(id, id).read();
    
    if (!business) {
      return res.status(404).json({ error: 'Business not found' });
    }

    if (business.ownerId !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized to delete this business' });
    }

    // Soft delete - mark as inactive
    const updatedBusiness = {
      ...business,
      isActive: false,
      updatedAt: new Date().toISOString()
    };

    await businessContainer.item(id, id).replace(updatedBusiness);

    res.json({ message: 'Business deleted successfully' });

  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({ error: 'Failed to delete business' });
  }
});

module.exports = router;