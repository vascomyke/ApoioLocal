const express = require('express');
const cors = require('cors');
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(cors());

// CosmosDB configuration
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY
});

const databaseName = 'BusinessDirectory';
const containerName = 'Businesses';

// Initialize database and container
async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    const { database } = await cosmosClient.databases.createIfNotExists({
      id: databaseName
    });
    
    // Create container if it doesn't exist
    const { container } = await database.containers.createIfNotExists({
      id: containerName,
      partitionKey: { paths: ['/category'] }
    });
    
    console.log('Database and container initialized successfully');
    return { database, container };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Get database and container references
const database = cosmosClient.database(databaseName);
const container = database.container(containerName);

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Business Directory API is running' });
});

// Get all businesses
app.get('/api/businesses', async (req, res) => {
  try {
    const { category, area } = req.query;
    
    let query = 'SELECT * FROM c';
    const parameters = [];
    const conditions = [];
    
    // Add filters if provided
    if (category) {
      conditions.push('c.category = @category');
      parameters.push({ name: '@category', value: category });
    }
    
    if (area) {
      conditions.push('c.area = @area');
      parameters.push({ name: '@area', value: area });
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    const { resources: businesses } = await container.items
      .query({
        query: query,
        parameters: parameters
      })
      .fetchAll();
    
    res.json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching businesses',
      error: error.message
    });
  }
});

// Get business by ID
app.get('/api/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }]
    };
    
    const { resources: businesses } = await container.items
      .query(querySpec)
      .fetchAll();
    
    if (businesses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    res.json({
      success: true,
      data: businesses[0]
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching business',
      error: error.message
    });
  }
});

// Create new business
app.post('/api/businesses', async (req, res) => {
  try {
    const {
      name,
      category,
      address,
      area,
      phone,
      description,
      website,
      email
    } = req.body;
    
    // Validate required fields
    if (!name || !category || !address || !area) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, address, and area are required'
      });
    }
    
    const newBusiness = {
      id: uuidv4(),
      name: name.trim(),
      category: category.toLowerCase().trim(),
      address: address.trim(),
      area: area.trim(),
      phone: phone?.trim() || null,
      description: description?.trim() || null,
      website: website?.trim() || null,
      email: email?.trim() || null,
      images: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const { resource: createdBusiness } = await container.items.create(newBusiness);
    
    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      data: createdBusiness
    });
  } catch (error) {
    console.error('Error creating business:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating business',
      error: error.message
    });
  }
});

// Update business
app.put('/api/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get existing business
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }]
    };
    
    const { resources: businesses } = await container.items
      .query(querySpec)
      .fetchAll();
    
    if (businesses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    const existingBusiness = businesses[0];
    
    // Update fields
    const updatedBusiness = {
      ...existingBusiness,
      ...updates,
      id: existingBusiness.id, // Ensure ID doesn't change
      createdAt: existingBusiness.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString()
    };
    
    const { resource: result } = await container.item(id, existingBusiness.category)
      .replace(updatedBusiness);
    
    res.json({
      success: true,
      message: 'Business updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error updating business:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating business',
      error: error.message
    });
  }
});

// Delete business
app.delete('/api/businesses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get business first to get partition key
    const querySpec = {
      query: 'SELECT * FROM c WHERE c.id = @id',
      parameters: [{ name: '@id', value: id }]
    };
    
    const { resources: businesses } = await container.items
      .query(querySpec)
      .fetchAll();
    
    if (businesses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    const business = businesses[0];
    await container.item(id, business.category).delete();
    
    res.json({
      success: true,
      message: 'Business deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting business',
      error: error.message
    });
  }
});

// Get businesses by area
app.get('/api/businesses/area/:area', async (req, res) => {
  try {
    const { area } = req.params;
    const { category } = req.query;
    
    let query = 'SELECT * FROM c WHERE c.area = @area';
    const parameters = [{ name: '@area', value: area }];
    
    // Add category filter if provided
    if (category) {
      query += ' AND c.category = @category';
      parameters.push({ name: '@category', value: category });
    }
    
    const { resources: businesses } = await container.items
      .query({
        query: query,
        parameters: parameters
      })
      .fetchAll();
    
    res.json({
      success: true,
      area: area,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    console.error('Error searching businesses by area:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching businesses by area',
      error: error.message
    });
  }
});

// Get all available areas
app.get('/api/areas', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT c.area FROM c ORDER BY c.area';
    
    const { resources: areas } = await container.items
      .query(query)
      .fetchAll();
    
    const areaList = areas.map(item => item.area).filter(area => area);
    
    res.json({
      success: true,
      count: areaList.length,
      data: areaList
    });
  } catch (error) {
    console.error('Error fetching areas:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching areas',
      error: error.message
    });
  }
});

// Get all available categories
app.get('/api/categories', async (req, res) => {
  try {
    const query = 'SELECT DISTINCT c.category FROM c ORDER BY c.category';
    
    const { resources: categories } = await container.items
      .query(query)
      .fetchAll();
    
    const categoryList = categories.map(item => item.category).filter(cat => cat);
    
    res.json({
      success: true,
      count: categoryList.length,
      data: categoryList
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Business Directory API running on port ${port}`);
      console.log(`Health check: http://localhost:${port}/health`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });