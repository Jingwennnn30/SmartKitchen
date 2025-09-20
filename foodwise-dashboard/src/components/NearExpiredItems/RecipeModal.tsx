import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Divider,
    Chip,
    IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { MenuItem } from '../../services/menuService';

interface RecipeModalProps {
    open: boolean;
    onClose: () => void;
    recipe: MenuItem | null;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: '12px',
        maxWidth: '600px',
        width: '90%',
    },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
    padding: theme.spacing(3),
    paddingBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
}));

const PriceChip = styled(Chip)(({ theme }) => ({
    backgroundColor: theme.palette.success.light,
    color: theme.palette.success.contrastText,
    fontWeight: 'bold',
    fontSize: '1rem',
}));

const IngredientBox = styled(Box)(({ theme }) => ({
    backgroundColor: '#f8f9ff',
    padding: theme.spacing(2),
    borderRadius: '8px',
    margin: theme.spacing(2, 0),
}));

const RecipeModal: React.FC<RecipeModalProps> = ({ open, onClose, recipe }) => {
    if (!recipe) return null;

    // Parse ingredients from the string
    const ingredientsList = recipe.ingredients
        .split(',')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0);

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            aria-labelledby="recipe-dialog-title"
        >
            <StyledDialogTitle id="recipe-dialog-title">
                <Box>
                    <Typography variant="h5" component="div" fontWeight="bold">
                        {recipe.name}
                    </Typography>
                    <PriceChip label={recipe.price} size="medium" />
                </Box>
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </StyledDialogTitle>

            <DialogContent sx={{ padding: 3 }}>
                {/* Description Section */}
                <Box mb={3}>
                    <Typography variant="h6" gutterBottom color="primary">
                        Description
                    </Typography>
                    <Typography variant="body1" color="text.secondary" lineHeight={1.6}>
                        {recipe.description}
                    </Typography>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Ingredients Section */}
                <Box>
                    <Typography variant="h6" gutterBottom color="primary">
                        Ingredients
                    </Typography>
                    <IngredientBox>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            {ingredientsList.map((ingredient, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        padding: '8px 0',
                                        borderBottom: index < ingredientsList.length - 1 ? '1px solid #e0e0e0' : 'none',
                                    }}
                                >
                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                        • {ingredient}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </IngredientBox>
                </Box>
            </DialogContent>

            <DialogActions sx={{ padding: 3, paddingTop: 2 }}>
                <Button 
                    onClick={onClose} 
                    variant="outlined"
                    size="large"
                >
                    Close
                </Button>
                <Button 
                    variant="contained" 
                    size="large"
                    sx={{ ml: 2 }}
                >
                    Add to Menu
                </Button>
            </DialogActions>
        </StyledDialog>
    );
};

export default RecipeModal;