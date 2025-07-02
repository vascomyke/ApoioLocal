const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { CosmosClient } = require('@azure/cosmos');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// CosmosDB configuration
const cosmosClient = new CosmosClient({
  endpoint: process.env.COSMOS_DB_ENDPOINT,
  key: process.env.COSMOS_DB_KEY
});

const databaseName = 'BusinessDirectory';
const businessContainerName = 'Businesses';
const userContainerName = 'Users';
const favoriteContainerName = 'Favorites';

// JWT Secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Initialize database and containers
async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    const { database } = await cosmosClient.databases.createIfNotExists({
      id: databaseName
    });
    
    // Create containers if they don't exist
    await database.containers.createIfNotExists({
      id: businessContainerName,
      partitionKey: { paths: ['/id'] }
    });

    await database.containers.createIfNotExists({
      id: userContainerName,
      partitionKey: { paths: ['/id'] }
    });

    await database.containers.createIfNotExists({
      id: favoriteContainerName,
      partitionKey: { paths: ['/userId'] }
    });
    
    console.log('Database and containers initialized successfully');
    return database;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Get container references
const database = cosmosClient.database(databaseName);
const businessContainer = database.container(businessContainerName);
const userContainer = database.container(userContainerName);
const favoriteContainer = database.container(favoriteContainerName);


app.use(cors({
  origin: [
    'https://apoiolocal-frontend.gentlepebble-0631d6c7.uksouth.azurecontainerapps.io',
    'http://localhost:3000', // for local development
    'https://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


// Handle preflight requests explicitly
app.options('*', cors());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Business Directory API is running' });
});

// ============= USER ROUTES =============

// User registration
app.post('/api/users/register', async (req, res) => {
  try {
    const {
      email,
      password,
      nome, 
      dataNascimento,
      nacionalidade,
      genero,
      telemovel,
      souResidente
    } = req.body;

    // Validate required fields
    if (!email || !password || !nome) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and nome are required'
      });
    }

    // Check if user already exists
    const existingUserQuery = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email.toLowerCase() }]
    };

    const { resources: existingUsers } = await userContainer.items
      .query(existingUserQuery)
      .fetchAll();

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = {
      id: uuidv4(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      nome: nome.trim(),
      dataNascimento: dataNascimento || null,
      nacionalidade: nacionalidade || null,
      genero: genero || null,
      telemovel: telemovel || null,
      souResidente: !!souResidente,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource: createdUser } = await userContainer.items.create(newUser);

    // Remove password from response
    const { password: _, ...userResponse } = createdUser;

    // Generate JWT token
    const token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// User login
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const userQuery = {
      query: 'SELECT * FROM c WHERE c.email = @email',
      parameters: [{ name: '@email', value: email.toLowerCase() }]
    };

    const { resources: users } = await userContainer.items
      .query(userQuery)
      .fetchAll();

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging in user',
      error: error.message
    });
  }
});

// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const userQuery = {
      query: 'SELECT * FROM c WHERE c.id = @userId',
      parameters: [{ name: '@userId', value: req.user.userId }]
    };

    const { resources: users } = await userContainer.items
      .query(userQuery)
      .fetchAll();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { password: _, ...userResponse } = users[0];

    res.json({
      success: true,
      data: userResponse
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
});

// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Get existing user
    const userQuery = {
      query: 'SELECT * FROM c WHERE c.id = @userId',
      parameters: [{ name: '@userId', value: req.user.userId }]
    };

    const { resources: users } = await userContainer.items
      .query(userQuery)
      .fetchAll();

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const existingUser = users[0];

    // Update user
    const updatedUser = {
      ...existingUser,
      name: name?.trim() || existingUser.name,
      phone: phone?.trim() || existingUser.phone,
      updatedAt: new Date().toISOString()
    };

    const { resource: result } = await userContainer.item(existingUser.id, existingUser.id)
      .replace(updatedUser);

    const { password: _, ...userResponse } = result;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userResponse
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user profile',
      error: error.message
    });
  }
});

// ============= FAVORITES ROUTES =============

// Add business to favorites
app.post('/api/favorites/:businessId', authenticateToken, async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.userId;

    // Check if business exists
    const businessQuery = {
      query: 'SELECT * FROM c WHERE c.id = @businessId',
      parameters: [{ name: '@businessId', value: businessId }]
    };

    const { resources: businesses } = await businessContainer.items
      .query(businessQuery)
      .fetchAll();

    if (businesses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if already in favorites
    const favoriteQuery = {
      query: 'SELECT * FROM c WHERE c.userId = @userId AND c.businessId = @businessId',
      parameters: [
        { name: '@userId', value: userId },
        { name: '@businessId', value: businessId }
      ]
    };

    const { resources: existingFavorites } = await favoriteContainer.items
      .query(favoriteQuery)
      .fetchAll();

    if (existingFavorites.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Business already in favorites'
      });
    }

    // Add to favorites
    const newFavorite = {
      id: uuidv4(),
      userId: userId,
      businessId: businessId,
      businessName: businesses[0].name,
      businessCategory: businesses[0].category,
      createdAt: new Date().toISOString()
    };

    const { resource: createdFavorite } = await favoriteContainer.items.create(newFavorite);

    res.status(201).json({
      success: true,
      message: 'Business added to favorites',
      data: createdFavorite
    });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to favorites',
      error: error.message
    });
  }
});

