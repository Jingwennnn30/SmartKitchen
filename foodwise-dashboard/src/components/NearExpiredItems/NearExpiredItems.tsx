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
    Skeleton,
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
import { DiscountService, DiscountItem } from '../../services/discountService';

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

const SuggestedDiscountButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#ff9800',
    color: 'white',
    fontWeight: 'bold',
    padding: '12px 24px',
    borderRadius: '8px',
    '&:hover': {
        backgroundColor: '#f57c00',
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

    const [dynamicMenuItems, setDynamicMenuItems] = useState<{ [key: string]: boolean }>({});
    const [generatedMenu, setGeneratedMenu] = useState<DynamicMenuItem[]>([]);
    const [menuLoading, setMenuLoading] = useState(false);
    const [menuError, setMenuError] = useState<string | null>(null);

    const [suggestedDiscounts, setSuggestedDiscounts] = useState<DiscountItem[]>([]);
    const [discountLoading, setDiscountLoading] = useState(false);
    const [discountError, setDiscountError] = useState<string | null>(null);

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

    const handleDynamicMenuChange = (itemName: string) => {
        setDynamicMenuItems(prev => ({
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
            const response = await DynamicMenuService.generateDynamicMenu(selectedMenuItems);
            setGeneratedMenu(response.menu);
            alert(`Dynamic Menu generated successfully! Created ${response.totalDishes} dishes using: ${selectedMenuItems.join(', ')}`);
        } catch (error) {
            console.error('Error generating dynamic menu:', error);
            setMenuError(error instanceof Error ? error.message : 'Failed to generate dynamic menu');
            alert('Failed to generate dynamic menu. Please try again.');
        } finally {
            setMenuLoading(false);
        }
    };

    const handleViewSuggestedDiscount = async () => {
        try {
            setDiscountLoading(true);
            setDiscountError(null);
            const response = await DiscountService.generateSuggestedDiscounts(nearExpiredItems);
            setSuggestedDiscounts(response);
            alert(`Generated ${response.length} AI-powered discount suggestions!`);
        } catch (error) {
            console.error('Error generating suggested discounts:', error);
            setDiscountError(error instanceof Error ? error.message : 'Failed to generate suggested discounts');
            alert('Failed to generate suggested discounts. Please try again.');
        } finally {
            setDiscountLoading(false);
        }
    };

    const handleProceed = () => {
        const selectedItemNames = Object.keys(checkedItems).filter(key => checkedItems[key]);
        if (selectedItemNames.length > 0) {
            const selectedItemsData = selectedItemNames.map(itemName => {
                const item = nearExpiredItems.find(item => item.item_name === itemName);
                return {
                    item_name: itemName,
                    quantity: item?.quantity || '',
                    expiry_date: item?.expiry_date || '',
                    unit: item?.unit || ''
                };
            });

            navigate('/donation', { state: { selectedItems: selectedItemsData } });
        } else {
            alert('Please select at least one item for donation.');
        }
    };

    const totalPages = Math.ceil(nearExpiredItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = nearExpiredItems.slice(startIndex, endIndex);

    const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
        setCurrentPage(page);
    };

    return (
        <Box sx={{ padding: 3 }}>
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
                                <TableCell>Donation</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (Array.from(new Array(5)).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton variant="text" width={120} /></TableCell>
                                    <TableCell><Skeleton variant="text" width={40} /></TableCell>
                                    <TableCell><Skeleton variant="rectangular" width={180} height={24} /></TableCell>
                                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                                    <TableCell align="center"><Skeleton variant="rounded" width={80} height={24} /></TableCell>
                                    <TableCell align="center"><Skeleton variant="circular" width={24} height={24} /></TableCell>
                                </TableRow>
                            ))
                            ) : currentItems.length > 0 ? (
                                currentItems.map((item, index) => (
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
                                                checked={checkedItems[item.item_name] || false}
                                                onChange={() => handleCheckboxChange(item.item_name)}
                                                color="primary"
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography variant="body2" color="text.secondary" py={3}>
                                            No near expired items found.
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

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
                            disabled={loading}
                        />
                    </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                    <DynamicMenuButton
                        onClick={handleGenerateDynamicMenu}
                        variant="contained"
                        disabled={menuLoading}
                        startIcon={menuLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {menuLoading ? 'Generating Menu...' : 'Generate Dynamic Menu'}
                    </DynamicMenuButton>
                    <SuggestedDiscountButton
                        onClick={handleViewSuggestedDiscount}
                        variant="contained"
                        disabled={discountLoading}
                        startIcon={discountLoading ? <CircularProgress size={20} color="inherit" /> : null}
                    >
                        {discountLoading ? 'Generating Discounts...' : 'View Suggested Discount'}
                    </SuggestedDiscountButton>
                    <ProceedButton
                        onClick={handleProceed}
                        variant="contained"
                    >
                        Proceed
                    </ProceedButton>
                </Box>
            </StyledPaper>

            <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                    <ActionAnalysis data={actionAnalysisData} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <CSRReport data={csrReportData} />
                </Grid>
            </Grid>

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
                    <DiscountSection items={suggestedDiscounts.length > 0 ? suggestedDiscounts : undefined} />
                    {discountError && (
                        <Alert severity="error" sx={{ mt: 2 }}>
                            {discountError}
                        </Alert>
                    )}
                </Grid>
            </Grid>
        </Box>
    );
};

export default NearExpiredItems;
