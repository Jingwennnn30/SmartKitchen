import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Chip,
    Tooltip,
    IconButton,
    Modal,
    Fade,
    Backdrop
} from '@mui/material';
import { styled } from '@mui/material/styles';
import EmailIcon from '@mui/icons-material/Email';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import ErrorIcon from '@mui/icons-material/Error';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CloseIcon from '@mui/icons-material/Close';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, LineChart, Line, Area, AreaChart } from 'recharts';
import { DonationService, SelectedItem, PartnerAnalytics } from '../../services/donationService';
import { useLocation, useNavigate } from 'react-router-dom';

// Green-themed styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '15px',
    boxShadow: '0px 4px 12px rgba(76, 175, 80, 0.15)',
    border: '1px solid rgba(76, 175, 80, 0.1)',
}));

const NotifyButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(45deg, #2196f3 30%, #42a5f5 90%)',
    color: 'white',
    fontWeight: 'bold',
    padding: '10px 20px',
    borderRadius: '8px',
    '&:hover': {
        background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
        transform: 'translateY(-1px)',
        boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
    },
}));

const NotifiedButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
    color: 'white',
    fontWeight: 'bold',
    padding: '10px 20px',
    borderRadius: '8px',
    '&:disabled': {
        background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
        color: 'white',
        opacity: 1,
    },
}));

const AnalysisModal = styled(Modal)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const ModalContent = styled(Paper)(({ theme }) => ({
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: theme.spacing(4),
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
}));

const ClickableChart = styled(Paper)(({ theme }) => ({
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(76, 175, 80, 0.2)',
    },
}));

const ActionButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)',
    color: 'white',
    borderRadius: '8px',
    padding: '8px 16px',
    textTransform: 'none',
    fontWeight: 'bold',
    '&:hover': {
        background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
        boxShadow: '0px 4px 8px rgba(33, 150, 243, 0.3)',
    },
    '&:disabled': {
        background: '#e0e0e0',
        color: '#9e9e9e',
    },
}));

const SuccessButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
    color: 'white',
    borderRadius: '8px',
    padding: '8px 16px',
    textTransform: 'none',
    fontWeight: 'bold',
    '&:disabled': {
        background: 'linear-gradient(135deg, #66bb6a 0%, #4caf50 100%)',
        color: 'white',
    },
}));

// Enhanced styled components for dashboard-consistent styling
const PageContainer = styled(Box)(({ theme }) => ({
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    padding: theme.spacing(3),
}));

const MainTitle = styled(Typography)(({ theme }) => ({
    color: '#2c3e50',
    fontWeight: 'bold',
    marginBottom: theme.spacing(3),
}));

const StatsCard = styled(Card)(({ theme }) => ({
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e0e0e0',
}));

