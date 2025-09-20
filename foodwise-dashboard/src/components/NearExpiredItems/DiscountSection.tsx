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
import { DiscountService, DiscountItem } from '../../services/discountService';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import FlashOnIcon from '@mui/icons-material/FlashOn';

interface DiscountSectionProps {
    items?: DiscountItem[]; // Made optional since we'll fetch from API
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '12px',
    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    marginTop: theme.spacing(3),
    background: 'linear-gradient(135deg, #fff8e1 0%, #fff3c4 100%)',
}));

const DiscountCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #fff 0%, #fffbf0 100%)',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0px 8px 24px rgba(255, 152, 0, 0.2)',
        border: '2px solid #ff9800',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #ff6b6b, #ffa726, #ff8f00)',
    }
}));

const PriceChip = styled(Chip)(({ theme }) => ({
    backgroundColor: '#ff6b6b',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '1rem',
    height: '32px',
    '& .MuiChip-icon': {
        color: 'white',
    }
}));

const DiscountBadge = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
}));

const TimeBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#e3f2fd',
    padding: '4px 8px',
    borderRadius: '8px',
    color: '#1976d2',
    fontSize: '0.8rem',
    fontWeight: 500,
}));

const DiscountSection: React.FC<DiscountSectionProps> = ({ items: propItems }) => {
    const [discountItems, setDiscountItems] = useState<DiscountItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDiscountData = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Use prop items if provided, otherwise fetch from API
                if (propItems && propItems.length > 0) {
                    setDiscountItems(propItems);
                } else {
                    const data = await DiscountService.getDiscounts();
                    setDiscountItems(data);
                }
            } catch (err) {
                console.error('Error fetching discount data:', err);
                setError('Failed to load discount offers. Please try again later.');
                
                // Fallback to mock data
                setDiscountItems([
                    {
                        dish: "Potato",
                        promotion_title: "Potato Special",
                        promotion_price: "5.90",
                        promotion_description: "Get 30% off on potato dishes - whole day special!",
                        time: "Whole Day"
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchDiscountData();
    }, [propItems]);

    if (loading) {
        return (
            <StyledPaper>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferIcon color="warning" />
                    Discount Offers
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="150px">
                    <CircularProgress color="warning" />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        Loading discount offers...
                    </Typography>
                </Box>
            </StyledPaper>
        );
    }

    return (
        <StyledPaper>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <LocalOfferIcon color="warning" />
                Discount Offers
                <Chip 
                    label={`${discountItems.length} Available`} 
                    size="small" 
                    color="warning" 
                    variant="outlined"
                />
            </Typography>
            
            {error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            <Box>
                {discountItems.map((item, index) => (
                    <Fade in={true} timeout={300 + index * 100} key={index}>
                        <DiscountCard>
                            {/* Discount Badge */}
                            <DiscountBadge>
                                <FlashOnIcon sx={{ fontSize: '1rem' }} />
                                {DiscountService.extractDiscountPercentage(item.promotion_description) || 'SPECIAL'}
                            </DiscountBadge>

                            {/* Main Content */}
                            <Box sx={{ pr: 6 }}>
                                <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 1 }}>
                                    {item.promotion_title}
                                </Typography>
                                
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <RestaurantMenuIcon color="action" sx={{ fontSize: '1rem' }} />
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        {item.dish}
                                    </Typography>
                                </Box>

                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
                                    {item.promotion_description}
                                </Typography>

                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <PriceChip 
                                            icon={<LocalOfferIcon />}
                                            label={DiscountService.formatPrice(item.promotion_price)}
                                        />
                                        <TimeBox>
                                            <AccessTimeIcon sx={{ fontSize: '1rem' }} />
                                            {item.time}
                                        </TimeBox>
                                    </Box>
                                    
                                    <Tooltip title="Add this promotion to active menu">
                                        <Button 
                                            variant="contained" 
                                            size="small"
                                            sx={{ 
                                                background: 'linear-gradient(45deg, #ff6b6b, #ffa726)',
                                                '&:hover': {
                                                    background: 'linear-gradient(45deg, #ff5252, #ff9800)',
                                                }
                                            }}
                                        >
                                            ADD TO MENU
                                        </Button>
                                    </Tooltip>
                                </Box>
                            </Box>
                        </DiscountCard>
                    </Fade>
                ))}
            </Box>
        </StyledPaper>
    );
};

export default DiscountSection;