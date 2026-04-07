/**
 * API Configuration
 * Switch between local development and production URLs.
 */

// Replace this with your URL once your project is deployed on Render
const PRODUCTION_URL = 'https://duelio-backend.onrender.com/api';
const LOCAL_URL = 'http://localhost:8000';

export const API_BASE_URL = __DEV__ ? LOCAL_URL : PRODUCTION_URL;

export const ENDPOINTS = {
    QUIZ: `${API_BASE_URL}/quiz`,
    COMPETITION: `${API_BASE_URL}/competition`,
    HEALTH: `${API_BASE_URL}/health`,
};
