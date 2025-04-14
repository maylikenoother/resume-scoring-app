# AI-Powered CV Review Application

This project is an AI-powered CV review application built for the CMP9785M Cloud Development module assessment at the University of Lincoln. It demonstrates a cloud-native application with a FastAPI backend and Next.js frontend.

## Features

- **User Authentication**: JWT-based authentication system
- **Credit System**: Users can purchase and spend credits to use AI services
- **AI Integration**: Hugging Face API integration for CV analysis
- **Queue System**: Background processing for CV reviews
- **Notification System**: Real-time notifications for users
- **Responsive UI**: Clean, modern interface built with Material UI
- **API Documentation**: Comprehensive FastAPI documentation
- **Testing**: Unit and integration tests with pytest
- **Cloud-Ready**: Configured for deployment to Vercel

## Architecture

The application follows a cloud-native microservices architecture:

- **Backend**: FastAPI Python application
  - REST API endpoints
  - JWT authentication
  - SQLite database (can be replaced with a cloud database in production)
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
  - Hugging Face - AI integration
  
- **Frontend**:
  - Next.js - React framework
  - Material UI - Component library
  - TypeScript - Type-safe JavaScript
  - React Hooks - State management

## Project Structure

```
/
├── api/                  # Backend API
│   ├── core/             # Core functionality
│   │   ├── auth.py       # Authentication
│   │   ├── config.py     # Configuration
│   │   └── database.py   # Database setup
│   ├── models/           # Database models
│   ├── routers/          # API routes
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   └── tests/            # Unit tests
├── app/                  # Frontend application
│   ├── components/       # React components
│   ├── (app)/            # Protected routes
│   ├── (auth)/           # Authentication routes
│   └── theme.ts          # Theme configuration
├── README.md             # Project documentation
└── package.json          # Frontend dependencies
```

## Setup and Installation

### Prerequisites

- Python 3.9+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the API directory:
   ```
   cd api
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file with your configuration:
   ```
   HUGGINGFACE_API_TOKEN=your_token_here
   SECRET_KEY=your_secret_key
   ```

5. Run the backend server:
   ```
   uvicorn main:app --reload
   ```

6. The API will be available at http://localhost:8000
   - API documentation: http://localhost:8000/docs

### Frontend Setup

1. Navigate to the root directory and install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

2. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

3. The frontend will be available at http://localhost:3000

## API Documentation

The API documentation is available at the `/api/py/docs` endpoint when the server is running. It provides comprehensive information about all available endpoints, request/response models, and authentication requirements.

## Testing

To run the tests:

```
cd api
pytest
```

## Deployment

The application is configured for deployment to Vercel:

1. Create a new Vercel project
2. Link your GitHub repository
3. Configure the following environment variables:
   - `HUGGINGFACE_API_TOKEN`: Your Hugging Face API token
   - `SECRET_KEY`: A secure random string for JWT encryption
4. Deploy!

## Assessment Criteria Fulfillment

This project meets the assessment criteria in the following ways:

1. **Cloud-Native Application Design**:
   - Microservices architecture
   - Stateless authentication
   - External service integration
   - Container-ready structure

2. **Secure, Scalable Cloud-Native Application**:
   - JWT authentication
   - Input validation
   - Separation of concerns
   - Scalable background processing

3. **DevOps Practices**:
   - Comprehensive testing
   - CI/CD compatibility
   - Clear documentation
   - Containerization support

## License

This project is licensed under the GNU General Public License v3.0 - see the LICENSE file for details.