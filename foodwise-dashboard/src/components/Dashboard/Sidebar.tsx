import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography, Divider, Badge } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WarningIcon from '@mui/icons-material/Warning';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import InsightsIcon from '@mui/icons-material/Insights';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LogoutIcon from '@mui/icons-material/Logout';
import BusinessIcon from '@mui/icons-material/Business';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSupplierOrderNotifications } from '../../hooks/useSupplierOrderNotifications';

const SidebarContainer = styled(Box)(({ theme }) => ({
    width: 240,
    height: '100vh',
    position: 'fixed',
    backgroundColor: '#F8F9FA',
    borderRight: '1px solid #E9ECEF',
    left: 0,
    top: 0,
    zIndex: theme.zIndex.drawer
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    width: '100%',
    height: '64px',
    backgroundColor: '#0D47A1',
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(3),
    position: 'sticky',
    top: 0,
    zIndex: theme.zIndex.drawer + 1
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
    padding: theme.spacing(1, 2),
    marginBottom: theme.spacing(0.5),
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    '&.Mui-selected': {
        backgroundColor: '#E7F1FF',
        '&:hover': {
            backgroundColor: '#E7F1FF',
        },
    },
}));

const StyledListItemIcon = styled(ListItemIcon)({
    minWidth: 40,
    color: '#495057'
});

const StyledListItemText = styled(ListItemText)({
    '& .MuiTypography-root': {
        fontSize: '0.9rem',
        fontWeight: 500,
        color: '#495057'
    },
    '& .Mui-selected .MuiTypography-root': {
        color: '#0D6EFD'
    }
});

// Define sidebar items with role permissions
const sidebarItems = [
    { 
        title: 'Dashboard', 
        icon: <GridViewIcon />, 
        path: '/', 
        allowedRoles: ['manager'] 
    },
    { 
        title: 'Inventory', 
        icon: <LocalShippingIcon />, 
        path: '/inventory', 
        allowedRoles: ['manager'] 
    },
    { 
        title: 'Order Management', 
        icon: <RestaurantIcon />, 
        path: '/order-management', 
        allowedRoles: ['manager', 'chef'] 
    },
    { 
        title: 'Near Expired Items', 
        icon: <WarningIcon />, 
        path: '/near-expired-items', 
        allowedRoles: ['manager'] 
    },
    { 
        title: 'Pre-dining Preparation', 
        icon: <DinnerDiningIcon />, 
        path: '/pre-dining', 
        allowedRoles: ['manager', 'chef'] 
    },
    { 
        title: 'Performance & Trends', 
        icon: <InsightsIcon />, 
        path: '/performance', 
        allowedRoles: ['manager'] 
    },
    { 
        title: 'Supplier Orders', 
        icon: <BusinessIcon />, 
        path: '/supplier-orders',
        allowedRoles: ['manager'] },
    { 
        title: 'Menu', 
        icon: <MenuBookIcon />, 
        path: '/menu', 
        allowedRoles: ['customer'] 
    },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { newOrderCount, markAsChecked } = useSupplierOrderNotifications();

    const handleItemClick = (path: string) => {
        if (path === '/supplier-orders' && newOrderCount > 0) {
            markAsChecked(); // Mark notifications as checked when visiting supplier orders
        }
        navigate(path);
    };

    const handleLogout = () => {
        // Clear all authentication data
        localStorage.removeItem('idToken');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userRole');
        
        // Redirect to login page
        navigate('/login');
    };

    // Get current user role from localStorage
    const userRole = localStorage.getItem('userRole') || 'customer';

    // Filter sidebar items based on user role
    const filteredSidebarItems = sidebarItems.filter(item => 
        Array.isArray(item.allowedRoles) && item.allowedRoles.includes(userRole)
    );

    return (
        <SidebarContainer>
            <LogoContainer>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                    FoodWise
                </Typography>
            </LogoContainer>
            <Box sx={{ mt: 2, height: 'calc(100vh - 64px - 80px)', overflowY: 'auto' }}>
                <List>
                {filteredSidebarItems.map((item, index) => (
                    <ListItem key={index} disablePadding>
                        <StyledListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => handleItemClick(item.path)}
                            sx={{
                                borderRadius: '8px',
                                mx: 1,
                                '&.Mui-selected': {
                                    backgroundColor: '#E7F1FF',
                                    '& .MuiListItemIcon-root': {
                                        color: '#0D6EFD',
                                    },
                                    '& .MuiTypography-root': {
                                        color: '#0D6EFD',
                                        fontWeight: 600,
                                    },
                                },
                            }}
                        >
                            <StyledListItemIcon>
                                {item.icon}
                            </StyledListItemIcon>
                            <StyledListItemText 
                                primary={
                                    item.path === '/supplier-orders' && newOrderCount > 0 ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                            <span>{item.title}</span>
                                            <Badge 
                                                badgeContent={newOrderCount} 
                                                color="error"
                                                sx={{
                                                    '& .MuiBadge-badge': {
                                                        fontSize: '0.7rem',
                                                        height: '16px',
                                                        minWidth: '16px',
                                                        borderRadius: '50%'
                                                    }
                                                }}
                                            />
                                        </Box>
                                    ) : (
                                        item.title
                                    )
                                }
                            />
                        </StyledListItemButton>
                    </ListItem>
                ))}
                </List>
            </Box>
            <Box sx={{ position: 'absolute', bottom: 0, width: '100%', pb: 2 }}>
                <Divider sx={{ mb: 1 }} />
                <List>
                    <ListItem disablePadding>
                        <StyledListItemButton
                            onClick={handleLogout}
                            sx={{
                                borderRadius: '8px',
                                mx: 1,
                                '&:hover': {
                                    backgroundColor: '#FFE7E7',
                                },
                            }}
                        >
                            <StyledListItemIcon>
                                <LogoutIcon sx={{ color: '#D32F2F' }} />
                            </StyledListItemIcon>
                            <StyledListItemText 
                                primary="Logout"
                                sx={{
                                    '& .MuiTypography-root': {
                                        color: '#D32F2F',
                                        fontWeight: 600,
                                    }
                                }}
                            />
                        </StyledListItemButton>
                    </ListItem>
                </List>
            </Box>
        </SidebarContainer>
    );
};

export default Sidebar;