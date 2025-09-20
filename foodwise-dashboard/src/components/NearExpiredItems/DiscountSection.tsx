import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

interface DiscountItem {
    name: string;
    suggestedDiscount: string;
    time: string;
}

interface DiscountSectionProps {
    items: DiscountItem[];
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    marginTop: theme.spacing(3)
}));

const DiscountCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    backgroundColor: '#FFF9E6',
    marginBottom: theme.spacing(2),
    borderRadius: '8px'
}));

const DiscountSection: React.FC<DiscountSectionProps> = ({ items }) => {
    return (
        <StyledPaper>
            <Typography variant="h6" gutterBottom>
                Discount
            </Typography>
            <Box>
                {items.map((item, index) => (
                    <DiscountCard key={index}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {item.suggestedDiscount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Time: {item.time}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                            <Button variant="contained" size="small">
                                Add to Menu
                            </Button>
                        </Box>
                    </DiscountCard>
                ))}
            </Box>
        </StyledPaper>
    );
};

export default DiscountSection;