// routes/favourites.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { favouritesContainer, businessContainer } = require('../config/cosmosdb');

const router = express.Router();

// Get user's favourite businesses
router.get('/', async (req, res) => {
  try {
    const query = {
      query: 'SELECT * FROM c WHERE c.userId = @userId ORDER BY c.createdAt DESC',
      parameters: [{ name: '@userId', value: req.user.userId }]
    };

    const { resources: favourites } = await favouritesContainer.items
      .query(query)
      .fetchAll();

    // Get full business details for each favourite
    const favouriteBusinesses = [];
    
    for (const favourite of favourites) {
      try {
        const { resource: business } = await businessContainer
          .item(favourite.businessId, favourite.businessId)
          .read();
        
        if (business && business.isActive) {
          favouriteBusinesses.push({
            favouriteId: favourite.id,
            favouriteCreatedAt: favourite.createdAt,
            business: business
          });
        }
      } catch (error) {
        // Business might have been deleted, skip it
        console.log(`Business ${favourite.businessId} not found or inactive`);
      }
    }

    res.json({ 
      favourites: favouriteBusinesses,
      count: favouriteBusinesses.length 
    });

  } catch (error) {
    console.error('Error fetching favourites:', error);
    res.status(500).json({ error: 'Failed to fetch favourites' });
  }
});

// Add business to favourites
router.post('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;

    // Check if business exists and is active
    const { resource: business } = await businessContainer.item(businessId, businessId).read();
    
    if (!business || !business.isActive) {
      return res.status(404).json({ error: 'Business not found' });
    }

    // Check if already in favourites
    const existingQuery = {
      query: 'SELECT * FROM c WHERE c.userId = @userId AND c.businessId = @businessId',
      parameters: [
        { name: '@userId', value: req.user.userId },
        { name: '@businessId', value: businessId }
      ]
    };

    const { resources: existing } = await favouritesContainer.items
      .query(existingQuery)
      .fetchAll();

    if (existing.length > 0) {
      return res.status(409).json({ error: 'Business already in favourites' });
    }

    // Create favourite record
    const favourite = {
      id: uuidv4(),
      userId: req.user.userId,
      businessId: businessId,
      businessName: business.nomeEstablecimento,
      createdAt: new Date().toISOString()
    };

    const { resource: createdFavourite } = await favouritesContainer.items.create(favourite);

    res.status(201).json({
      message: 'Business added to favourites',
      favourite: createdFavourite
    });

  } catch (error) {
    console.error('Error adding to favourites:', error);
    res.status(500).json({ error: 'Failed to add to favourites' });
  }
});

// Remove business from favourites
router.delete('/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;

    // Find the favourite record
    const query = {
      query: 'SELECT * FROM c WHERE c.userId = @userId AND c.businessId = @businessId',
      parameters: [
        { name: '@userId', value: req.user.userId },
        { name: '@businessId', value: businessId }
      ]
    };

    const { resources: favourites } = await favouritesContainer.items
      .query(query)
      .fetchAll();

    if (favourites.length === 0) {
      return res.status(404).json({ error: 'Favourite not found' });
    }

    const favourite = favourites[0];

    // Delete the favourite
    await favouritesContainer.item(favourite.id, req.user.userId).delete();

    res.json({ message: 'Business removed from favourites' });

  } catch (error) {
    console.error('Error removing from favourites:', error);
    res.status(500).json({ error: 'Failed to remove from favourites' });
  }
});

// Check if business is in user's favourites
router.get('/check/:businessId', async (req, res) => {
  try {
    const { businessId } = req.params;

    const query = {
      query: 'SELECT * FROM c WHERE c.userId = @userId AND c.businessId = @businessId',
      parameters: [
        { name: '@userId', value: req.user.userId },
        { name: '@businessId', value: businessId }
      ]
    };

    const { resources: favourites } = await favouritesContainer.items
      .query(query)
      .fetchAll();

    res.json({ 
      isFavourite: favourites.length > 0,
      favouriteId: favourites.length > 0 ? favourites[0].id : null
    });

  } catch (error) {
    console.error('Error checking favourite status:', error);
    res.status(500).json({ error: 'Failed to check favourite status' });
  }
});

module.exports = router;