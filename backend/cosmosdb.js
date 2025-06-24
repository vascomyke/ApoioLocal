// config/cosmosdb.js
const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_DB_ENDPOINT;
const key = process.env.COSMOS_DB_KEY;
const databaseId = process.env.COSMOS_DB_DATABASE || 'CasteloBrancoBusiness';

const client = new CosmosClient({ endpoint, key });

// Database and container references
const database = client.database(databaseId);
const usersContainer = database.container('Users');
const businessContainer = database.container('Business');
const favouritesContainer = database.container('Favourites');

// Document schemas (for reference - Cosmos DB doesn't enforce these)
const userSchema = {
  id: "string (UUID)", // Partition Key
  nomeUtilizador: "string",
  emailUtilizador: "string", // Indexed
  password: "string (hashed)",
  dataNascimento: "string (ISO date)",
  nacionalidade: "string",
  genero: "string (Masculino|Feminino|Outro)",
  telemovel: "string",
  souResidente: "boolean"
};

const businessSchema = {
  id: "string (UUID)", // Partition Key
  nomeEstablecimento: "string",
  tipoEstablecimento: "string (Restaurante|Café|Loja|etc)",
  ruaNumero: "string",
  codigoPostal: "string (XXXX-XXX)",
  telemovelEmpresa: "string",
  emailEmpresa: "string",
  site: "string (optional)",
  descricao: "string",
  fotos: "array of strings (blob URLs)",
  ownerId: "string (user ID who created this)",
  ownerEmail: "string",
  isActive: "boolean"
};

const favouriteSchema = {
  id: "string (UUID)",
  userId: "string (UUID)", // Partition Key
  businessId: "string (UUID)",
  businessName: "string (for quick reference)"
};

// Initialize database and containers
async function initializeDatabase() {
  try {
    // Create database if it doesn't exist
    const { database: db } = await client.databases.createIfNotExists({
      id: databaseId,
      throughput: 400 // Shared throughput across containers (cost-effective)
    });
    console.log(`Database '${databaseId}' ready`);

    // Create Users container
    await db.containers.createIfNotExists({
      id: 'Users',
      partitionKey: { kind: 'Hash', paths: ['/id'] },
      indexingPolicy: {
        automatic: true,
        indexingMode: 'consistent',
        includedPaths: [
          { path: '/*' }, // Index all paths
        ],
        excludedPaths: [
          { path: '/password/?' }, // Don't index password for security
        ],
        compositeIndexes: [
          [
            { path: '/emailUtilizador', order: 'ascending' }
          ]
        ]
      },
      uniqueKeyPolicy: {
        uniqueKeys: [
          { paths: ['/emailUtilizador'] } // Ensure email uniqueness
        ]
      }
    });

    // Create Business container
    await db.containers.createIfNotExists({
      id: 'Business',
      partitionKey: { kind: 'Hash', paths: ['/id'] },
      indexingPolicy: {
        automatic: true,
        indexingMode: 'consistent',
        includedPaths: [
          { path: '/*' }
        ],
        compositeIndexes: [
          [
            { path: '/tipoEstablecimento', order: 'ascending' }
          ],
          [
            { path: '/codigoPostal', order: 'ascending' }
          ],
          [
            { path: '/isActive', order: 'ascending' }
          ]
        ]
      }
    });

    // Create Favourites container
    await db.containers.createIfNotExists({
      id: 'Favourites',
      partitionKey: { kind: 'Hash', paths: ['/userId'] },
      indexingPolicy: {
        automatic: true,
        includedPaths: [
          { path: '/*' }
        ],
        compositeIndexes: [
          [
            { path: '/userId', order: 'ascending' }
          ]
        ]
      }
    });

    console.log('All containers ready with proper indexing');
    console.log('User schema:', userSchema);
    console.log('Business schema:', businessSchema);
    console.log('Favourite schema:', favouriteSchema);
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = {
  client,
  database,
  usersContainer,
  businessContainer,
  favouritesContainer,
  initializeDatabase
};