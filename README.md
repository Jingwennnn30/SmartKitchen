# 🍽️ FoodWise - AI-Powered Food Waste and Stock Management System

A comprehensive AWS serverless solution for intelligent restaurant inventory management, food waste reduction, and operational optimization.

**Reference Link:**
Deployment : https://main.d20y271iadqee6.amplifyapp.com/login

Presentation Slide : https://drive.google.com/drive/folders/1nNjIpyqkylrg8zR9INLGTtIAYlrThiOG


### **AWS Services Used**
- **AWS Amplify**: Build and deploy the application with GitHub integration
- **AWS Lambda**: Serverless compute for business logic
- **Amazon DynamoDB**: NoSQL database for inventory, menu, and sales data
- **Amazon Lex**: Conversational AI for voice assistant
- **Amazon Bedrock**: AI/ML model integration for menu and discount generation
- **API Gateway**: RESTful API endpoints
- **Amazon S3**: Static asset and data storage
- **Amazon SageMaker**:　ML training and demand forecasting
- **Amazon QuickSight**: Interactive analytics and dashboards
- **Amazon SNS / EventBridge**: Alerts, notifications, and event orchestration
- -**Amazon IAM & Cognito**: Secure authentication and access control
- **Amazon CloudWatch**: Monitoring and observability
　
  
## 🌟 Features

### **Dashboard & Analytics**
- Real-time KPI monitoring (Stock Value, Expiring Items, Wait Times, Food Waste)
- Comprehensive visualization layer — combines in-app charts (Recharts & Nivo) with Amazon QuickSight dashboards for deeper, enterprise-grade insights
- Low stock alerts with automated reorder suggestions
- Chatbot


### **Inventory Management**
- Current inventory tracking with search functionality
- Stock level visualization with color-coded indicators
- Predicted restock recommendations with AI-powered suggestions
- **Voice Assistant**: "Hey Chef" voice commands for hands-free operations
- **Predictive Analytics**: ML-powered demand forecasting and restock predictions


### **Food Expiry Handling (3Ds)**
- **Dynamic Menu Generation**: Integrate with Amazon Bedrock, Gen-AI creates menu suggestions based on available ingredients
- **Discount Promotions**: Intelligent discount suggestions for near-expired items
- **Donation Management**:
- Near-expired item donation tracking
- NGO partnership management
- Impact reporting and analytics


### **Order Management**
- Voice-activated ordering system with Amazon Lex integration
- Real-time order tracking and kitchen assignment
- Automated order processing

### **Supplier Orders**
- End-to-end restock flow that automatically sends order details to vendors via email
- Bulk Order Actions: Supports batch approval, rejection, or update of order statuses.
- Historical order table displaying recent supplier orders with item details and status for full traceability and auditing.


### **Performance Analytics**
- Cost and waste analysis helps monitor spending, reduce food waste, and highlight monthly savings.
- Historical order patterns reveal trends in daily orders, revenue, and peak operational days.
- Stock vs usage trends track inventory levels
- Reports can be exported with AI-generated insights and optimization suggestions.


## 🏗️ Architecture

### **Frontend (React + TypeScript)**
```
foodwise-dashboard/
├── src/
│ ├── components/
│ │ ├── Dashboard/                 # Real-time KPI dashboard
│ │ ├── Inventory/                 # Smart inventory management
│ │ ├── OrderManagement/           # Voice-enabled order processing
│ │ ├── Performance/               # AI analytics & reporting
│ │ ├── NearExpiredItems/          # Food waste management
│ │ ├── Donation/                  # Sustainability tracking
│ │ └── shared/                    # Reusable UI components
│ ├── services/                    # AWS API integration
│ ├── types/                       # TypeScript definitions
│ └── utils/                       # Helper functions
├── public/                        # Static assets
├── package.json
└── tsconfig.json
│   │   └── shared/                # Reusable components
│   └── services/                  # API integration services
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


## 📊 API Endpoints

### **Core Services**
- `GET /expired` - Retrieve near-expired items
- `POST /discounts` - Generate AI discount promotions
- `POST /menu` - Create dynamic menu suggestions
- `POST /order` - Process orders
- `POST /donation` - Schedule donations
- `POST /lex` - Voice assistant integration



## Security

- **CORS Configuration**: Properly configured for cross-origin requests
- **Input Validation**: All API inputs are validated and sanitized
- **Environment Variables**: Sensitive data stored securely
- **AWS IAM**: Least privilege access principles


## Project Structure

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
- **Recharts & Nivo** & **AWS QuickSight** - Data visualization
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


## 🙏 Acknowledgments

- **AWS team** for providing the serverless infrastructure, sandbox account, and an amazing hackathon experience.  
- **Our team mentors** for their valuable guidance, feedback, and support throughout the hackathon preparation.  
- **Hackathon organizers** for creating this opportunity and fostering collaboration and innovation.
- **Team originFive members** for the hard work, dedication, and collaboration that helped bring this project to the finals!


---

**Built with ❤️ for the Great Malaysia AI Hackathon 2025**

*Reducing food waste, one smart decision at a time.* 🌱
