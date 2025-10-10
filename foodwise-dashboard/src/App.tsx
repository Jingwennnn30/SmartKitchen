import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  createBrowserRouter, 
  RouterProvider, 
  Route, 
  createRoutesFromElements,
  Outlet
} from 'react-router-dom';
import Dashboard from './components/Dashboard/Dashboard';
import NearExpiredItems from './components/NearExpiredItems/NearExpiredItems';
import InventoryPage from './components/Inventory/InventoryPage';
import PreDiningPreparation from './components/PreDining/PreDiningPreparation';
import OrderManagement from './components/OrderManagement/OrderManagement';
import PerformanceTrends from './components/Performance/PerformanceTrends';
import DonationPage from './components/Donation/DonationPage';
import SupplierOrder from './components/SupplierOrder/SupplierOrder';
import Sidebar from './components/Dashboard/Sidebar';
import Header from './components/shared/Header';
import { Box } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          overflowX: 'hidden',
        },
        body: {
          overflowX: 'hidden',
        },
      },
    },
  },
});

const AppLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F8F9FA', overflow: 'hidden' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 2,
            mt: '64px',
            ml: '240px',
            height: 'calc(100vh - 64px)',
            overflow: 'auto',
            maxWidth: 'calc(100vw - 240px)',
            boxSizing: 'border-box'
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AppLayout />}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/near-expired-items" element={<NearExpiredItems />} />
      <Route path="/donation" element={<DonationPage />} />
      <Route path="/pre-dining" element={<PreDiningPreparation />} />
      <Route path="/order-management" element={<OrderManagement />} />
      <Route path="/supplier-orders" element={<SupplierOrder />} />
      <Route path="/performance" element={<PerformanceTrends />} />
    </Route>
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