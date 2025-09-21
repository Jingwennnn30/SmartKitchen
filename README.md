# 🍽️ FoodWise - AI-Powered Food Waste and Stock Management System

A comprehensive AWS serverless solution for intelligent restaurant inventory management, food waste reduction, and operational optimization.

**Reference Link:**
Deployment : https://main.d7pk79y2e1xma.amplifyapp.com/

Presentation Slide : https://docs.google.com/presentation/d/1F7oNun8VsE6GxObxqAWnjyGL_0GXZhjt/edit?usp=sharing&ouid=105210094624135042073&rtpof=true&sd=true


## 🌟 Features

### 📊 **Dashboard & Analytics**
- Real-time KPI monitoring (Stock Value, Expiring Items, Wait Times, Food Waste)
- Interactive charts and visualizations using Recharts and Nivo
- Low stock alerts with automated reorder suggestions
- Freezer temperature monitoring with alerts

### 🥘 **Inventory Management**
- Current inventory tracking with search functionality
- Stock level visualization with color-coded indicators
- Predicted restock recommendations with AI-powered suggestions
- **Voice Assistant**: "Hey Chef" voice commands for hands-free operations
- **Predictive Analytics**: ML-powered demand forecasting and restock predictions


### 🤖 **Food Expiry Handling**
- **Dynamic Menu Generation**: Integrate with Amazon Bedrock, Gen-AI creates menu suggestions based on available ingredients
- **Discount Promotions**: Intelligent discount suggestions for near-expired items
- **Donation Management**:
- Near-expired item donation tracking
- NGO partnership management
- Impact reporting and analytics


### 🎯 **Order Management**
- Voice-activated ordering system with Amazon Lex integration
- Real-time order tracking and kitchen assignment
- Chef workload distribution
- Automated order processing

### 📈 **Performance Analytics**
- Food waste tracking and reduction metrics
- Business hour performance analysis
- Seasonal trend analysis
- Heatmap visualizations for operational insights


## 🏗️ Architecture

### **Frontend (React + TypeScript)**
```
foodwise-dashboard/
├── src/
│   ├── components/
│   │   ├── Dashboard/           # Main dashboard components
│   │   ├── Inventory/           # Inventory management
│   │   ├── OrderManagement/     # Order and voice assistant
│   │   ├── Performance/         # Analytics and reporting
│   │   ├── NearExpiredItems/    # Food waste management
│   │   ├── Donation/            # Donation tracking
│   │   └── shared/              # Reusable components
│   └── services/                # API integration services
```

### **Backend (AWS Serverless)**
```
lambda-functions/
├── discount/                    # AI discount generation
├── menu/                        # Dynamic menu creation
├── inventory/                   # Inventory management
├── donation/                    # Donation processing
└── voice-assistant/             # Lex integration
```

### **AWS Services Used**
- **AWS Amplify**: Build and deploy the application with GitHub integration
- **AWS Lambda**: Serverless compute for business logic
- **Amazon DynamoDB**: NoSQL database for inventory, menu, and sales data
- **Amazon Lex**: Conversational AI for voice assistant
- **Amazon Bedrock**: AI/ML model integration for menu and discount generation
- **API Gateway**: RESTful API endpoints
- **AWS Amplify**: Frontend hosting and deployment
- **Amazon S3**: Static asset storage


## 📊 API Endpoints

### **Core Services**
- `GET /expired` - Retrieve near-expired items
- `POST /discounts` - Generate AI discount promotions
- `POST /menu` - Create dynamic menu suggestions
- `POST /order` - Process orders
- `POST /donation` - Schedule donations
- `POST /lex` - Voice assistant integration



## 🔒 Security

- **CORS Configuration**: Properly configured for cross-origin requests
- **Input Validation**: All API inputs are validated and sanitized
- **Environment Variables**: Sensitive data stored securely
- **AWS IAM**: Least privilege access principles


## 📋 Project Structure

```
SmartKitchen/
├── foodwise-dashboard/          # React frontend application
│   ├── public/                  # Static assets
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── services/            # API integration
│   │   └── types/               # TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── lambda-functions/            # AWS Lambda functions
│   ├── discount/                # AI discount generation
│   ├── menu/                    # Dynamic menu creation
│   ├── inventory/               # Stock management
│   └── serverless.yml           # Serverless configuration
│
├── shared/                      # Shared utilities and types
│   ├── types/                   # Common TypeScript interfaces
│   └── utils/                   # Helper functions
│
└── README.md                    # Project documentation
```

## 🛠️ Technologies Used

### **Frontend**
- **React 18.2.0** - UI framework
- **TypeScript** - Type safety
- **Material-UI 5.14.17** - Component library
- **Recharts & Nivo** - Data visualization
- **React Router** - Navigation

### **Backend**
- **AWS Lambda** - Serverless functions
- **Python 3.9** - Runtime environment
- **Amazon DynamoDB** - Database
- **Amazon Bedrock** - AI/ML integration
- **Amazon Lex** - Conversational AI

### **DevOps**
- **AWS Amplify** - Frontend hosting
- **API Gateway** - API management
- **Serverless Framework** - Infrastructure as Code
- **GitHub Actions** - CI/CD pipeline


## 🙏 Acknowledgments

- **AWS** for providing the serverless infrastructure, sandbox account, and an amazing hackathon experience.  
- **Our mentors** for their valuable guidance, feedback, and support throughout the hackathon.  
- **Hackathon organizers** for creating this opportunity and fostering collaboration and innovation.  


---

**Built with ❤️ for the AWS Hackathon 2025**

*Reducing food waste, one smart decision at a time.* 🌱
