import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowUpward from '@mui/icons-material/ArrowUpward';
import ArrowDownward from '@mui/icons-material/ArrowDownward';

interface KPICardProps {
    title: string;
    value: string;
    subtitle?: string;
    valueColor?: string;
    trend?: 'up' | 'down';
}

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    padding: theme.spacing(2)
}));

const KPICard: React.FC<KPICardProps> = ({ title, value, subtitle, valueColor, trend }) => {
    return (
        <StyledCard>
            <CardContent>
                <Typography color="textSecondary" fontSize="0.875rem">
                    {title}
                </Typography>
                <Box mt={1} display="flex" alignItems="center">
                    <Typography 
                        variant="h5" 
                        component="div" 
                        fontWeight="bold"
                        sx={{ 
                            color: valueColor || 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1
                        }}
                    >
                        {value}
                        {trend === 'up' && <ArrowUpward sx={{ color: '#FFD700' }} />}
                        {trend === 'down' && <ArrowDownward sx={{ color: '#4CAF50' }} />}
                    </Typography>
                </Box>
                {subtitle && (
                    <Typography color="textSecondary" fontSize="0.75rem">
                        {subtitle}
                    </Typography>
                )}
            </CardContent>
        </StyledCard>
    );
};

export default KPICard;