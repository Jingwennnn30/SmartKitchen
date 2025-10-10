import React from 'react';
import { Box, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Typography } from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import WarningIcon from '@mui/icons-material/Warning';
import DinnerDiningIcon from '@mui/icons-material/DinnerDining';
import InsightsIcon from '@mui/icons-material/Insights';
import BusinessIcon from '@mui/icons-material/Business';
import { styled } from '@mui/material/styles';
import { useNavigate, useLocation } from 'react-router-dom';

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

const sidebarItems = [
    { title: 'Dashboard', icon: <GridViewIcon />, path: '/' },
    { title: 'Inventory', icon: <LocalShippingIcon />, path: '/inventory' },
    { title: 'Order Management', icon: <RestaurantIcon />, path: '/order-management' },
    { title: 'Supplier Orders', icon: <BusinessIcon />, path: '/supplier-orders' },
    { title: 'Near Expired Items', icon: <WarningIcon />, path: '/near-expired-items' },
    { title: 'Pre-dining Preparation', icon: <DinnerDiningIcon />, path: '/pre-dining' },
    { title: 'Performance & Trends', icon: <InsightsIcon />, path: '/performance' },
];

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleItemClick = (path: string) => {
        navigate(path);
    };

    return (
        <SidebarContainer>
            <LogoContainer>
                <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold' }}>
                    FoodWise
                </Typography>
            </LogoContainer>
            <Box sx={{ mt: 2 }}>
                <List>
                {sidebarItems.map((item, index) => (
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
                                primary={item.title}
                            />
                        </StyledListItemButton>
                    </ListItem>
                ))}
                </List>
            </Box>
        </SidebarContainer>
    );
};

export default Sidebar;