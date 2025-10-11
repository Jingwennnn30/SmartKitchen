import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Button,
  Box,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';

interface StockItem {
  id: string;
  item: string;
  quantity: string;
  unit: string;
  expiryDate: string;
  status: 'Good' | 'Running Soon' | 'Expired';
  location: string;
}

interface InventoryTableProps {
  searchQuery?: string;
}

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  maxHeight: '60vh',
  width: '100%',
  overflow: 'auto',
  border: '1px solid #e0e0e0',
  borderRadius: '8px',
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: '#f1f1f1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb': {
    background: '#c1c1c1',
    borderRadius: '10px',
  },
  '&::-webkit-scrollbar-thumb:hover': {
    background: '#a8a8a8',
  },
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  '& .MuiTableCell-head': {
    fontWeight: 'bold',
    fontSize: '0.95rem',
    color: '#333',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: '#fafafa',
  },
  '&:hover': {
    backgroundColor: '#f0f0f0',
  },
}));

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Good':
      return 'success';
    case 'Running Soon':
      return 'warning';
    case 'Expired':
      return 'error';
    default:
      return 'default';
  }
};

const InventoryTable: React.FC<InventoryTableProps> = ({ searchQuery = '' }) => {
  const [stockData, setStockData] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [internalSearchQuery, setInternalSearchQuery] = useState<string>('');
  
  // Use external searchQuery if provided, otherwise use internal state
  const activeSearchQuery = searchQuery || internalSearchQuery;

  const fetchStockData = async () => {
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4000';
      const response = await fetch(`${backendUrl}/api/stock`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setStockData(data);
      } else if (data && Array.isArray(data.data)) {
        // Handle case where response is wrapped in an object
        setStockData(data.data);
      } else if (data && Array.isArray(data.items)) {
        // Handle another possible structure
        setStockData(data.items);
      } else {
        console.error('Unexpected data format:', data);
        setStockData([]);
        setError('Received unexpected data format from server');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setStockData([]); // Ensure stockData is always an array
      setError('Failed to fetch stock data. Please ensure the backend server is running.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
    // Auto-refresh every 10 seconds to get real-time updates
    const interval = setInterval(fetchStockData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Get unique locations for filter buttons
  const locations = ['All', ...Array.from(new Set((stockData || []).map(item => item.location)))];
  const locationCounts = locations.reduce((acc, location) => {
    if (location === 'All') {
      acc[location] = (stockData || []).length;
    } else {
      acc[location] = (stockData || []).filter(item => item.location === location).length;
    }
    return acc;
  }, {} as Record<string, number>);

  // Filter data based on selected location and search query
  const filteredData = (stockData || []).filter(item => {
    const matchesLocation = selectedLocation === 'All' || item.location === selectedLocation;
    const matchesSearch = activeSearchQuery === '' || 
      item.item.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(activeSearchQuery.toLowerCase()) ||
      item.status.toLowerCase().includes(activeSearchQuery.toLowerCase());
    
    return matchesLocation && matchesSearch;
  });

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress />
        <Typography>Loading stock data from AWS DynamoDB...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error" gutterBottom>{error}</Typography>
        <Button variant="outlined" onClick={fetchStockData}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', minWidth: 0 }}>
      {/* Header with title and search */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h6" sx={{ flex: 1, minWidth: 0 }}>
          Current Stock ({filteredData.length} items)
        </Typography>
        
        {/* Show search field only if no external searchQuery is provided */}
        {!searchQuery && (
          <TextField
            size="small"
            placeholder="Search inventory..."
            value={internalSearchQuery}
            onChange={(e) => setInternalSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: { xs: '100%', sm: 250 }, 
              maxWidth: 250,
              flexShrink: 0
            }}
          />
        )}
      </Box>

      {/* Location filter buttons */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
        Filter by Location:
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 1, 
        mb: 2,
        width: '100%',
        maxWidth: '100%'
      }}>
        {locations.map((location) => (
          <Button
            key={location}
            size="small"
            variant={selectedLocation === location ? 'contained' : 'outlined'}
            onClick={() => setSelectedLocation(location)}
            sx={{ 
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            {location.toUpperCase()} ({locationCounts[location]})
          </Button>
        ))}
      </Box>

      {/* Table */}
      <StyledTableContainer>
        <Paper>
          <Table stickyHeader sx={{ width: '100%' }}>
            <StyledTableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Item</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Quantity</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Expiry Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Location</TableCell>
              </TableRow>
            </StyledTableHead>
            <TableBody>
              {filteredData.map((item, index) => (
                <StyledTableRow key={`${item.id}-${index}`}>
                  <TableCell>{item.item}</TableCell>
                  <TableCell>{item.quantity} {item.unit}</TableCell>
                  <TableCell>{item.expiryDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </StyledTableContainer>

      {/* Real-time update indicator */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        Data refreshes automatically every 10 seconds from AWS DynamoDB
      </Typography>
    </Box>
  );
};

export default InventoryTable;