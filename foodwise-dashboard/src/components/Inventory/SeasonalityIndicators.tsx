import React from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import WeekendIcon from '@mui/icons-material/Weekend';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import CelebrationIcon from '@mui/icons-material/Celebration';

interface SeasonalityCircleProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
}

const SeasonalityCircle: React.FC<SeasonalityCircleProps> = ({ title, value, icon, color }) => (
    <Tooltip title={`${title}: ${value}`} placement="top">
        <Box
            sx={{
                width: 60,
                height: 60,
                borderRadius: '50%',
                bgcolor: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                transition: 'transform 0.2s',
                cursor: 'pointer',
                '&:hover': {
                    transform: 'scale(1.1)',
                }
            }}
        >
            {icon}
        </Box>
    </Tooltip>
);

const SeasonalityIndicators: React.FC = () => {
    const today = new Date();
    const isWeekend = today.getDay() === 0 || today.getDay() === 6;
    
    // Mock data - replace with real data
    const weatherStatus = 'Sunny';
    const isHoliday = false;

    return (
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <SeasonalityCircle
                title="Day Type"
                value={isWeekend ? 'Weekend' : 'Weekday'}
                icon={<WeekendIcon />}
                color={isWeekend ? '#4CAF50' : '#757575'}
            />
            <SeasonalityCircle
                title="Weather"
                value={weatherStatus}
                icon={<WbSunnyIcon />}
                color="#FF9800"
            />
            <SeasonalityCircle
                title="Holiday Status"
                value={isHoliday ? 'Holiday/Festival' : 'Regular Day'}
                icon={<CelebrationIcon />}
                color={isHoliday ? '#E91E63' : '#757575'}
            />
        </Box>
    );
};

export default SeasonalityIndicators;