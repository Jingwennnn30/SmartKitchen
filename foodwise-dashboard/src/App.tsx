import React, { useState } from 'react';
import { InitiateAuthCommand, InitiateAuthCommandInput, AuthFlowType } from "@aws-sdk/client-cognito-identity-provider";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  createBrowserRouter, 
  RouterProvider, 
  Route, 
  createRoutesFromElements,
  Outlet,
  useNavigate
} from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import NearExpiredItems from './components/NearExpiredItems/NearExpiredItems';
import InventoryPage from './components/Inventory/InventoryPage';
import PreDiningPreparation from './components/PreDining/PreDiningPreparation';
import OrderManagement from './components/OrderManagement/OrderManagement';
import PerformanceTrends from './components/Performance/PerformanceTrends';
import DonationPage from './components/Donation/DonationPage';
import MenuPage from './components/Menu/MenuPage';
import Sidebar from './components/Dashboard/Sidebar';
import Header from './components/shared/Header';
import { Box } from '@mui/material';
import LoginPage from './components/Auth/LoginPage';
import { cognitoClient, cognitoClientId } from './types/cognitoStore';


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

const AppLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Header />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 2,
            mt: '64px',
            ml: '240px',
            height: 'calc(100vh - 64px)',
            overflow: 'auto'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};
// Helper functions - move outside LoginWrapper
const extractRoleFromToken = (token: string): string => {
  try {
    if (!token) return 'customer';
    
    const payload = JSON.parse(atob(token.split('.')[1]));
    const groups = payload['cognito:groups'] || [];
    
    // Return the first group (assuming users belong to only one group)
    if (groups.includes('Manager')) return 'manager';
    if (groups.includes('Chef')) return 'chef';
    if (groups.includes('Customer')) return 'customer';

    return 'customer'; // default
  } catch (error) {
    console.error("Error extracting groups from token:", error);
    return 'customer';
  }
};

const getRedirectUrl = (role: string): string => {
  switch (role) {
    case 'manager':
      return '/dashboard';
    case 'chef':
      return '/pre-dining';
    case 'customer':
    default:
      return '/menu';
  }
};

// Fix 2: Move state management to LoginWrapper and fix authentication logic
const LoginWrapper = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const clearError = () => {
    setError("");
  };

  const handleLogin = async (email: string, password: string) => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Fix 3: Use proper typing for input
      const input: InitiateAuthCommandInput = {
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
        },
        ClientId: cognitoClientId,
      };

      const command = new InitiateAuthCommand(input);
      const response = await cognitoClient.send(command);

      console.log("Login response:", response);

      // Fix 4: Handle different response scenarios properly
      if (response.ChallengeName === "NEW_PASSWORD_REQUIRED") {
        setError("New password required. Please contact administrator.");
        return;
      }

      if (response.AuthenticationResult) {
        const { IdToken, AccessToken, RefreshToken } = response.AuthenticationResult;
        
        // Store tokens and user info
        localStorage.setItem('idToken', IdToken || '');
        localStorage.setItem('accessToken', AccessToken || '');
        localStorage.setItem('refreshToken', RefreshToken || '');
        localStorage.setItem('userEmail', email);

        // Extract role from token
        const role = extractRoleFromToken(IdToken || '');
        localStorage.setItem('userRole', role);

        // Navigate based on role
        const redirectUrl = getRedirectUrl(role);
        navigate(redirectUrl);
      }

    } catch (err: any) {
      console.error("Login error:", err);
      let errorMessage = "An error occurred during login";
      
      if (err.name === "NotAuthorizedException") {
        errorMessage = "Incorrect username or password";
      } else if (err.name === "UserNotFoundException") {
        errorMessage = "User not found";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginPage 
      onLogin={handleLogin}
      isLoading={isLoading}
      error={error}
      onClearError={clearError}
    />
  );
};

// Fix 5: Add protected route component for role-based access
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: string[] 
}> = ({ children, allowedRoles }) => {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('idToken');
      const userRole = localStorage.getItem('userRole') || 'customer';
      
      if (!token) {
        navigate('/login');
      } else if (!allowedRoles.includes(userRole)) {
        // Redirect to appropriate page based on user's role
        const roleRedirect = getRoleRedirect(userRole);
        navigate(roleRedirect);
      }
      setChecked(true);
    };

    checkAuth();
  }, [navigate, allowedRoles]);

  const getRoleRedirect = (role: string): string => {
    switch (role) {
      case 'manager': return '/dashboard'; 
      case 'chef': return '/pre-dining';
      case 'customer': return '/menu';
      default: return '/menu';
    }
  };

  if (!checked) {
    return null;
  }

  return <>{children}</>;
};


const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/login" element={<LoginWrapper />} />
      
      {/* Protected Routes with Role-based Access */}
      <Route element={<AppLayout />}>
        {/* Manager routes - accessible by manager only */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/inventory" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <InventoryPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/near-expired-items" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <NearExpiredItems />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/donation" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <DonationPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/performance" 
          element={
            <ProtectedRoute allowedRoles={['manager']}>
              <PerformanceTrends />
            </ProtectedRoute>
          } 
        />
        
        {/* Chef routes - accessible by manager and chef */}
        <Route 
          path="/pre-dining" 
          element={
            <ProtectedRoute allowedRoles={['manager', 'chef']}>
              <PreDiningPreparation />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/order-management" 
          element={
            <ProtectedRoute allowedRoles={['manager', 'chef']}>
              <OrderManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* Customer routes - accessible by all roles */}
        <Route 
          path="/menu" 
          element={
            <ProtectedRoute allowedRoles={['manager', 'chef', 'customer']}>
              <MenuPage />
            </ProtectedRoute>
          } 
        />
      </Route>
    </>
  )
);

function App() {
  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
  );
}

export default App;