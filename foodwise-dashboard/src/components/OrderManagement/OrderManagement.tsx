import React, { useRef, useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    styled,
    Chip,
    IconButton,
    Tooltip,
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import VoiceAssistant from './VoiceAssistant';

interface KitchenUnit {
    id: string;
    name: string;
    slots: {
        status: 'In Used' | 'Empty';
        id: string;
    }[];
}

interface OrderItem {
    id: string;
    items: {
        name: string;
        status: 'Served' | 'Preparing' | 'Pending';
    }[];
    waitingTime: string;
}

interface ChefAssignment {
    chef: string;
    task: string;
    time: string;
}

const kitchenUnits: KitchenUnit[] = [
    {
        id: 'grill',
        name: 'Grill',
        slots: [
            { id: 'g1', status: 'In Used' },
            { id: 'g2', status: 'In Used' },
            { id: 'g3', status: 'Empty' },
            { id: 'g4', status: 'In Used' },
        ]
    },
    {
        id: 'oven',
        name: 'Oven',
        slots: [
            { id: 'o1', status: 'In Used' },
            { id: 'o2', status: 'Empty' },
            { id: 'o3', status: 'In Used' },
            { id: 'o4', status: 'Empty' },
        ]
    },
    {
        id: 'pan',
        name: 'Pan',
        slots: [
            { id: 'p1', status: 'In Used' },
            { id: 'p2', status: 'Empty' },
            { id: 'p3', status: 'In Used' },
            { id: 'p4', status: 'Empty' },
        ]
    },
    {
        id: 'fryer',
        name: 'Fryer',
        slots: [
            { id: 'f1', status: 'In Used' },
            { id: 'f2', status: 'Empty' },
            { id: 'f3', status: 'In Used' },
            { id: 'f4', status: 'Empty' },
        ]
    },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    height: '100%'
}));

const KitchenSlot = styled(Box)<{ status: string }>(({ status, theme }) => ({
    width: '100%',
    height: '80px',
    backgroundColor: status === 'In Used' ? '#ffcdd2' : '#c8e6c9',
    border: '1px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    color: status === 'In Used' ? '#d32f2f' : '#2e7d32',
    fontWeight: 'bold',
    transition: 'all 0.3s ease'
}));

