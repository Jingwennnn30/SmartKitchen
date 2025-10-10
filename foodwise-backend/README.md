# FoodWise QuickSight Integration

This project integrates AWS QuickSight dashboards into the FoodWise React application, replacing the hardcoded Food Waste Analysis chart with real-time data visualization.

## Architecture

```
Frontend (React - Port 3000)
    ↓ HTTP Request
Backend (Node.js - Port 4000) 
    ↓ AWS SDK
AWS QuickSight Dashboard
    ↓ Embed URL
Backend Response
    ↓ JSON
Frontend iframe rendering
```

## Setup Instructions

### Prerequisites

- Node.js 16+ installed
- AWS Account with QuickSight access
- AWS IAM user with QuickSight permissions
- Dashboard ID from your QuickSight dashboard

### Backend Setup (Node.js + Express)

1. **Navigate to backend directory:**
   ```bash
   cd SmartKitchen/foodwise-backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env with your actual values
   nano .env
   ```

4. **Set up your `.env` file:**
   ```env
   NODE_ENV=development
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   
   # AWS Configuration
   AWS_REGION=us-east-1
   AWS_ACCOUNT_ID=761386521687
   AWS_ACCESS_KEY_ID=your_actual_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_actual_aws_secret_key
   
   # QuickSight Configuration  
   QUICKSIGHT_DASHBOARD_ID=e098949c-c065-42b6-a884-ac41d4167ad5
   ```

5. **Start the backend server:**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Or production mode
   npm start
   ```

   You should see:
   ```
   🚀 FoodWise QuickSight Backend running on port 4000
   📊 Environment: development
   🔗 Health check: http://localhost:4000/health
   📈 QuickSight endpoint: http://localhost:4000/get-embed-url
   ```

### Frontend Setup (React)

1. **Navigate to frontend directory:**
   ```bash
   cd SmartKitchen/foodwise-dashboard
   ```

2. **Install dependencies (if needed):**
   ```bash
   npm install
   ```

3. **Set environment variable for backend URL:**
   ```bash
   # Create .env.local file
   echo "REACT_APP_BACKEND_URL=http://localhost:4000" > .env.local
   ```

4. **Start the React development server:**
   ```bash
   npm start
   ```

   The app will open at `http://localhost:3000`

### Testing the Integration

1. **Backend Health Check:**
   ```bash
   curl http://localhost:4000/health
   ```
   Expected response:
   ```json
   {
     "status": "healthy",
     "timestamp": "2024-10-08T...",
     "service": "foodwise-quicksight-backend"
   }
   ```

2. **QuickSight Embed URL:**
   ```bash
   curl http://localhost:4000/get-embed-url
   ```
   Expected response:
   ```json
   {
     "success": true,
     "embedUrl": "https://us-east-1.quicksight.aws.amazon.com/...",
     "requestId": "...",
     "status": 200,
     "timestamp": "2024-10-08T..."
   }
   ```

3. **Frontend Integration:**
   - Open http://localhost:3000
   - Navigate to Dashboard
   - The Food Waste Analysis card should show the QuickSight dashboard
   - Loading states and error handling should work properly

## AWS QuickSight Configuration

### Required IAM Permissions

Your AWS IAM user needs these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "quicksight:GetDashboardEmbedUrl",
                "quicksight:DescribeDashboard"
            ],
            "Resource": [
                "arn:aws:quicksight:us-east-1:761386521687:dashboard/e098949c-c065-42b6-a884-ac41d4167ad5"
            ]
        }
    ]
}
```

### Dashboard Configuration

1. **Enable Anonymous Embedding:**
   - Go to QuickSight Console
   - Navigate to your dashboard
   - Click "Share" → "Embed"
   - Enable "Anonymous embedding"
   - Add allowed domains: `http://localhost:3000` (development) and your production domain

2. **Dashboard Settings:**
   - Identity Type: `ANONYMOUS`
   - Session lifetime: 600 minutes (10 hours)
   - Enable undo/redo and reset functionality

