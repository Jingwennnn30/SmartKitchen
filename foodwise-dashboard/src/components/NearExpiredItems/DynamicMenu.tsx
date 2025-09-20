import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

interface MenuItem {
    name: string;
    ingredients: string[];
    suggestedPrice: number;
}

interface DynamicMenuProps {
    items: MenuItem[];
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

const DynamicMenu: React.FC<DynamicMenuProps> = ({ items }) => {
    return (
        <StyledPaper>
            <Typography variant="h6" gutterBottom>
                Dynamic Menu
            </Typography>
            <Box>
                {items.map((item, index) => (
                    <MenuItemCard key={index}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Ingredients: {item.ingredients.join(', ')}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Suggested Price: RM {item.suggestedPrice.toFixed(2)}
                        </Typography>
                        <ButtonGroup>
                            <Button variant="contained" size="small">
                                Add to Menu
                            </Button>
                            <Button variant="outlined" size="small">
                                View Recipe
                            </Button>
                        </ButtonGroup>
                    </MenuItemCard>
                ))}
            </Box>
        </StyledPaper>
    );
};

export default DynamicMenu;