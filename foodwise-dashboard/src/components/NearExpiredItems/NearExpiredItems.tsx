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
    Checkbox,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Pagination
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import ActionAnalysis from './ActionAnalysis';
import DynamicMenu from './DynamicMenu';
import DiscountSection from './DiscountSection';
import CSRReport from './CSRReport';
import { NearExpiredService, NearExpiredItem } from '../../services/nearExpiredService';
import { DynamicMenuService, DynamicMenuItem } from '../../services/dynamicMenuService';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
}));

const ProceedButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#4caf50',
    color: 'white',
    fontWeight: 'bold',
    padding: '12px 24px',
    borderRadius: '8px',
    '&:hover': {
        backgroundColor: '#45a049',
    },
}));

const DynamicMenuButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#2196f3',
    color: 'white',
    fontWeight: 'bold',
    padding: '12px 24px',
    borderRadius: '8px',
    '&:hover': {
        backgroundColor: '#1976d2',
    },
    marginRight: '12px',
}));

// Mock data for components
const actionAnalysisData = [
    { name: 'Dynamic Menu', value: 30, color: '#4DD0E1' },
    { name: 'Discount', value: 20, color: '#FF8A65' },
    { name: 'Donation', value: 30, color: '#81C784' },
    { name: 'Pre-dining Preparation', value: 20, color: '#9575CD' }
];

const csrReportData = [
    { method: 'Donation', amount: '5kg', savedVia: 'Donation' },
    { method: 'Dynamic Menu', amount: '59kg', savedVia: 'Dynamic Menu' },
    { method: 'Discount', amount: '62kg', savedVia: 'Discount' }
];

