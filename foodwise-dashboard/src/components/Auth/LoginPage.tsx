import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    styled,
    Container,
    IconButton,
    InputAdornment,
    CircularProgress,
    Link
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: '12px',
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#ffffff',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0px 6px 24px rgba(0, 0, 0, 0.12)'
    }
}));

interface LoginPageProps {
    onLogin: (email: string, password: string) => Promise<void>;
    isLoading: boolean;
    error: string;
    onClearError: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, isLoading, error, onClearError }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            // Handle validation in parent component
            return;
        }
        onClearError();
        await onLogin(username, password);
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        if (error) onClearError();
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
        if (error) onClearError();
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                background: 'linear-gradient(120deg, #E3F2FD 0%, #F5F7FA 100%)',
                position: 'relative',
            }}
        >
            {/* Decorative background circle */}
            <Box sx={{
                position: 'absolute',
                top: '-120px',
                left: '-120px',
                width: '320px',
                height: '320px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #38467bff 0%, #E3F2FD 100%)',
                opacity: 0.15,
                zIndex: 0,
            }} />
            <Container
                sx={{
                    zIndex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    maxWidth: '100vw',
                    padding: 0,
                }}
            >
                <StyledPaper elevation={3}>
                    {/* Logo/Brand area */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        {/* Replace below with your logo if available */}
                        <Box sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #38467bff 60%, #E3F2FD 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                        }}>
                            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700 }}>
                                FW
                            </Typography>
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#38467bff', mb: 0.5 }}>
                            FoodWise Login
                        </Typography>
                    </Box>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email address"
                            variant="outlined"
                            value={username}
                            onChange={handleUsernameChange}
                            margin="normal"
                            error={!!error && !username}
                            type="email"
                            placeholder="Enter your email"
                            sx={{
                                mb: 2,
                                '& .MuiOutlinedInput-root': {
                                    background: '#F8F9FA',
                                    borderRadius: '8px',
                                    '&:hover fieldset': {
                                        borderColor: '#38467bff',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#38467bff',
                                    }
                                }
                            }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            variant="outlined"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={handlePasswordChange}
                            margin="normal"
                            error={!!error && !password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ mb: 2, '& .MuiOutlinedInput-root': { background: '#F8F9FA', borderRadius: '8px' } }}
                        />
                        {error && (
                            <Box sx={{
                                background: 'rgba(255,0,0,0.07)',
                                borderRadius: '8px',
                                py: 1,
                                px: 2,
                                mb: 2,
                                textAlign: 'center',
                                border: '1px solid #ffcccc',
                            }}>
                                <Typography color="error" variant="body2">
                                    {error}
                                </Typography>
                            </Box>
                        )}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Link 
                                href="#" 
                                underline="none" 
                                sx={{ 
                                    color: '#38467bff',
                                    fontWeight: 500,
                                    '&:hover': {
                                        color: '#38467bff'
                                    }
                                }}
                            >
                                Forgot password?
                            </Link>
                        </Box>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            size="large"
                            disabled={isLoading}
                            sx={{
                                mt: 2,
                                mb: 2,
                                height: '48px',
                                borderRadius: '10px',
                                textTransform: 'none',
                                fontSize: '1.05rem',
                                position: 'relative',
                                background: 'linear-gradient(90deg, #38467bff 70%, #7ba5c6ff 100%)',
                                boxShadow: '0px 2px 8px rgba(74,123,56,0.08)',
                                '&:hover': {
                                    background: 'linear-gradient(90deg, #38467bff 70%, #7ba5c6ff 100%)',
                                },
                                '&:disabled': {
                                    background: 'linear-gradient(90deg, #38467bff 70%, #7ba5c6ff 100%)',
                                    opacity: 0.7
                                }
                            }}
                        >
                            {isLoading ? (
                                <CircularProgress
                                    size={24}
                                    sx={{
                                        color: 'white',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        marginTop: '-12px',
                                        marginLeft: '-12px'
                                    }}
                                />
                            ) : (
                                'Login'
                            )}
                        </Button>
                    </form>
                </StyledPaper>
            </Container>
        </Box>
    );
};

export default LoginPage;