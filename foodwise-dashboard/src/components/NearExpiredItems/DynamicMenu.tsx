import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Button, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import { MenuService, MenuItem } from '../../services/menuService';
import RecipeModal from './RecipeModal';

interface DynamicMenuProps {
    items?: MenuItem[]; // Made optional since we'll fetch from API
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    marginTop: theme.spacing(3)
}));

const MenuItemCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: '#F8F9FF',
    marginBottom: theme.spacing(2),
    borderRadius: '8px'
}));

const ButtonGroup = styled(Box)({
    display: 'flex',
    gap: '8px',
    marginTop: '12px'
});

const DynamicMenu: React.FC<DynamicMenuProps> = ({ items: propItems }) => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecipe, setSelectedRecipe] = useState<MenuItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchMenuData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Use prop items if provided, otherwise fetch from API
                if (propItems && propItems.length > 0) {
                    setMenuItems(propItems);
                } else {
                    const data = await MenuService.getDynamicMenu();
                    setMenuItems(data);
                }
            } catch (err) {
                console.error('Error fetching menu data:', err);
                setError('Failed to load dynamic menu. Please try again later.');
                
                // Fallback to mock data
                setMenuItems([
                    {
                        name: "Chicken & Broccoli Pasta",
                        price: "MYR 15.90",
                        description: "Delicious pasta with chicken and broccoli",
                        ingredients: "chicken, broccoli, pasta"
                    },
                    {
                        name: "Chicken Broccoli Pizza",
                        price: "MYR 15.90", 
                        description: "Fresh pizza with chicken and broccoli",
                        ingredients: "chicken, broccoli, white sauce"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchMenuData();
    }, [propItems]);

    const handleViewRecipe = (item: MenuItem) => {
        setSelectedRecipe(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedRecipe(null);
    };

    if (loading) {
        return (
            <StyledPaper>
                <Typography variant="h6" gutterBottom>
                    Dynamic Menu
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        Loading dynamic menu...
                    </Typography>
                </Box>
            </StyledPaper>
        );
    }

    return (
        <StyledPaper>
            <Typography variant="h6" gutterBottom>
                Dynamic Menu
            </Typography>
            
            {error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Box>
                {menuItems.map((item, index) => (
                    <MenuItemCard key={index}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Ingredients: {MenuService.parseIngredients(item.ingredients || '').join(', ') || 'No ingredients listed'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Suggested Price: {item.price}
                        </Typography>
                        <ButtonGroup>
                            <Button variant="contained" size="small">
                                ADD TO MENU
                            </Button>
                            <Button 
                                variant="outlined" 
                                size="small"
                                onClick={() => handleViewRecipe(item)}
                            >
                                VIEW RECIPE
                            </Button>
                        </ButtonGroup>
                    </MenuItemCard>
                ))}
            </Box>

            <RecipeModal 
                open={isModalOpen}
                onClose={handleCloseModal}
                recipe={selectedRecipe}
            />
        </StyledPaper>
    );
};

export default DynamicMenu;