const NearExpiredItems: React.FC = () => {
    const navigate = useNavigate();
    const [nearExpiredItems, setNearExpiredItems] = useState<NearExpiredItem[]>([]);
    const [scanDate, setScanDate] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
    
    // New state for Dynamic Menu and Discount checkboxes
    const [dynamicMenuItems, setDynamicMenuItems] = useState<{ [key: string]: boolean }>({});
    const [discountItems, setDiscountItems] = useState<{ [key: string]: boolean }>({});
    
    // State for generated dynamic menu
    const [generatedMenu, setGeneratedMenu] = useState<DynamicMenuItem[]>([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const [menuError, setMenuError] = useState<string | null>(null);
    
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    useEffect(() => {
        const fetchNearExpiredItems = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const data = await NearExpiredService.getNearExpiredItems();
                setNearExpiredItems(data.items);
                setScanDate(data.scanDate);
            } catch (err) {
                console.error('Error fetching near expired items:', err);
                setError('Failed to load near expired items. Using mock data.');
                
                // Fallback to mock data if API fails
                const mockData: NearExpiredItem[] = [
                    {
                        item_id: 1,
                        item_name: 'Potato',
                        quantity: '62kg',
                        expiry_date: '2025-09-20',
                        unit: 'kg',
                        storage_location: 'Storage A',
                        supplier: 'Local Farm',
                        unit_price: 2.50,
                        total_stock: 120
                    },
                    {
                        item_id: 2,
                        item_name: 'Chicken Breast',
                        quantity: '45kg',
                        expiry_date: '2025-10-19',
                        unit: 'kg',
                        storage_location: 'Cold Storage',
                        supplier: 'Ayamas',
                        unit_price: 19.60,
                        total_stock: 87
                    },
                    {
                        item_id: 3,
                        item_name: 'Broccoli',
                        quantity: '19kg',
                        expiry_date: '2025-10-01',
                        unit: 'kg',
                        storage_location: 'Refrigerator',
                        supplier: 'Fresh Vegetables Co',
                        unit_price: 5.80,
                        total_stock: 35
                    },
                    {
                        item_id: 4,
                        item_name: 'Milk',
                        quantity: '9.8L',
                        expiry_date: '2025-09-20',
                        unit: 'L',
                        storage_location: 'Refrigerator',
                        supplier: 'Dairy Farm',
                        unit_price: 3.20,
                        total_stock: 24
                    }
                ];
                setNearExpiredItems(mockData);
                setScanDate(new Date().toISOString().split('T')[0]);
            } finally {
                setLoading(false);
            }
        };

        fetchNearExpiredItems();
    }, []);

    const handleCheckboxChange = (itemName: string) => {
        setCheckedItems(prev => ({
            ...prev,
            [itemName]: !prev[itemName]
        }));
    };

    // New handlers for Dynamic Menu and Discount checkboxes
    const handleDynamicMenuChange = (itemName: string) => {
        setDynamicMenuItems(prev => ({
            ...prev,
            [itemName]: !prev[itemName]
        }));
    };

    const handleDiscountChange = (itemName: string) => {
        setDiscountItems(prev => ({
            ...prev,
            [itemName]: !prev[itemName]
        }));
    };

    const handleGenerateDynamicMenu = async () => {
        const selectedMenuItems = Object.keys(dynamicMenuItems).filter(key => dynamicMenuItems[key]);
        
        if (selectedMenuItems.length === 0) {
            alert('Please select at least one item for Dynamic Menu generation.');
            return;
        }

        try {
            setMenuLoading(true);
            setMenuError(null);
            
            console.log('🚀 Frontend: Generating dynamic menu for items:', selectedMenuItems);
            console.log('🚀 Frontend: Selected items type:', typeof selectedMenuItems);
            console.log('🚀 Frontend: Selected items length:', selectedMenuItems.length);
            console.log('🚀 Frontend: JSON payload that will be sent:', JSON.stringify({ selectedItems: selectedMenuItems }));
            
            // Call the lambda function via DynamicMenuService
            const response = await DynamicMenuService.generateDynamicMenu(selectedMenuItems);
            
            // Update state with generated menu
            setGeneratedMenu(response.menu);
            
            // Show success message
            alert(`Dynamic Menu generated successfully! Created ${response.totalDishes} dishes using: ${selectedMenuItems.join(', ')}`);
            
        } catch (error) {
            console.error('Error generating dynamic menu:', error);
            setMenuError(error instanceof Error ? error.message : 'Failed to generate dynamic menu');
            alert('Failed to generate dynamic menu. Please try again.');
        } finally {
            setMenuLoading(false);
        }
    };

    const handleProceed = () => {
        const selectedItemNames = Object.keys(checkedItems).filter(key => checkedItems[key]);
        if (selectedItemNames.length > 0) {
            // Create selected items data with details
            const selectedItemsData = selectedItemNames.map(itemName => {
                const item = nearExpiredItems.find(item => item.item_name === itemName);
                return {
                    item_name: itemName,
                    quantity: item?.quantity || '',
                    expiry_date: item?.expiry_date || '',
                    unit: item?.unit || ''
                };
            });

            // Navigate to donation page with selected items
            navigate('/donation', { 
                state: { 
                    selectedItems: selectedItemsData 
                } 
            });
        } else {
            alert('Please select at least one item for donation.');
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(nearExpiredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = nearExpiredItems.slice(startIndex, endIndex);

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    if (loading) {
        return (
            <Box sx={{ padding: 3 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    Near Expired Items
                </Typography>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                    <CircularProgress />
                    <Typography variant="body2" sx={{ ml: 2 }}>
                        Loading near expired items...
                    </Typography>
                </Box>
            </Box>
        );
    }

    return (
        <Box sx={{ padding: 3 }}>
            {/* Header with title and donation portal button */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                    Near Expired Items - Donation Friendly
                </Typography>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/donation')}
                    sx={{
                        borderColor: '#4caf50',
                        color: '#4caf50',
                        fontWeight: 'bold',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        '&:hover': {
                            borderColor: '#388e3c',
                            backgroundColor: 'rgba(76, 175, 80, 0.04)',
                            transform: 'translateX(4px)',
                        },
                        transition: 'all 0.3s ease'
                    }}
                    endIcon={<span>→</span>}
                >
                    Donation Management Portal
                </Button>
            </Box>
            
            {scanDate && (
                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                    Last scanned: {NearExpiredService.formatScanDate(scanDate)} | 
                    Showing {Math.min(startIndex + 1, nearExpiredItems.length)}-{Math.min(endIndex, nearExpiredItems.length)} of {nearExpiredItems.length} items
                </Typography>
            )}
            
            {error && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            
            {/* Items Table */}
            <StyledPaper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Item</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Expiry Date</TableCell>
                                <TableCell>Scan Date</TableCell>
                                <TableCell>Dynamic Menu</TableCell>
                                <TableCell>Discount</TableCell>
                                <TableCell>Donation</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {currentItems.map((item, index) => (
                                <TableRow key={item.item_id || index}>
                                    <TableCell>{item.item_name}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{NearExpiredService.formatExpiryDate(item.expiry_date)}</TableCell>
                                    <TableCell>{NearExpiredService.formatScanDate(scanDate)}</TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={dynamicMenuItems[item.item_name] || false}
                                            onChange={() => handleDynamicMenuChange(item.item_name)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={discountItems[item.item_name] || false}
                                            onChange={() => handleDiscountChange(item.item_name)}
                                            color="primary"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={checkedItems[item.item_name] || false}
                                            onChange={() => handleCheckboxChange(item.item_name)}
                                            color="primary"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={currentPage}
                            onChange={handlePageChange}
                            color="primary"
                            size="medium"
                            showFirstButton
                            showLastButton
                        />
                    </Box>
                )}
                
                {/* Action Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <DynamicMenuButton 
                        onClick={handleGenerateDynamicMenu}
                        variant="contained"
                        disabled={menuLoading}
                        startIcon={menuLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {menuLoading ? 'Generating Menu...' : 'Generate Dynamic Menu'}
                    </DynamicMenuButton>
                    <ProceedButton 
                        onClick={handleProceed}
                        variant="contained"
                    >
                        Proceed
                    </ProceedButton>
                </Box>
            </StyledPaper>

            {/* Action Analysis and CSR Report */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                    <ActionAnalysis data={actionAnalysisData} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CSRReport data={csrReportData} />
                </Grid>
            </Grid>

            {/* Dynamic Menu and Discount Sections */}
            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                    <DynamicMenu items={generatedMenu.length > 0 ? generatedMenu : undefined} />
                    {menuError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {menuError}
                        </Alert>
                    )}
                </Grid>
                <Grid item xs={12} md={6}>
                    <DiscountSection />
                </Grid>
            </Grid>
        </Box>
    );
};

export default NearExpiredItems;