// Light pastel cards to match dashboard theme
const BlueCard = styled(Card)(({ theme }) => ({
    borderRadius: '8px',
    background: '#e3f2fd',
    color: '#1565c0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}));

const GreenCard = styled(Card)(({ theme }) => ({
    borderRadius: '8px',
    background: '#e8f5e8',
    color: '#2e7d32',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}));

const OrangeCard = styled(Card)(({ theme }) => ({
    borderRadius: '8px',
    background: '#fff3e0',
    color: '#f57c00',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}));

const PurpleCard = styled(Card)(({ theme }) => ({
    borderRadius: '8px',
    background: '#f3e5f5',
    color: '#7b1fa2',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
}));

const ModernTable = styled(TableContainer)(({ theme }) => ({
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    background: 'white',
    border: '1px solid #e0e0e0',
}));

interface DonationPageProps {}

const DonationPage: React.FC<DonationPageProps> = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get selected items from navigation state
    const selectedItems: SelectedItem[] = location.state?.selectedItems || [];
    
    const [donationPartners, setDonationPartners] = useState<string[]>([]);
    const [partnerAnalytics, setPartnerAnalytics] = useState<PartnerAnalytics[]>([]);
    const [summaryStats, setSummaryStats] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
    
    // Local state for managing selected items with partners and notifications
    const [itemsWithPartners, setItemsWithPartners] = useState<SelectedItem[]>(
        selectedItems.map(item => ({ ...item, donation_partner: '', notified: false }))
    );

    useEffect(() => {
        const fetchDonationData = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await DonationService.getDonationData();
                setDonationPartners(data.donation_partners);
                setPartnerAnalytics(data.partner_analytics);
                setSummaryStats(data.summary_stats);
            } catch (err) {
                console.error('Error loading donation data:', err);
                setError('Failed to load donation data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDonationData();
    }, []);

    const handlePartnerChange = (index: number, partner: string) => {
        const updatedItems = [...itemsWithPartners];
        updatedItems[index].donation_partner = partner;
        setItemsWithPartners(updatedItems);
    };

    const handleNotifyPartner = async (index: number) => {
        const item = itemsWithPartners[index];
        if (!item.donation_partner) {
            alert('Please select a donation partner first');
            return;
        }

        try {
            const success = await DonationService.notifyPartner(item.item_name, item.donation_partner);
            if (success) {
                const updatedItems = [...itemsWithPartners];
                updatedItems[index].notified = true;
                setItemsWithPartners(updatedItems);
                
                // Show success message
                alert('Email template sent to partner. Informed about the donation initiative!');
            } else {
                alert('Failed to send notification. Please try again.');
            }
        } catch (error) {
            console.error('Notification error:', error);
            alert('Failed to send notification. Please try again.');
        }
    };

    // Chart data preparation - September 2025 data
    const wasteReductionData = [
        { name: 'Donated', value: 185, color: '#4caf50' },
        { name: 'Wasted', value: 42, color: '#f44336' },
    ];

    // Professional yearly analysis data for modal
    const yearlyAnalysisData = {
        stockVsUsage: [
            { day: 'Mon', stock: 420, usage: 220 },
            { day: 'Tue', stock: 350, usage: 180 },
            { day: 'Wed', stock: 180, usage: 1000 },
            { day: 'Thu', stock: 280, usage: 350 },
            { day: 'Fri', stock: 190, usage: 480 },
            { day: 'Sat', stock: 230, usage: 380 },
            { day: 'Sun', stock: 400, usage: 420 }
        ],
        monthlyTrends: [
            { month: 'Jan', donated: 120, wasted: 45, efficiency: 73 },
            { month: 'Feb', donated: 135, wasted: 38, efficiency: 78 },
            { month: 'Mar', donated: 155, wasted: 42, efficiency: 79 },
            { month: 'Apr', donated: 142, wasted: 35, efficiency: 80 },
            { month: 'May', donated: 168, wasted: 32, efficiency: 84 },
            { month: 'Jun', donated: 185, wasted: 28, efficiency: 87 },
            { month: 'Jul', donated: 195, wasted: 25, efficiency: 89 },
            { month: 'Aug', donated: 210, wasted: 22, efficiency: 91 },
            { month: 'Sep', donated: 185, wasted: 42, efficiency: 81 }
        ],
        partnerPerformance: [
            { partner: 'Community Pantry', donations: 88, success: 85, impact: 92 },
            { partner: 'ZeroWaste Org', donations: 82, success: 80, impact: 88 },
            { partner: 'Local Food Network', donations: 60, success: 58, impact: 75 },
            { partner: 'Green Initiative', donations: 75, success: 72, impact: 82 },
            { partner: 'Sustainability Hub', donations: 68, success: 65, impact: 78 },
            { partner: 'Eco Partners', donations: 55, success: 52, impact: 70 }
        ]
    };

    const partnerSuccessData = partnerAnalytics.map((partner, index) => {
        // Enhanced color palette for gradient bars
        const colors = [
            '#4caf50', '#66bb6a', '#81c784', 
            '#a5d6a7', '#c8e6c9', '#e8f5e8'
        ];
        return {
            name: partner.partner,
            success_rate: partner.success_rate,
            total: partner.total_donations,
            color: colors[index % colors.length]
        };
    });

    if (loading) {
        return (
            <Box sx={{ padding: 3 }}>
                <Typography variant="h4" gutterBottom fontWeight="bold" color="#4caf50">
                    Donation Management
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
                    <CircularProgress sx={{ color: '#4caf50' }} />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        Loading donation data...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <PageContainer>
            <MainTitle variant="h4" gutterBottom>
                🌱 Donation Management - Food Waste Reduction
            </MainTitle>

            {error && (
                <Alert severity="warning" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Summary Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <BlueCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Total Partners
                            </Typography>
                            <Typography variant="h3" fontWeight="bold">
                                {summaryStats.total_partners || 6}
                            </Typography>
                        </CardContent>
                    </BlueCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <GreenCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Items Donated
                            </Typography>
                            <Typography variant="h3" fontWeight="bold">
                                {summaryStats.total_donated_items || 42}
                            </Typography>
                        </CardContent>
                    </GreenCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <OrangeCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Waste Reduced (kg)
                            </Typography>
                            <Typography variant="h3" fontWeight="bold">
                                185
                            </Typography>
                        </CardContent>
                    </OrangeCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <PurpleCard>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                Selected Items
                            </Typography>
                            <Typography variant="h3" fontWeight="bold">
                                {itemsWithPartners.length}
                            </Typography>
                        </CardContent>
                    </PurpleCard>
                </Grid>
            </Grid>

            {/* Selected Items Table */}
            <StatsCard sx={{ mb: 4, padding: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold" sx={{ 
                    color: '#2c3e50',
                    mb: 3 
                }}>
                    Selected Items for Donation
                </Typography>
                
                {itemsWithPartners.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: '8px' }}>
                        No items selected for donation. Please go back to the Near Expired Items page and select items.
                    </Alert>
                ) : (
                    <ModernTable>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ 
                                    backgroundColor: '#f5f5f5',
                                    '& th': { fontWeight: 'bold', color: '#2c3e50' }
                                }}>
                                    <TableCell>Item Name</TableCell>
                                    <TableCell>Quantity</TableCell>
                                    <TableCell>Expiry Date</TableCell>
                                    <TableCell>Donation Partner</TableCell>
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {itemsWithPartners.map((item, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>{item.item_name}</TableCell>
                                        <TableCell>{item.quantity}</TableCell>
                                        <TableCell>{DonationService.formatDate(item.expiry_date)}</TableCell>
                                        <TableCell>
                                            <FormControl fullWidth size="small">
                                                <InputLabel>Select Partner</InputLabel>
                                                <Select
                                                    value={item.donation_partner || ''}
                                                    onChange={(e) => handlePartnerChange(index, e.target.value)}
                                                    label="Select Partner"
                                                >
                                                    {donationPartners.map((partner) => (
                                                        <MenuItem key={partner} value={partner}>
                                                            {partner}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            {item.notified ? (
                                                <NotifiedButton disabled startIcon={<CheckCircleIcon />}>
                                                    Notified
                                                </NotifiedButton>
                                            ) : (
                                                <NotifyButton
                                                    onClick={() => handleNotifyPartner(index)}
                                                    startIcon={<EmailIcon />}
                                                    disabled={!item.donation_partner}
                                                >
                                                    Notify Partner
                                                </NotifyButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </ModernTable>
                )}
            </StatsCard>

            {/* Analytics Section */}
            <Grid container spacing={3}>
                {/* Partner Success Rate Chart */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ 
                        p: 3, 
                        borderRadius: '8px',
                        backgroundColor: '#ffffff',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e0e0e0'
                    }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ 
                            color: '#2c3e50',
                            mb: 2 
                        }}>
                            Partner Collaboration Success Rate
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={partnerSuccessData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorGradient1" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor="#81c784" stopOpacity={0.6}/>
                                    </linearGradient>
                                    <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#66bb6a" stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor="#a5d6a7" stopOpacity={0.6}/>
                                    </linearGradient>
                                    <linearGradient id="colorGradient3" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2e7d32" stopOpacity={0.9}/>
                                        <stop offset="95%" stopColor="#66bb6a" stopOpacity={0.6}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e8f5e8" />
                                <XAxis 
                                    dataKey="name" 
                                    tick={{ fontSize: 12, fill: '#4caf50' }}
                                    axisLine={{ stroke: '#4caf50' }}
                                />
                                <YAxis 
                                    domain={[0, 100]} 
                                    tick={{ fontSize: 12, fill: '#4caf50' }}
                                    axisLine={{ stroke: '#4caf50' }}
                                />
                                <RechartsTooltip 
                                    contentStyle={{
                                        backgroundColor: '#f1f8e9',
                                        border: '1px solid #4caf50',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar 
                                    dataKey="success_rate" 
                                    fill="url(#colorGradient1)"
                                    radius={[6, 6, 0, 0]}
                                    stroke="#4caf50"
                                    strokeWidth={1}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Waste Reduction Impact */}
                <Grid item xs={12} md={6}>
                    <ClickableChart 
                        onClick={() => setAnalysisModalOpen(true)}
                        sx={{ 
                            position: 'relative', 
                            padding: 3, 
                            borderRadius: '8px',
                            backgroundColor: '#ffffff',
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e0e0e0',
                            cursor: 'pointer',
                            '&:hover': {
                                boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
                                transform: 'translateY(-2px)',
                            }
                        }}
                    >
                        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                            <IconButton sx={{ 
                                color: '#4caf50',
                                backgroundColor: '#f5f5f5',
                                '&:hover': { backgroundColor: '#e8f5e8' }
                            }}>
                                <AnalyticsIcon />
                            </IconButton>
                        </Box>
                        <Typography variant="h6" gutterBottom fontWeight="bold" sx={{ 
                            color: '#2c3e50',
                            mb: 2 
                        }}>
                            Food Waste Reduction Impact - September 2025
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={wasteReductionData}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {wasteReductionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                SDG 12: Responsible Consumption and Production
                            </Typography>
                        </Box>
                    </ClickableChart>
                </Grid>
            </Grid>

            {/* Back Button */}
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                    variant="outlined"
                    onClick={() => navigate(-1)}
                    sx={{ 
                        borderColor: '#4caf50', 
                        color: '#4caf50',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        fontWeight: 'normal',
                        '&:hover': {
                            borderColor: '#388e3c',
                            backgroundColor: 'rgba(76, 175, 80, 0.04)'
                        }
                    }}
                >
                    Back to Near Expired Items
                </Button>
            </Box>

            {/* Professional Yearly Analysis Modal */}
            <AnalysisModal
                open={analysisModalOpen}
                onClose={() => setAnalysisModalOpen(false)}
                closeAfterTransition
                BackdropComponent={Backdrop}
                BackdropProps={{
                    timeout: 500,
                }}
            >
                <Fade in={analysisModalOpen}>
                    <ModalContent>
                        <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
                            <IconButton onClick={() => setAnalysisModalOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                        
                        <Typography variant="h4" gutterBottom fontWeight="bold" sx={{ color: '#4caf50', mb: 3 }}>
                            2025 Food Waste Management Analysis
                        </Typography>
                        
                        <Grid container spacing={3}>
                            {/* Stock vs Usage Chart */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                        Weekly Stock vs Usage Pattern
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={yearlyAnalysisData.stockVsUsage}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e8f5e8" />
                                            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <RechartsTooltip 
                                                contentStyle={{
                                                    backgroundColor: '#f1f8e9',
                                                    border: '1px solid #4caf50',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Legend />
                                            <Line 
                                                type="monotone" 
                                                dataKey="stock" 
                                                stroke="#9c27b0" 
                                                strokeWidth={3}
                                                dot={{ fill: '#9c27b0', strokeWidth: 2, r: 4 }}
                                            />
                                            <Line 
                                                type="monotone" 
                                                dataKey="usage" 
                                                stroke="#4caf50" 
                                                strokeWidth={3}
                                                dot={{ fill: '#4caf50', strokeWidth: 2, r: 4 }}
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                            
                            {/* Monthly Efficiency Trends */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                        Monthly Efficiency Trends
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={yearlyAnalysisData.monthlyTrends}>
                                            <defs>
                                                <linearGradient id="efficiencyGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                                                    <stop offset="95%" stopColor="#4caf50" stopOpacity={0.1}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e8f5e8" />
                                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                            <YAxis domain={[60, 100]} tick={{ fontSize: 12 }} />
                                            <RechartsTooltip 
                                                contentStyle={{
                                                    backgroundColor: '#f1f8e9',
                                                    border: '1px solid #4caf50',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Area 
                                                type="monotone" 
                                                dataKey="efficiency" 
                                                stroke="#4caf50" 
                                                strokeWidth={3}
                                                fillOpacity={1} 
                                                fill="url(#efficiencyGradient)"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                            
                            {/* Donation vs Waste Comparison */}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                        2025 Donation vs Waste Performance (kg)
                                    </Typography>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={yearlyAnalysisData.monthlyTrends}>
                                            <defs>
                                                <linearGradient id="donatedGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#4caf50" stopOpacity={0.9}/>
                                                    <stop offset="95%" stopColor="#81c784" stopOpacity={0.6}/>
                                                </linearGradient>
                                                <linearGradient id="wastedGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#f44336" stopOpacity={0.9}/>
                                                    <stop offset="95%" stopColor="#ef5350" stopOpacity={0.6}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e8f5e8" />
                                            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                                            <YAxis tick={{ fontSize: 12 }} />
                                            <RechartsTooltip 
                                                contentStyle={{
                                                    backgroundColor: '#f1f8e9',
                                                    border: '1px solid #4caf50',
                                                    borderRadius: '8px'
                                                }}
                                            />
                                            <Legend />
                                            <Bar 
                                                dataKey="donated" 
                                                fill="url(#donatedGradient)"
                                                radius={[4, 4, 0, 0]}
                                                name="Donated (kg)"
                                            />
                                            <Bar 
                                                dataKey="wasted" 
                                                fill="url(#wastedGradient)"
                                                radius={[4, 4, 0, 0]}
                                                name="Wasted (kg)"
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Paper>
                            </Grid>
                            
                            {/* Key Insights */}
                            <Grid item xs={12}>
                                <Paper sx={{ p: 3, borderRadius: '12px', background: 'linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%)' }}>
                                    <Typography variant="h6" gutterBottom sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                        Key Performance Insights
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                                <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                                    81%
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Average Efficiency Rate
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                                <Typography variant="h3" sx={{ color: '#4caf50', fontWeight: 'bold' }}>
                                                    1,495kg
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Food Donated
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ textAlign: 'center', p: 2 }}>
                                                <Typography variant="h3" sx={{ color: '#f44336', fontWeight: 'bold' }}>
                                                    309kg
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Food Wasted
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    </ModalContent>
                </Fade>
            </AnalysisModal>
        </PageContainer>
    );
};

export default DonationPage;