## Production Deployment

### Environment Configuration

**Backend (.env for production):**
```env
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-production-domain.com

AWS_REGION=us-east-1
AWS_ACCOUNT_ID=761386521687
AWS_ACCESS_KEY_ID=your_production_aws_key
AWS_SECRET_ACCESS_KEY=your_production_aws_secret

QUICKSIGHT_DASHBOARD_ID=e098949c-c065-42b6-a884-ac41d4167ad5
```

**Frontend (.env.production):**
```env
REACT_APP_BACKEND_URL=https://your-backend-domain.com
```

### Security Considerations

1. **CORS Configuration:**
   - Backend automatically configures CORS based on NODE_ENV
   - Production: Only allows your production domain
   - Development: Allows localhost:3000

2. **Environment Variables:**
   - Never commit `.env` files to version control
   - Use secure environment variable management in production
   - Rotate AWS credentials regularly

3. **HTTPS:**
   - Use HTTPS in production for both frontend and backend
   - QuickSight requires HTTPS for production embedding

### Deployment Options

**Option 1: Traditional Hosting**
- Backend: Deploy to AWS EC2, Heroku, or DigitalOcean
- Frontend: Deploy to Netlify, Vercel, or AWS S3 + CloudFront

**Option 2: AWS Full Stack**
- Backend: AWS Lambda + API Gateway
- Frontend: AWS S3 + CloudFront
- Environment: AWS Systems Manager Parameter Store

**Option 3: Containerized**
- Docker containers for both frontend and backend
- Deploy to AWS ECS, Kubernetes, or Docker Swarm

## Troubleshooting

### Common Issues

1. **"Cannot connect to backend server"**
   - Check if backend is running on port 4000
   - Verify REACT_APP_BACKEND_URL is set correctly
   - Check CORS configuration

2. **"Access denied to QuickSight resource"**
   - Verify AWS credentials are correct
   - Check IAM permissions for QuickSight
   - Ensure dashboard ID is correct

3. **"Dashboard not found"**
   - Verify QUICKSIGHT_DASHBOARD_ID is correct
   - Check if dashboard exists in the specified AWS account
   - Ensure dashboard is published and accessible

4. **Iframe not loading**
   - Check browser console for CSP errors
   - Verify anonymous embedding is enabled
   - Check if domain is whitelisted in QuickSight

### Debug Mode

Enable debug logging by setting:
```env
LOG_LEVEL=debug
NODE_ENV=development
```

This will show detailed logs for AWS SDK calls and request/response cycles.

## API Endpoints

### GET /health
Returns server health status.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-10-08T12:00:00Z",
  "service": "foodwise-quicksight-backend"
}
```

### GET /get-embed-url
Returns QuickSight dashboard embed URL.

**Response (Success):**
```json
{
  "success": true,
  "embedUrl": "https://us-east-1.quicksight.aws.amazon.com/embed/...",
  "requestId": "abc123",
  "status": 200,
  "timestamp": "2024-10-08T12:00:00Z"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "Access denied to QuickSight resource",
  "code": "AccessDeniedException",
  "timestamp": "2024-10-08T12:00:00Z"
}
```

## Development Commands

**Backend:**
```bash
npm start          # Production mode
npm run dev        # Development with nodemon
npm run test       # Run tests (when implemented)
```

**Frontend:**
```bash
npm start          # Development server
npm run build      # Production build
npm run test       # Run tests
npm run eject      # Eject from Create React App
```

## Performance Considerations

1. **Caching:** The embed URL is cached on the frontend until refresh
2. **Timeout:** API requests have a 10-second timeout
3. **Error Handling:** Comprehensive error handling with retry functionality
4. **Loading States:** Skeleton loading for better UX

## Next Steps

1. **Authentication:** Add user authentication for personalized dashboards
2. **Multiple Dashboards:** Support for different dashboards per user role
3. **Caching:** Implement Redis caching for embed URLs
4. **Monitoring:** Add application monitoring and logging
5. **Tests:** Add unit and integration tests