// Remove business from favorites
app.delete('/api/favorites/:businessId', authenticateToken, async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.userId;

    // Find the favorite
    const favoriteQuery = {
      query: 'SELECT * FROM c WHERE c.userId = @userId AND c.businessId = @businessId',
      parameters: [
        { name: '@userId', value: userId },
        { name: '@businessId', value: businessId }
      ]
    };

    const { resources: favorites } = await favoriteContainer.items
      .query(favoriteQuery)
      .fetchAll();

    if (favorites.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    const favorite = favorites[0];
    await favoriteContainer.item(favorite.id, favorite.userId).delete();

    res.json({
      success: true,
      message: 'Business removed from favorites'
    });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from favorites',
      error: error.message
    });
  }
});

// Get user's favorites
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const favoriteQuery = {
      query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@userId', value: userId }]
    };

    const { resources: favorites } = await favoriteContainer.items
      .query(favoriteQuery)
      .fetchAll();

    // Get full business details for each favorite
    const businessIds = favorites.map(fav => fav.businessId);
    const businesses = [];

    for (const businessId of businessIds) {
      const businessQuery = {
        query: 'SELECT * FROM c WHERE c.id = @businessId',
        parameters: [{ name: '@businessId', value: businessId }]
      };

      const { resources: businessResults } = await businessContainer.items
        .query(businessQuery)
        .fetchAll();

      if (businessResults.length > 0) {
        businesses.push({
          ...businessResults[0],
          favoritedAt: favorites.find(fav => fav.businessId === businessId)?.createdAt
        });
      }
    }

    res.json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites',
      error: error.message
    });
  }
});

// Check if business is in user's favorites
app.get('/api/favorites/check/:businessId', authenticateToken, async (req, res) => {
  try {
    const { businessId } = req.params;
    const userId = req.user.userId;

    const favoriteQuery = {
      query: 'SELECT * FROM c WHERE c.userId = @userId AND c.businessId = @businessId',
      parameters: [
        { name: '@userId', value: userId },
        { name: '@businessId', value: businessId }
      ]
    };

    const { resources: favorites } = await favoriteContainer.items
      .query(favoriteQuery)
      .fetchAll();

    res.json({
      success: true,
      isFavorite: favorites.length > 0
    });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking favorite status',
      error: error.message
    });
  }
});

// ============= EXISTING BUSINESS ROUTES =============

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
    
    const { resources: businesses } = await businessContainer.items
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
    
    const { resources: businesses } = await businessContainer.items
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

// Get all businesses by userId (creator)
app.get('/api/businesses/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const querySpec = {
      query: 'SELECT * FROM c WHERE c.userId = @userId',
      parameters: [{ name: '@userId', value: userId }]
    };

    const { resources: businesses } = await businessContainer.items
      .query(querySpec)
      .fetchAll();

    res.json({
      success: true,
      count: businesses.length,
      data: businesses
    });
  } catch (error) {
    console.error('Error fetching businesses by userId:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching businesses by userId',
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
      postalCode,
      phone,
      email,
      website,
      description,
      images,
      userId // <-- now accepted
    } = req.body;

    // Validate required fields
    if (!name || !category || !address) {
      return res.status(400).json({
        success: false,
        message: 'Name, category and address are required'
      });
    }

    const newBusiness = {
      id: uuidv4(),
      name: name.trim(),
      category: category.toLowerCase().trim(),
      address: address.trim(),
      postalCode: postalCode?.trim() || null, // store postalCode if provided
      phone: phone?.trim() || null,
      description: description?.trim() || null,
      website: website?.trim() || null,
      email: email?.trim() || null,
      images: Array.isArray(images) ? images : [],
      userId: userId || null, // store userId of creator
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const { resource: createdBusiness } = await businessContainer.items.create(newBusiness);

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
    
    const { resources: businesses } = await businessContainer.items
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
    
    const { resource: result } = await businessContainer.item(id, id)
      .replace(updatedBusiness);

    // --- Update all favorites with new businessName and businessCategory ---
    const favoriteQuery = {
      query: 'SELECT * FROM c WHERE c.businessId = @id',
      parameters: [{ name: '@id', value: id }]
    };
    const { resources: favorites } = await favoriteContainer.items
      .query(favoriteQuery)
      .fetchAll();

    for (const fav of favorites) {
      fav.businessName = updatedBusiness.name;
      fav.businessCategory = updatedBusiness.category;
     
      await favoriteContainer.item(fav.id, fav.userId).replace(fav);
    }
    // --- End update favorites ---

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
    
    const { resources: businesses } = await businessContainer.items
      .query(querySpec)
      .fetchAll();
    
    if (businesses.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }
    
    const business = businesses[0];
    await businessContainer.item(id, id).delete(); // Use id as partition key

    // --- Delete all favorites referencing this business ---
    const favoriteQuery = {
      query: 'SELECT * FROM c WHERE c.businessId = @id',
      parameters: [{ name: '@id', value: id }]
    };
    const { resources: favorites } = await favoriteContainer.items
      .query(favoriteQuery)
      .fetchAll();

    for (const fav of favorites) {
      await favoriteContainer.item(fav.id, fav.userId).delete();
    }
    // --- End delete favorites ---

    res.json({
      success: true,
      message: 'Business and all its favorites deleted successfully'
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
    
    const { resources: businesses } = await businessContainer.items
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
    
    const { resources: areas } = await businessContainer.items
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
    
    const { resources: categories } = await businessContainer.items
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