const OrderManagement: React.FC = () => {
    const [isListening, setIsListening] = useState(false);

    const handleVoiceAssistant = () => {
        setIsListening(!isListening);
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                    Order Management
                </Typography>
            </Box>

            {/* KPI Section */}
            <Box sx={{ mb: 3 }}>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <StyledPaper>
                            <Typography variant="subtitle2" color="textSecondary">
                                Orders in Queue
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1, color: '#1976d2' }}>
                                8
                            </Typography>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StyledPaper>
                            <Typography variant="subtitle2" color="textSecondary">
                                Average Wait Time
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1, color: '#1976d2' }}>
                                12m
                            </Typography>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StyledPaper>
                            <Typography variant="subtitle2" color="textSecondary">
                                Longest Waiting Time
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1, color: '#1976d2' }}>
                                25m
                            </Typography>
                        </StyledPaper>
                    </Grid>
                </Grid>
            </Box>

            {/* Order Queue Section */}
            <Box sx={{ mb: 3 }}>
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>
                        Order Queue
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2 }}>
                        {[
                            {
                                id: '#1023',
                                items: [
                                    { name: 'Burger', status: 'Served' },
                                    { name: 'Pasta', status: 'Preparing' }
                                ],
                                waitingTime: '15m'
                            },
                            {
                                id: '#1024',
                                items: [
                                    { name: 'Steak', status: 'Preparing' }
                                ],
                                waitingTime: '10m'
                            },
                            {
                                id: '#1025',
                                items: [
                                    { name: 'Salad', status: 'Served' },
                                    { name: 'Beef', status: 'Preparing' }
                                ],
                                waitingTime: '20m'
                            },
                            {
                                id: '#1026',
                                items: [
                                    { name: 'Pizza', status: 'Preparing' },
                                    { name: 'Chicken', status: 'Preparing' }
                                ],
                                waitingTime: '5m'
                            }
                        ].map((order, index) => (
                            <Paper
                                key={index}
                                sx={{
                                    minWidth: 250,
                                    p: 2,
                                    backgroundColor: '#fff9f9',
                                    border: '1px solid #ffe7e7'
                                }}
                            >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        Order {order.id}
                                    </Typography>
                                </Box>
                                {order.items.map((item, itemIndex) => (
                                    <Box
                                        key={itemIndex}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            mb: 1
                                        }}
                                    >
                                        <Typography variant="body2">
                                            {item.name}
                                        </Typography>
                                        <Chip
                                            label={item.status}
                                            size="small"
                                            sx={{
                                                backgroundColor: item.status === 'Served' 
                                                    ? '#e8f5e9' 
                                                    : item.status === 'Preparing' 
                                                        ? '#fff3e0' 
                                                        : '#f5f5f5',
                                                color: item.status === 'Served'
                                                    ? '#2e7d32'
                                                    : item.status === 'Preparing'
                                                        ? '#ef6c00'
                                                        : '#757575'
                                            }}
                                        />
                                    </Box>
                                ))}
                                <Box sx={{ 
                                    mt: 2, 
                                    pt: 1, 
                                    borderTop: '1px solid #ffe7e7',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <Typography variant="caption" color="textSecondary">
                                        Customer waiting time
                                    </Typography>
                                    <Typography variant="subtitle2" color="error">
                                        {order.waitingTime}
                                    </Typography>
                                </Box>
                            </Paper>
                        ))}
                    </Box>
                </StyledPaper>
            </Box>

            {/* Kitchen Load Section */}
            <Box sx={{ mb: 3 }}>
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>
                        Kitchen Load
                    </Typography>
                    <Grid container spacing={3}>
                        {kitchenUnits.map((unit) => (
                            <Grid item xs={12} sm={6} md={3} key={unit.id}>
                                <Box sx={{ textAlign: 'center', mb: 1 }}>
                                    <Typography variant="subtitle1" fontWeight="medium">
                                        {unit.name}
                                    </Typography>
                                </Box>
                                <Grid container spacing={1}>
                                    {unit.slots.map((slot) => (
                                        <Grid item xs={6} key={slot.id}>
                                            <KitchenSlot status={slot.status}>
                                                {slot.status}
                                            </KitchenSlot>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                </StyledPaper>
            </Box>

            {/* Chef Assignment Section */}
            <Box sx={{ mb: 3 }}>
                <StyledPaper>
                    <Typography variant="h6" gutterBottom>
                        Chef Assignment
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                        {[
                            { chef: 'Chef A', task: 'Burger', time: '15 mins' },
                            { chef: 'Chef B', task: 'Pasta', time: '15 mins' },
                            { chef: 'Chef C', task: 'Salad', time: '5 mins' },
                            { chef: 'Chef D', task: 'Fries', time: '10 mins' }
                        ].map((assignment, index) => (
                            <Box key={index} sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                p: 1.5,
                                borderBottom: index === 3 ? 'none' : '1px solid #e0e0e0'
                            }}>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                    {assignment.chef}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    {assignment.task}
                                </Typography>
                                <Typography variant="body2" color="primary">
                                    {assignment.time}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                </StyledPaper>
            </Box>

            {/* Voice Assistant Button */}
            <Box sx={{ position: 'fixed', bottom: 32, right: 32, zIndex: 1000 }}>
                <IconButton 
                    onClick={handleVoiceAssistant}
                    sx={{
                        backgroundColor: isListening ? '#4caf50' : 'primary.main',
                        color: 'white',
                        width: 56,
                        height: 56,
                        '&:hover': {
                            backgroundColor: isListening ? '#388e3c' : 'primary.dark',
                        },
                        boxShadow: 3,
                    }}
                >
                    {isListening ? <MicIcon /> : <MicOffIcon />}
                </IconButton>
            </Box>
            <VoiceAssistant isActive={isListening} />
        </Box>
    );
};

export default OrderManagement;