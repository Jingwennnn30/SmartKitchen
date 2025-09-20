import React, { useState } from 'react';
import {
    Box,
    Typography,
    Paper,
    TextField,
    MenuItem,
    Button,
    FormControl,
    InputLabel,
    Select,
    SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface DonationSectionProps {
    items: string[];  // List of items available for donation
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    marginTop: theme.spacing(3)
}));

const FormField = styled(Box)(({ theme }) => ({
    marginBottom: theme.spacing(2)
}));

// Mock list of organizations that accept donations
const ORGANIZATIONS = [
    'Food Bank Foundation',
    'Local Community Center',
    'Homeless Shelter',
    'Soup Kitchen',
    'Food Aid Foundation',
    'Religious Centers'
];

const DonationSection: React.FC<DonationSectionProps> = ({ items }) => {
    const [selectedOrg, setSelectedOrg] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [notes, setNotes] = useState('');

    const handleOrgChange = (event: SelectChangeEvent) => {
        setSelectedOrg(event.target.value);
    };

    const handleItemChange = (event: SelectChangeEvent) => {
        setSelectedItem(event.target.value);
    };

    const handleSubmit = () => {
        console.log({
            organization: selectedOrg,
            item: selectedItem,
            quantity,
            notes
        });
        // Here you would typically make an API call to process the donation
    };

    return (
        <StyledPaper>
            <Typography variant="h6" gutterBottom>
                Donation Details
            </Typography>
            <Box component="form">
                <FormField>
                    <FormControl fullWidth>
                        <InputLabel id="org-select-label">Donate To</InputLabel>
                        <Select
                            labelId="org-select-label"
                            value={selectedOrg}
                            label="Donate To"
                            onChange={handleOrgChange}
                        >
                            {ORGANIZATIONS.map((org) => (
                                <MenuItem key={org} value={org}>
                                    {org}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </FormField>

                <FormField>
                    <FormControl fullWidth>
                        <InputLabel id="item-select-label">Item to Donate</InputLabel>
                        <Select
                            labelId="item-select-label"
                            value={selectedItem}
                            label="Item to Donate"
                            onChange={handleItemChange}
                        >
                            {items.map((item) => (
                                <MenuItem key={item} value={item}>
                                    {item}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </FormField>

                <FormField>
                    <TextField
                        fullWidth
                        label="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Enter quantity (e.g., 5kg, 3L)"
                    />
                </FormField>

                <FormField>
                    <TextField
                        fullWidth
                        label="Additional Notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        multiline
                        rows={3}
                        placeholder="Add any special handling instructions or notes"
                    />
                </FormField>

                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={handleSubmit}
                    disabled={!selectedOrg || !selectedItem || !quantity}
                >
                    Confirm Donation
                </Button>
            </Box>
        </StyledPaper>
    );
};

export default DonationSection;