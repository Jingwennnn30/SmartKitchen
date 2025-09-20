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
    {
        id: 3,
        name: 'Daily Use Freezer',
        temperature: -13,
        humidity: 78,
        normalTempRange: { min: -18, max: -14 },
        normalHumidityRange: { min: 60, max: 75 }
    }
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
                p: 2,
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px'
            }}>
                <Typography variant="h6" gutterBottom>
                    Freezer Monitoring
                </Typography>
                <Alert severity="success">
                    <AlertTitle>All Systems Normal</AlertTitle>
                    All freezers are operating within normal parameters
                </Alert>
            </Card>
        );
    }

    return (
        <Card sx={{
            height: '400px',
            p: 2,
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            overflow: 'auto'
        }}>
            <Typography variant="h6" gutterBottom>
                Freezer Monitoring
            </Typography>
            <List>
                {alertFreezers.map((freezer) => (
                    <ListItem key={freezer.id} sx={{ flexDirection: 'column', alignItems: 'stretch' }}>
                        <Alert 
                            severity="warning"
                            sx={{ mb: 1, width: '100%' }}
                        >
                            <AlertTitle>{freezer.name}</AlertTitle>
                            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                {isTemperatureAlert(freezer) && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <DeviceThermostatIcon color="error" />
                                        <Typography>
                                            Temperature: {freezer.temperature}°C
                                            (Normal: {freezer.normalTempRange.min}°C to {freezer.normalTempRange.max}°C)
                                        </Typography>
                                    </Box>
                                )}
                                {isHumidityAlert(freezer) && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <WaterDropIcon color="error" />
                                        <Typography>
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
        </Card>
    );
};

export default FreezerMonitoring;