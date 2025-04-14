# AI-Powered CV Review Application

This project is an AI-powered CV review application built for the CMP9785M Cloud Development module assessment at the University of Lincoln. It demonstrates a cloud-native application with a FastAPI backend and Next.js frontend.

## Features

- **User Authentication**: JWT-based authentication system
- **Credit System**: Users can purchase and spend credits to use AI services
- **AI Integration**: External AI API integration for CV analysis
- **Queue System**: Background processing for CV reviews
- **Notification System**: Real-time notifications for users
- **Responsive UI**: Clean, modern interface built with Material UI
- **API Documentation**: Comprehensive FastAPI documentation
- **Testing**: Unit and integration tests with pytest
- **Cloud-Ready**: Configured for deployment to cloud providers

## Architecture

The application follows a cloud-native microservices architecture:

- **Backend**: FastAPI Python application
  - REST API endpoints
  - JWT authentication
  - Database (SQLite for development, PostgreSQL for production)
  - Background task processing
  - External AI API integration
  
- **Frontend**: Next.js React application
  - Material UI components
  - Responsive design
  - Token-based authentication
  - Real-time updates

## Technology Stack

- **Backend**:
  - FastAPI - Web framework
  - SQLAlchemy - ORM
  - Pydantic - Data validation
  - JWT - Authentication
  - pytest - Testing
  - OpenAI API - External AI integration
  
- **Frontend**:
  - Next.js - React framework
  - Material UI - Component library
  - TypeScript - Type-safe JavaScript

## Setup and Installation

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

2. Install frontend dependencies:

3. Set up environment variables:
- Copy `.env.example` to `.env` in the root directory
- Update with your configuration (API keys, database URLs, etc.)

4. Run the development server (both frontend and backend):

5. Access the application:
- Frontend: http://localhost:3000
- API documentation: http://localhost:8000/docs

## Deployment

### Deploy to Vercel

1. Push your repository to GitHub
2. Link your repository to Vercel
3. Set up environment variables in Vercel
4. Deploy!

### Docker Deployment

You can also use Docker for deployment:

```bash
# Build the Docker image
docker build -t cv-review-app .

# Run the Docker container
docker run -p 3000:3000 -p 8000:8000 cv-review-app

npm run test

### 5. Create .env.example file to guide users

