import React, { useState, useEffect, useCallback } from 'react';
import { 
    Card, 
    Typography, 
    Box, 
    CircularProgress, 
    Alert, 
    Button,
    Skeleton 
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface QuickSightResponse {
    success: boolean;
    embedUrl?: string;
    error?: string;
    timestamp: string;
}

const QuickSightFoodWasteChart: React.FC = () => {
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);


    // Lambda API URL - using AWS Lambda function instead of Express.js backend
    const LAMBDA_API_URL = 'https://bg4xe3t4be.execute-api.us-east-1.amazonaws.com/default/quicksight-foodwaste';

    const fetchEmbedUrl = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            console.log('Fetching QuickSight embed URL from Lambda:', LAMBDA_API_URL);
            
            const response = await fetch(LAMBDA_API_URL, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Add timeout to prevent hanging requests
                signal: AbortSignal.timeout(10000) // 10 second timeout
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data: QuickSightResponse = await response.json();
            
            if (data.success && data.embedUrl) {
                setEmbedUrl(data.embedUrl);
                console.log('Successfully loaded QuickSight embed URL');
            } else {
                throw new Error(data.error || 'Failed to get embed URL');
            }

        } catch (err) {
            console.error('Error fetching QuickSight embed URL:', err);
            
            let errorMessage = 'Failed to load dashboard';
            
            if (err instanceof Error) {
                if (err.name === 'AbortError') {
                    errorMessage = 'Request timeout - please try again';
                } else if (err.message.includes('Failed to fetch')) {
                    errorMessage = 'Cannot connect to backend server';
                } else {
                    errorMessage = err.message;
                }
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    // Load embed URL on component mount
    useEffect(() => {
        fetchEmbedUrl();
    }, [fetchEmbedUrl]);

    const handleRetry = () => {
        fetchEmbedUrl();
    };

    // Loading state
    if (loading) {
        return (
            <Card sx={{ 
                height: '400px', 
                p: 2,
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Typography variant="h6" gutterBottom>
                     Food Waste Analysis
                </Typography>
                <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2
                }}>
                    <CircularProgress size={40} />
                    <Typography variant="body2" color="textSecondary">
                        Loading QuickSight dashboard...
                    </Typography>
                    {/* Skeleton for better UX */}
                    <Box sx={{ width: '100%', mt: 2 }}>
                        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
                    </Box>
                </Box>
            </Card>
        );
    }

    // Error state
    if (error) {
        return (
            <Card sx={{ 
                height: '400px', 
                p: 2,
                boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
                borderRadius: '10px',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Typography variant="h6" gutterBottom>
                     Food Waste Analysis
                </Typography>
                <Box sx={{ 
                    flex: 1, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 2,
                    textAlign: 'center'
                }}>
                    <ErrorOutlineIcon sx={{ fontSize: 48, color: 'error.main' }} />
                    <Alert severity="error" sx={{ width: '100%' }}>
                        <Typography variant="body2">
                            {error}
                        </Typography>
                    </Alert>
                    <Button 
                        variant="outlined" 
                        startIcon={<RefreshIcon />}
                        onClick={handleRetry}
                        size="small"
                    >
                        Retry
                    </Button>
                    {process.env.NODE_ENV === 'development' && (
                        <Typography variant="caption" color="textSecondary">
                            Lambda API: {LAMBDA_API_URL}
                        </Typography>
                    )}
                </Box>
            </Card>
        );
    }

    // Success state - render QuickSight iframe
    return (
        <Card sx={{ 
            height: '400px', 
            p: 2,
            boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '10px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                mb: 1
            }}>
                <Typography variant="h6">
                     Food Waste Analysis
                </Typography>
                <Button 
                    size="small" 
                    startIcon={<RefreshIcon />}
                    onClick={handleRetry}
                    sx={{ minWidth: 'auto', px: 1 }}
                >
                    Refresh
                </Button>
            </Box>
            
            <Box sx={{ flex: 1, overflow: 'hidden', borderRadius: 1 }}>
                <iframe
                    src={embedUrl || ''}
                    style={{
                        width: '100%',
                        height: '100%',
                        border: 'none',
                        borderRadius: '8px'
                    }}
                    title="Food Waste Analysis Dashboard"
                    onLoad={() => console.log('QuickSight dashboard loaded successfully')}
                    onError={(e) => {
                        console.error('QuickSight iframe error:', e);
                        setError('Failed to load dashboard content');
                    }}
                />
            </Box>
            
            {/* Optional: Show last updated timestamp */}
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, textAlign: 'right' }}>
                Last updated: {new Date().toLocaleTimeString()}
            </Typography>
        </Card>
    );
};

export default QuickSightFoodWasteChart;