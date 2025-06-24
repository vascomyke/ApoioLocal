// routes/users.js
const express = require('express');
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { usersContainer } = require('../config/cosmosdb');

const router = express.Router();

// Validation schema for user updates
const updateUserSchema = Joi.object({
  nomeUtilizador: Joi.string().min(2).max(100).optional(),
  nacionalidade: Joi.string().min(2).max(50).optional(),
  genero: Joi.string().valid('Masculino', 'Feminino', 'Outro').optional(),
  telemovel: Joi.string().pattern(/^[0-9]+$/).min(9).max(15).optional(),
  souResidente: Joi.boolean().optional()
});

const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required()
});

// Get current user profile
router.get('/profile', async (req, res) => {
  try {
    const { resource: user } = await usersContainer.item(req.user.userId, req.user.userId).read();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Get current user
    const { resource: currentUser } = await usersContainer.item(req.user.userId, req.user.userId).read();
    
    if (!currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user data
    const updatedUser = {
      ...currentUser,
      ...value,
      updatedAt: new Date().toISOString()
    };

    // Save to database
    const { resource: result } = await usersContainer.item(req.user.userId, req.user.userId).replace(updatedUser);

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = result;
    
    res.json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/change-password', async (req, res) => {
  try {
    // Validate input
    const { error, value } = changePasswordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { currentPassword, newPassword } = value;

    // Get current user
    const { resource: user } = await usersContainer.item(req.user.userId, req.user.userId).read();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user with new password
    const updatedUser = {
      ...user,
      password: hashedNewPassword,
      updatedAt: new Date().toISOString()
    };

    await usersContainer.item(req.user.userId, req.user.userId).replace(updatedUser);

    res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Delete user account (soft delete)
router.delete('/account', async (req, res) => {
  try {
    // Get current user
    const { resource: user } = await usersContainer.item(req.user.userId, req.user.userId).read();
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Soft delete - mark as inactive
    const updatedUser = {
      ...user,
      isActive: false,
      deletedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await usersContainer.item(req.user.userId, req.user.userId).replace(updatedUser);

    res.json({ message: 'Account deleted successfully' });

  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

module.exports = router;