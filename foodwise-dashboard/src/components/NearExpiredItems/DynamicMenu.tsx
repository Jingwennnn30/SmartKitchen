import React, { useState, useEffect } from 'react';
import { 
    Box, 
    Typography, 
    Paper, 
    Button, 
    CircularProgress, 
    Alert,
    Chip,
    Fade,
    Tooltip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { MenuService, MenuItem } from '../../services/menuService';
import RecipeModal from './RecipeModal';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface DynamicMenuProps {
    items?: MenuItem[]; // Made optional since we'll fetch from API
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '12px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    marginTop: theme.spacing(3),
    background: 'linear-gradient(135deg, #e8eaf6 0%, #e1f5fe 100%)',
}));

const MenuItemCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #fff 0%, #f3e5f5 100%)',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0px 8px 24px rgba(63, 81, 181, 0.2)',
        border: '2px solid #3f51b5',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #673ab7, #3f51b5, #2196f3)',
    }
}));

const PriceChip = styled(Chip)(({ theme }) => ({
    backgroundColor: '#673ab7',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem',
    height: '32px',
    '& .MuiChip-icon': {
        color: 'white',
    }
}));

const NewBadge = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#2196f3',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
}));

const IngredientBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#e8eaf6',
    padding: '4px 8px',
    borderRadius: '8px',
    color: '#3f51b5',
    fontSize: '0.85rem',
    fontWeight: 500,
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
                
                // Use prop items if provided
                if (propItems && propItems.length > 0) {
                    setMenuItems(propItems);
                } else {
                    // Don't fetch from API if no items are provided
                    // Just show default state or empty state
                    setMenuItems([]);
                }
            } catch (err) {
                console.error('Error fetching menu data:', err);
                setError('Failed to load dynamic menu. Please try again later.');
                setMenuItems([]);
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
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MenuBookIcon color="primary" />
                    Dynamic Menu
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress color="primary" />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        Creating dynamic menu...
                    </Typography>
                </Box>
            </StyledPaper>
        );
    }

    return (
        <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <MenuBookIcon color="primary" />
                Dynamic Menu
                <Chip 
                    label={`${menuItems.length} Dishes`} 
                    size="small" 
                    color="primary" 
                    variant="outlined"
                />
            </Typography>
            
            {error && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Box>
                {menuItems.length === 0 ? (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 4,
                        color: 'text.secondary'
                    }}>
                        <MenuBookIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                        <Typography variant="body1" gutterBottom>
                            No dynamic menu generated yet
                        </Typography>
                        <Typography variant="body2">
                            Select items from the table above and click "Generate Dynamic Menu" to create AI-powered menu suggestions
                        </Typography>
                    </Box>
                ) : (
                    menuItems.map((item, index) => (
                        <Fade in={true} timeout={300 + index * 100} key={index}>
                            <MenuItemCard>
                                {/* Main Content */}
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                        {item.name}
                                    </Typography>
                                    
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                                        {item.description}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                        <LocalDiningIcon color="action" sx={{ fontSize: '1rem' }} />
                                        <IngredientBox>
                                            {MenuService.parseIngredients(item.ingredients || '').join(', ') || 'No ingredients listed'}
                                        </IngredientBox>
                                    </Box>

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                        <PriceChip 
                                            icon={<RestaurantMenuIcon />}
                                            label={item.price}
                                        />
                                        
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="Add this dish to active menu">
                                                <Button 
                                                    variant="contained" 
                                                    size="small"
                                                    sx={{ 
                                                        background: 'linear-gradient(45deg, #673ab7, #3f51b5)',
                                                        '&:hover': {
                                                            background: 'linear-gradient(45deg, #5e35b1, #303f9f)',
                                                        }
                                                    }}
                                                >
                                                    ADD TO MENU
                                                </Button>
                                            </Tooltip>
                                            
                                            <Tooltip title="View detailed recipe">
                                                <Button 
                                                    variant="outlined" 
                                                    size="small"
                                                    onClick={() => handleViewRecipe(item)}
                                                    startIcon={<VisibilityIcon />}
                                                    sx={{
                                                        borderColor: '#673ab7',
                                                        color: '#673ab7',
                                                        '&:hover': {
                                                            borderColor: '#5e35b1',
                                                            backgroundColor: '#f3e5f5',
                                                        }
                                                    }}
                                                >
                                                    VIEW RECIPE
                                                </Button>
                                            </Tooltip>
                                        </Box>
                                    </Box>
                                </Box>
                            </MenuItemCard>
                        </Fade>
                    ))
                )}
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