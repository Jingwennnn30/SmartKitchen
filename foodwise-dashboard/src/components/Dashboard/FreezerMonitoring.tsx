import React from 'react';
import { Box, Card, Typography, List, ListItem, Alert, AlertTitle } from '@mui/material';
import DeviceThermostatIcon from '@mui/icons-material/DeviceThermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';

interface FreezerAlert {
    id: number;
    name: string;
    temperature: number;
    humidity: number;
    normalTempRange: { min: number; max: number };
    normalHumidityRange: { min: number; max: number };
}

// Mock data - replace with actual data from sensors
const freezerAlerts: FreezerAlert[] = [
    {
        id: 1,
        name: 'Main Storage Freezer',
        temperature: -12,
        humidity: 85,
        normalTempRange: { min: -18, max: -14 },
        normalHumidityRange: { min: 60, max: 75 }
    },
    {
        id: 2,
        name: 'Meat Storage Unit',
        temperature: -20,
        humidity: 82,
        normalTempRange: { min: -18, max: -14 },
        normalHumidityRange: { min: 60, max: 75 }
    },
];

const isTemperatureAlert = (freezer: FreezerAlert): boolean => {
    return (
        freezer.temperature > freezer.normalTempRange.max ||
        freezer.temperature < freezer.normalTempRange.min
    );
};

const isHumidityAlert = (freezer: FreezerAlert): boolean => {
    return (
        freezer.humidity > freezer.normalHumidityRange.max ||
        freezer.humidity < freezer.normalHumidityRange.min
    );
};

const FreezerMonitoring: React.FC = () => {
    const alertFreezers = freezerAlerts.filter(
        freezer => isTemperatureAlert(freezer) || isHumidityAlert(freezer)
    );

    if (alertFreezers.length === 0) {
        return (
            <Card sx={{
                height: '100%',
                p: 1.5,
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                borderRadius: '8px'
            }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                    Freezer Monitoring
                </Typography>
                <Alert severity="success" sx={{ py: 0.5 }}>
                    <AlertTitle sx={{ mb: 0.5 }}>All Systems Normal</AlertTitle>
                    All freezers are operating within normal parameters
                </Alert>
            </Card>
        );
    }

    return (
        <Box sx={{ p: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
                Freezer Monitoring
            </Typography>
            <List sx={{ p: 0 }}>
                {alertFreezers.map((freezer) => (
                    <ListItem key={freezer.id} sx={{ flexDirection: 'column', alignItems: 'stretch', p: 0, mb: 1 }}>
                        <Alert 
                            severity="warning"
                            sx={{ py: 1, width: '100%' }}
                        >
                            <AlertTitle>{freezer.name}</AlertTitle>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {isTemperatureAlert(freezer) && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <DeviceThermostatIcon color="error" sx={{ fontSize: '1.2rem' }} />
                                        <Typography variant="body2">
                                            Temperature: {freezer.temperature}°C
                                            (Normal: {freezer.normalTempRange.min}°C to {freezer.normalTempRange.max}°C)
                                        </Typography>
                                    </Box>
                                )}
                                {isHumidityAlert(freezer) && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <WaterDropIcon color="error" sx={{ fontSize: '1.2rem' }} />
                                        <Typography variant="body2">
                                            Humidity: {freezer.humidity}%
                                            (Normal: {freezer.normalHumidityRange.min}% to {freezer.normalHumidityRange.max}%)
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Alert>
                    </ListItem>
                ))}
            </List>
        </Box>
    );
};

export default FreezerMonitoring;