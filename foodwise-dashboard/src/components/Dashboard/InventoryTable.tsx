import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    ChipProps
} from '@mui/material';
import { styled } from '@mui/material/styles';

// Define the interface for inventory items
interface InventoryItem {
    item: string;
    quantity: string;
    expiryDate: string;
    status: 'Good' | 'Expired' | 'Running Soon';
    location: string;
}

// Define props interface for StatusChip
interface StatusChipProps extends ChipProps {
    status: 'Good' | 'Expired' | 'Running Soon';
}

// Style the TableContainer without using component prop
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    marginTop: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'white'
}));

// Style the StatusChip with proper TypeScript support
const StatusChip = styled(Chip, {
    shouldForwardProp: (prop) => prop !== 'status'
})<StatusChipProps>(({ status, theme }) => ({
    backgroundColor:
        status === 'Good' ? '#E8F5E9' :
        status === 'Expired' ? '#FFEBEE' :
        '#FFF3E0',
    color:
        status === 'Good' ? '#2E7D32' :
        status === 'Expired' ? '#C62828' :
        '#EF6C00',
}));

const data: InventoryItem[] = [
    { item: 'Milk', quantity: '15L', expiryDate: 'Sep 19, 2025', status: 'Expired', location: 'Fridge F1' },
    { item: 'Chicken Breast', quantity: '25kg', expiryDate: 'Oct 15, 2025', status: 'Good', location: 'Freezer F3' },
    { item: 'Beef', quantity: '18kg', expiryDate: 'Oct 10, 2025', status: 'Good', location: 'Freezer F3' },
    { item: 'Potato', quantity: '30kg', expiryDate: 'Sep 25, 2025', status: 'Running Soon', location: 'Rack R1' },
    { item: 'Broccoli', quantity: '35kg', expiryDate: 'Oct 1, 2025', status: 'Good', location: 'Fridge F2' },
    { item: 'Olive Oil', quantity: '50L', expiryDate: 'Nov 30, 2025', status: 'Good', location: 'Rack R1' },
];

const InventoryTable: React.FC = () => {
    return (
        <Paper elevation={0}>
            <StyledTableContainer>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Expiry Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Location</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={index}>
                                <TableCell>{row.item}</TableCell>
                                <TableCell>{row.quantity}</TableCell>
                                <TableCell>{row.expiryDate}</TableCell>
                                <TableCell>
                                    <StatusChip
                                        label={row.status}
                                        status={row.status}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{row.location}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </StyledTableContainer>
        </Paper>
    );
};

export default InventoryTable;