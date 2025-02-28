import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'assert';
import axios from 'axios';

// Simule une base de données fictive pour stocker les utilisateurs existants
const USERS_DB = [{ email: 'user@example.com', password: 'password123' }];

/**
 * Fonction pour se connecter en tant qu'utilisateur et obtenir un token JWT.
 * @param {Object} apiClient - Client Axios configuré pour les requêtes HTTP.
 * @param {string} email - Email de l'utilisateur.
 * @param {string} password - Mot de passe de l'utilisateur.
 * @returns {Object} - Retourne l'objet contenant le token JWT.
 */
async function loginUser(apiClient, email, password) {
  try {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data; // Attendu : { token: '<JWT_TOKEN>' }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
}

// Étape Given pour définir des utilisateurs dans le scénario
Given('the following user exists:', function (dataTable) {
  const users = dataTable.hashes(); // Convertit la table en tableau d'objets
  users.forEach((user) => USERS_DB.push(user)); // Ajoute les utilisateurs au tableau fictif
});

// Étape Given pour simuler la connexion de l'utilisateur
Given('the user is logged in', async function () {
  const apiClient = axios.create({ baseURL: 'http://localhost:3000/' });

  const user = USERS_DB.find((u) => u.email === 'user@example.com');
  if (!user) {
    throw new Error('User not found in USERS_DB');
  }

  const { token } = await loginUser(apiClient, user.email, user.password);
  if (!token) {
    throw new Error('Login failed: JWT token not received');
  }

  console.log('Token received:', token); // Ajoute le log ici
  this.token = token;
});

// Étape When pour envoyer une requête à l'API afin de créer un livre
When('the user sends a request to create a book with:', async function (dataTable) {
  const bookData = dataTable.hashes()[0]; // Récupère l'objet contenant les détails du livre

  const apiClient = axios.create({
    baseURL: 'http://localhost:3000/',
    headers: { Authorization: `Bearer ${this.token}` }, // Ajout du token dans le header Authorization
  });

  try {
    const response = await apiClient.post('/books', bookData); // Envoie une requête POST
    this.response = { status: response.status, data: response.data }; // Stocke la réponse pour les validations suivantes
  } catch (error) {
    // Gère les erreurs et stocke les détails de la réponse en cas d'échec
    console.error('Error during book creation:', error.response?.data || error.message);
    this.response = { status: error.response?.status || 500, data: error.response?.data || {} };
  }
});

// Étape Then pour vérifier le statut de la réponse
Then('the response status should be {string}', function (expectedStatus) {
  assert.strictEqual(this.response.status.toString(), expectedStatus); // Compare le statut reçu au statut attendu
});

// Étape Then pour valider que la réponse contient les détails du livre créé
Then('the response should contain the book details:', function (dataTable) {
  const expectedDetails = dataTable.hashes()[0]; // Récupère les détails attendus du livre
  const actualDetails = this.response.data; // Détails de la réponse de l'API

  // Valide chaque champ individuellement
  assert.strictEqual(actualDetails.title, expectedDetails.title);
  assert.strictEqual(actualDetails.author, expectedDetails.author);
  assert.strictEqual(actualDetails.description, expectedDetails.description);
});
