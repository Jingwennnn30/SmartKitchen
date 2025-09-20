import React from 'react';
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
    Select,
    MenuItem,
    FormControl,
    SelectChangeEvent,
    Grid
} from '@mui/material';
import { styled } from '@mui/material/styles';
import ActionAnalysis from './ActionAnalysis';
import DynamicMenu from './DynamicMenu';
import DiscountSection from './DiscountSection';
import CSRReport from './CSRReport';
import DonationSection from './DonationSection';

interface ExpiredItem {
    item: string;
    quantity: string;
    expiryDate: string;
    suggestedAction: string;
}

const items: ExpiredItem[] = [
    { item: 'Potato', quantity: '62kg', expiryDate: 'Sep 20, 2025', suggestedAction: 'Discount' },
    { item: 'Chicken Breast', quantity: '45kg', expiryDate: 'Oct 19, 2025', suggestedAction: 'Dynamic Menu' },
    { item: 'Broccoli', quantity: '19kg', expiryDate: 'Oct 1, 2025', suggestedAction: 'Dynamic Menu' },
    { item: 'Milk', quantity: '9.8L', expiryDate: 'Sep 20, 2025', suggestedAction: 'Donate' },
];

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
}));

const ActionSelect = styled(Select)(({ theme }) => ({
    '& .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.grey[300],
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.grey[400],
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.primary.main,
    },
    '& .MuiSelect-select': {
        padding: '8px 14px',
    },
}));

// Mock data for components
const actionAnalysisData = [
    { name: 'Dynamic Menu', value: 30, color: '#4DD0E1' },
    { name: 'Discount', value: 20, color: '#FF8A65' },
    { name: 'Donation', value: 30, color: '#81C784' },
    { name: 'Pre-dining Preparation', value: 20, color: '#9575CD' }
];

const dynamicMenuItems = [
    {
        name: 'Chicken & Broccoli Pasta',
        ingredients: ['chicken', 'broccoli', 'pasta'],
        suggestedPrice: 15.9
    },
    {
        name: 'Chicken Broccoli Pizza',
        ingredients: ['chicken', 'broccoli', 'white sauce'],
        suggestedPrice: 15.9
    }
];

const discountItems = [
    {
        name: 'Potato',
        suggestedDiscount: 'Suggested Discount: BFF1 Fries',
        time: 'Whole Day'
    },
    {
        name: 'Potato',
        suggestedDiscount: 'Apply 30% for potato dish',
        time: 'Whole Day'
    }
];

const csrReportData = [
    { method: 'Donation', amount: '5kg', savedVia: 'Donation' },
    { method: 'Dynamic Menu', amount: '59kg', savedVia: 'Dynamic Menu' },
    { method: 'Discount', amount: '62kg', savedVia: 'Discount' }
];

const NearExpiredItems: React.FC = () => {
    const [selectedActions, setSelectedActions] = React.useState<{ [key: string]: string }>({});
    const [selectedItem, setSelectedItem] = React.useState<ExpiredItem | null>(null);

    const handleActionChange = (event: SelectChangeEvent<string>, item: ExpiredItem) => {
        const newValue = event.target.value;
        setSelectedActions(prev => ({
            ...prev,
            [item.item]: newValue
        }));
        if (newValue === 'donate') {
            setSelectedItem(item);
        } else if (selectedItem?.item === item.item) {
            setSelectedItem(null);
        }
    };

    return (
        <Box sx={{ padding: 3 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
                Near Expired Items
            </Typography>
            
            {/* Items Table */}
            <StyledPaper>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Item</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Expiry Date</TableCell>
                                <TableCell>Suggested Action</TableCell>
                                <TableCell>Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell>{item.item}</TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell>{item.expiryDate}</TableCell>
                                    <TableCell>{item.suggestedAction}</TableCell>
                                    <TableCell>
                                        <FormControl size="small" sx={{ minWidth: 120 }}>
                                            <ActionSelect
                                                value={selectedActions[item.item] || ""}
                                                onChange={(e) => handleActionChange(e as SelectChangeEvent<string>, item)}
                                                displayEmpty
                                            >
                                                <MenuItem value="" disabled>Select Action</MenuItem>
                                                <MenuItem value="donate">Donate</MenuItem>
                                                <MenuItem value="dynamic-menu">Dynamic Menu</MenuItem>
                                                <MenuItem value="discount">Discount</MenuItem>
                                            </ActionSelect>
                                        </FormControl>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
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
                    <DynamicMenu items={dynamicMenuItems} />
                </Grid>
                <Grid item xs={12} md={6}>
                    <DiscountSection items={discountItems} />
                </Grid>
            </Grid>

            {/* Donation Section - Only shown when an item is marked for donation */}
            {selectedItem && selectedActions[selectedItem.item] === 'donate' && (
                <Grid container sx={{ mt: 1 }}>
                    <Grid item xs={12}>
                        <DonationSection 
                            items={[selectedItem.item]}
                        />
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};

export default NearExpiredItems;