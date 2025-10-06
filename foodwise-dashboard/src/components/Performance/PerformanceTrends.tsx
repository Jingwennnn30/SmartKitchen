import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    styled,
    Card,
    CardContent,
    Chip,
    Divider,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    Rectangle,
} from 'recharts';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import { teal, orange, blue, red } from '@mui/material/colors';
import { fetchPerformanceData, PerformanceResponse } from '../../services/performanceService';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    height: '100%',
    transition: 'all 0.2s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    }
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    padding: theme.spacing(3),
    color: '#1f2937',
    marginBottom: theme.spacing(3),
    border: '1px solid #e5e7eb',
}));

const MetricCard = styled(Card)(({ theme }) => ({
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    transition: 'all 0.2s ease',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transform: 'translateY(-2px)',
    }
}));

// Staff Efficiency Score calculation (keeping this as mock for now since it's not in your API)
const staffEfficiency = {
    score: 87,
    total: 100,
    trend: '+2.5%'
};

const PerformanceTrends: React.FC = () => {
    // Real data state
    const [data, setData] = useState<PerformanceResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedRange, setSelectedRange] = useState({
        startDate: "3/9/2025",
        endDate: "6/9/2025",
    });
    
    // UI state
    const [selectedDates, setSelectedDates] = useState<string[]>([]); // Start with no selection
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(9); // Start with September
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [orderDetails, setOrderDetails] = useState<any[]>([]);

    const handleExportPDF = () => {
        // PDF export logic would go here
        console.log('Exporting to PDF...');
    };

    // Load performance data from API
    const loadPerformanceData = async () => {
        try {
            setLoading(true);
            console.log('Loading data for range:', selectedRange);
            const result = await fetchPerformanceData(selectedRange.startDate, selectedRange.endDate);
            console.log('API Response:', result);
            setData(result);
        } catch (err) {
            console.error("Error fetching performance data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPerformanceData();
    }, [selectedRange.startDate, selectedRange.endDate]);
    
    // Load data initially - start with showing all available data
    useEffect(() => {
        // Load initial data without selecting specific dates
        loadPerformanceData();
    }, []);
    
    // Generate calendar days for current month
    const getCurrentMonthDays = () => {
        const year = 2025;
        const daysInMonth = new Date(year, currentMonth, 0).getDate();
        const firstDay = new Date(year, currentMonth - 1, 1).getDay();
        
        const days = [];
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(null);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const isAfterHackathon = currentMonth === 10 && day > 12; // Disable dates after Oct 12
            const isSelected = selectedDates.includes(date);
            const isStartDate = date === startDate;
            const isEndDate = date === endDate;
            const isInRange = selectedDates.includes(date) && !isStartDate && !isEndDate;
            
            // Determine if date is selectable based on current selection state
            let isSelectable = !isAfterHackathon;
            if (startDate && !endDate && !isStartDate) {
                // If we have a start date but no end date, only allow dates after start date
                const currentDate = new Date(date);
                const startDateObj = new Date(startDate);
                isSelectable = currentDate >= startDateObj && !isAfterHackathon;
            }
            
            days.push({
                day,
                date,
                isToday: date === '2025-10-06',
                isSelected,
                isStartDate,
                isEndDate,
                isInRange,
                isDisabled: isAfterHackathon,
                isSelectable
            });
        }
        
        return days;
    };

    const handleDateSelection = (date: string) => {
        // If clicking on the same start date, unselect everything
        if (startDate === date && !endDate) {
            setStartDate(null);
            setEndDate(null);
            setSelectedDates([]);
            // Reset to default range
            setSelectedRange({
                startDate: "3/9/2025",
                endDate: "6/9/2025",
            });
            return;
        }
        
        // If clicking on the same end date, reset to just start date
        if (endDate === date && startDate) {
            setEndDate(null);
            setSelectedDates([startDate]);
            
            // Update API for single date
            const dateObj = new Date(startDate);
            const apiDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
            setSelectedRange({
                startDate: apiDate,
                endDate: apiDate
            });
            return;
        }
        
        if (!startDate || (startDate && endDate)) {
            // First click or reset selection - set as start date
            setStartDate(date);
            setEndDate(null);
            setSelectedDates([date]);
            
            // Update API for single date
            const dateObj = new Date(date);
            const apiDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
            setSelectedRange({
                startDate: apiDate,
                endDate: apiDate
            });
        } else if (startDate && !endDate) {
            // Second click - validate that end date is after start date
            const start = new Date(startDate);
            const end = new Date(date);
            
            if (end < start) {
                // If end date is before start date, show error or ignore
                // For now, we'll ignore clicks on dates before the start date
                return;
            } else if (end.getTime() === start.getTime()) {
                // If same date, unselect
                setStartDate(null);
                setEndDate(null);
                setSelectedDates([]);
            } else {
                // Valid end date - create range
                setEndDate(date);
                const dateRange = getDateRange(startDate, date);
                setSelectedDates(dateRange);
                
                // Update API date range when user selects dates
                const startDateObj = new Date(startDate);
                const endDateObj = new Date(date);
                const apiStartDate = `${startDateObj.getDate()}/${startDateObj.getMonth() + 1}/${startDateObj.getFullYear()}`;
                const apiEndDate = `${endDateObj.getDate()}/${endDateObj.getMonth() + 1}/${endDateObj.getFullYear()}`;
                
                setSelectedRange({
                    startDate: apiStartDate,
                    endDate: apiEndDate
                });
            }
        }
    };

    const getDateRange = (start: string, end: string): string[] => {
        const dates = [];
        const startDate = new Date(start);
        const endDate = new Date(end);
        
        for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
            const dateStr = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
            dates.push(dateStr);
        }
        
        return dates;
    };

    const handleViewOrderDetails = (date: string) => {
        setSelectedTimeSlot(date);
        // Filter items from the API data for the selected date
        const dayItems = data?.items?.filter(item => item.date === date) || [];
        setOrderDetails(dayItems);
        setDialogOpen(true);
    };

    // Get daily breakdown data from API
    const dailyBreakdown = data?.daily_breakdown || {};
    const apiSummary = data?.summary;
    
    // Convert daily breakdown to array format for table display
    const allDailyData = Object.entries(dailyBreakdown).map(([date, stats]) => {
        // Parse date to determine if it's weekend/special event
        const [day, month, year] = date.split('/');
        const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
        
        // Find if this date has special events from the raw items
        const dayItems = data?.items?.filter(item => item.date === date) || [];
        const isSpecialEvent = dayItems.some(item => item.is_special_event === "TRUE" || item.is_special_event === true);
        const isHoliday = dayItems.some(item => item.is_holiday === "TRUE" || item.is_holiday === true);
        
        return {
            date,
            totalOrders: stats.orders,
            totalRevenue: parseFloat(stats.revenue.toFixed(2)),
            isWeekend,
            isHoliday,
            isSpecialEvent,
            status: stats.orders >= 600 ? 'high' : stats.orders >= 400 ? 'medium' : 'low'
        };
    });

    // Filter data based on selected dates
    const dailyData = allDailyData.filter(row => {
        // If no dates are selected, show all data
        if (selectedDates.length === 0) {
            return true;
        }
        
        // Convert date (format: "5/9/2025") to match selectedDates format ("2025-09-05")
        const [day, month, year] = row.date.split('/');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        const isIncluded = selectedDates.includes(formattedDate);
        console.log(`Checking date: ${row.date} -> ${formattedDate}, selected dates:`, selectedDates, 'included:', isIncluded);
        return isIncluded;
    });

    // Calculate summary from filtered data (this will match the table)
    const summary = {
        total_orders: dailyData.reduce((sum, day) => sum + day.totalOrders, 0),
        total_revenue: dailyData.reduce((sum, day) => sum + day.totalRevenue, 0),
        avg_table_size: apiSummary?.avg_table_size || 0 // Keep the original avg table size
    };

    // Mock data for Inventory Usage Trends (for the chart)
    const inventoryTrends = Array.from({ length: 14 }, (_, index) => ({
        date: (index + 1) + '/9',
        stock: Math.floor(Math.random() * 200 + 300),
        usage: Math.floor(Math.random() * 150 + 200)
    }));

    // Debug logging
    console.log('Selected dates:', selectedDates);
    console.log('All daily data:', allDailyData);
    console.log('Filtered daily data:', dailyData);
    console.log('Calculated summary:', summary);
    console.log('API summary:', apiSummary);

    return (
        <Box sx={{ 
            padding: 3, 
            backgroundColor: '#f8fafc', 
            minHeight: '100vh'
        }}>
            <HeaderBox>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AnalyticsIcon sx={{ fontSize: 32, color: '#3b82f6' }} />
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 0.5, color: '#1f2937' }}>
                                Performance Analytics
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Real-time insights from Lambda API • {summary ? `${summary.total_orders} orders • RM ${summary.total_revenue.toLocaleString()} revenue` : 'Loading...'}
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<FileDownloadIcon />}
                        onClick={handleExportPDF}
                        sx={{
                            bgcolor: '#3b82f6',
                            '&:hover': {
                                bgcolor: '#2563eb',
                            }
                        }}
                    >
                        Export Report
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    <Chip 
                        icon={<TrendingUpIcon sx={{ fontSize: 16 }} />}
                        label="Live Data" 
                        size="small" 
                        sx={{ bgcolor: '#dbeafe', color: '#1e40af' }} 
                    />
                    <Chip 
                        label="Updated 2 min ago" 
                        size="small" 
                        sx={{ bgcolor: '#f3f4f6', color: '#6b7280' }} 
                    />
                    <Chip 
                        icon={<RestaurantIcon sx={{ fontSize: 16 }} />}
                        label="SmartKitchen Pro" 
                        size="small" 
                        sx={{ bgcolor: '#ecfdf5', color: '#059669' }} 
                    />
                </Box>
            </HeaderBox>

            {/* Summary Cards */}
            {summary && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={4}>
                        <StyledPaper>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Total Orders
                                </Typography>
                                <Typography variant="h4" sx={{ color: blue[600], fontWeight: 'bold' }}>
                                    {summary.total_orders}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    orders processed
                                </Typography>
                            </Box>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StyledPaper>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Total Revenue
                                </Typography>
                                <Typography variant="h4" sx={{ color: teal[600], fontWeight: 'bold' }}>
                                    RM {summary.total_revenue.toLocaleString()}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    revenue generated
                                </Typography>
                            </Box>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <StyledPaper>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    Avg Table Size
                                </Typography>
                                <Typography variant="h4" sx={{ color: orange[600], fontWeight: 'bold' }}>
                                    {summary.avg_table_size.toFixed(1)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    people per table
                                </Typography>
                            </Box>
                        </StyledPaper>
                    </Grid>
                </Grid>
            )}

            <Grid container spacing={3}>

                {/* Historical Order Patterns */}
                <Grid item xs={12}>
                    <StyledPaper>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 0.5 }}>
                                    Historical Order Patterns
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <AnalyticsIcon sx={{ fontSize: 16 }} />
                                    {selectedDates.length === 0 ? `Daily analysis for all available dates (${selectedRange.startDate} - ${selectedRange.endDate})` : 
                                     selectedDates.length === 1 ? `Analysis for ${new Date(selectedDates[0]).toLocaleDateString()}` :
                                     startDate && endDate ? `Date range: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}` :
                                     `Analysis for ${selectedDates.length} selected dates`}
                                </Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={3}>
                            {/* Calendar Date Selector */}
                            <Grid item xs={12} md={3}>
                                <Box sx={{ 
                                    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                                    borderRadius: '16px', 
                                    p: 3,
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarTodayIcon sx={{ fontSize: 20, color: '#3b82f6' }} />
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                                                Select Dates
                                            </Typography>
                                        </Box>
                                        {selectedDates.length > 0 && (
                                            <Button
                                                size="small"
                                                onClick={() => {
                                                    setSelectedDates([]);
                                                    setStartDate(null);
                                                    setEndDate(null);
                                                    // Reset to default range
                                                    setSelectedRange({
                                                        startDate: "3/9/2025",
                                                        endDate: "6/9/2025",
                                                    });
                                                }}
                                                sx={{
                                                    color: '#dc2626',
                                                    fontSize: '0.75rem',
                                                    textTransform: 'none',
                                                    minWidth: 'auto',
                                                    p: 0.5,
                                                    '&:hover': {
                                                        bgcolor: '#fee2e2'
                                                    }
                                                }}
                                            >
                                                Clear ({selectedDates.length})
                                            </Button>
                                        )}
                                    </Box>
                                    
                                    {/* Instructions */}
                                    <Box sx={{ mb: 2, p: 2, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                                        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 1 }}>
                                            📅 How to select dates:
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', fontSize: '0.7rem' }}>
                                            • Click a date to select start date
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', fontSize: '0.7rem' }}>
                                            • Click another date after start to create range
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', fontSize: '0.7rem' }}>
                                            • Click same date again to unselect
                                        </Typography>
                                        {startDate && !endDate && (
                                            <Typography variant="caption" sx={{ color: '#059669', display: 'block', fontSize: '0.7rem', fontWeight: 'bold', mt: 1 }}>
                                                ✓ Start: {new Date(startDate).toLocaleDateString()} - Select end date
                                            </Typography>
                                        )}
                                    </Box>
                                    
                                    {/* Calendar Month Display */}
                                    <Box sx={{ 
                                        bgcolor: 'white', 
                                        borderRadius: '12px', 
                                        p: 2,
                                        border: '1px solid #e5e7eb',
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                                    }}>
                                        {/* Month Header with Navigation */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            mb: 2,
                                            p: 1,
                                            bgcolor: '#f8fafc',
                                            borderRadius: '8px'
                                        }}>
                                            <IconButton 
                                                size="small"
                                                onClick={() => setCurrentMonth(currentMonth === 10 ? 9 : 10)}
                                                sx={{ 
                                                    color: '#6b7280',
                                                    '&:hover': { bgcolor: '#e5e7eb' }
                                                }}
                                            >
                                                <Box sx={{ 
                                                    transform: 'rotate(180deg)',
                                                    display: 'flex',
                                                    alignItems: 'center'
                                                }}>
                                                    ▶
                                                </Box>
                                            </IconButton>
                                            <Typography variant="subtitle1" sx={{ 
                                                fontWeight: 'bold', 
                                                color: '#1f2937',
                                                fontSize: '1rem'
                                            }}>
                                                {currentMonth === 10 ? 'October' : 'September'} 2025
                                            </Typography>
                                            <IconButton 
                                                size="small"
                                                onClick={() => setCurrentMonth(currentMonth === 10 ? 9 : 10)}
                                                sx={{ 
                                                    color: '#6b7280',
                                                    '&:hover': { bgcolor: '#e5e7eb' }
                                                }}
                                            >
                                                ▶
                                            </IconButton>
                                        </Box>
                                        
                                        {/* Weekday headers */}
                                        <Box sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(7, 1fr)', 
                                            gap: 1,
                                            mb: 1
                                        }}>
                                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                                <Typography key={day} variant="caption" sx={{ 
                                                    textAlign: 'center', 
                                                    color: '#6b7280',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 'bold',
                                                    p: 1
                                                }}>
                                                    {day}
                                                </Typography>
                                            ))}
                                        </Box>
                                        
                                        {/* Calendar days */}
                                        <Box sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(7, 1fr)', 
                                            gap: 1
                                        }}>
                                            {getCurrentMonthDays().map((dayData, index) => (
                                                <Box key={index} sx={{ aspectRatio: '1', position: 'relative' }}>
                                                    {dayData && (
                                                        <Button
                                                            size="small"
                                                            disabled={dayData.isDisabled || !dayData.isSelectable}
                                                            onClick={() => dayData.isSelectable && handleDateSelection(dayData.date)}
                                                            sx={{
                                                                minWidth: 0,
                                                                width: '100%',
                                                                height: '100%',
                                                                fontSize: '0.8rem',
                                                                borderRadius: dayData.isInRange ? '2px' : '8px',
                                                                fontWeight: dayData.isStartDate || dayData.isEndDate || dayData.isToday ? 'bold' : 'medium',
                                                                bgcolor: (dayData.isDisabled || !dayData.isSelectable) ? '#f3f4f6' :
                                                                        dayData.isStartDate ? '#10b981' : 
                                                                        dayData.isEndDate ? '#10b981' :
                                                                        dayData.isInRange ? '#d1fae5' :
                                                                        dayData.isToday ? '#dbeafe' : 
                                                                        'transparent',
                                                                color: (dayData.isDisabled || !dayData.isSelectable) ? '#9ca3af' :
                                                                       (dayData.isStartDate || dayData.isEndDate) ? 'white' : 
                                                                       dayData.isInRange ? '#059669' :
                                                                       dayData.isToday ? '#1d4ed8' : '#374151',
                                                                border: dayData.isToday && !dayData.isStartDate && !dayData.isEndDate ? '2px solid #3b82f6' : 
                                                                        (dayData.isStartDate || dayData.isEndDate) ? '2px solid #059669' : 'none',
                                                                position: 'relative',
                                                                '&::before': dayData.isStartDate && endDate ? {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    right: '-2px',
                                                                    bottom: 0,
                                                                    width: '4px',
                                                                    bgcolor: '#d1fae5'
                                                                } : {},
                                                                '&::after': dayData.isEndDate && startDate ? {
                                                                    content: '""',
                                                                    position: 'absolute',
                                                                    top: 0,
                                                                    left: '-2px',
                                                                    bottom: 0,
                                                                    width: '4px',
                                                                    bgcolor: '#d1fae5'
                                                                } : {},
                                                                '&:hover': {
                                                                    bgcolor: (dayData.isDisabled || !dayData.isSelectable) ? '#f3f4f6' :
                                                                            (dayData.isStartDate || dayData.isEndDate) ? '#059669' : 
                                                                            dayData.isInRange ? '#bbf7d0' :
                                                                            '#f0f9ff',
                                                                    transform: (dayData.isDisabled || !dayData.isSelectable) ? 'none' : 'scale(1.05)'
                                                                },
                                                                '&:disabled': {
                                                                    cursor: 'not-allowed',
                                                                    opacity: dayData.isSelectable ? 0.3 : 0.6
                                                                },
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            {dayData.day}
                                                        </Button>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>

                            {/* Order Patterns Table */}
                            <Grid item xs={12} md={9}>
                                <Box sx={{ 
                                    backgroundColor: 'white',
                                    borderRadius: '16px',
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                                    overflow: 'hidden',
                                    height: 'fit-content'
                                }}>
                                    {/* Table Header */}
                                    <Box sx={{ 
                                        backgroundColor: '#f8fafc',
                                        borderBottom: '1px solid #e5e7eb',
                                        p: 2.5
                                    }}>
                                        <Typography variant="h6" sx={{ 
                                            fontWeight: 'bold', 
                                            color: '#1f2937',
                                            mb: 0.5
                                        }}>
                                            📊 Daily Order Analysis
                                        </Typography>
                                        <Typography variant="body2" sx={{ 
                                            color: '#6b7280'
                                        }}>
                                            {loading ? 'Loading data from Lambda API...' :
                                             selectedDates.length === 0 ? `Showing all available data (${dailyData.length} days)` : 
                                             selectedDates.length === 1 ? `Showing data for selected date (${dailyData.length} ${dailyData.length === 1 ? 'day' : 'days'} found)` :
                                             startDate && endDate ? `Showing data from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} (${dailyData.length} of ${selectedDates.length} days found)` :
                                             `Showing data for ${selectedDates.length} selected dates (${dailyData.length} days found)`}
                                        </Typography>
                                        {loading && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                onClick={loadPerformanceData}
                                                disabled={loading}
                                                sx={{ mt: 1 }}
                                            >
                                                {loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                                                Refresh Data
                                            </Button>
                                        )}
                                    </Box>

                                    {/* Table Layout */}
                                    <TableContainer sx={{ 
                                        height: 500,
                                        '& .MuiTableCell-root': {
                                            borderBottom: '1px solid #e5e7eb',
                                        }
                                    }}>
                                        <Table stickyHeader>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ 
                                                            bgcolor: '#f8fafc',
                                                            fontWeight: 'bold',
                                                            color: '#374151',
                                                            fontSize: '0.9rem',
                                                            width: '20%',
                                                            borderBottom: '2px solid #d1d5db'
                                                        }}
                                                    >
                                                        Date
                                                    </TableCell>
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ 
                                                            bgcolor: '#f8fafc',
                                                            fontWeight: 'bold',
                                                            color: '#374151',
                                                            fontSize: '0.9rem',
                                                            width: '20%',
                                                            borderBottom: '2px solid #d1d5db'
                                                        }}
                                                    >
                                                        Total Orders
                                                    </TableCell>
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ 
                                                            bgcolor: '#f8fafc',
                                                            fontWeight: 'bold',
                                                            color: '#374151',
                                                            fontSize: '0.9rem',
                                                            width: '30%',
                                                            borderBottom: '2px solid #d1d5db'
                                                        }}
                                                    >
                                                        Revenue (RM)
                                                    </TableCell>
                                                    <TableCell 
                                                        align="center"
                                                        sx={{ 
                                                            bgcolor: '#f8fafc',
                                                            fontWeight: 'bold',
                                                            color: '#374151',
                                                            fontSize: '0.9rem',
                                                            width: '30%',
                                                            borderBottom: '2px solid #d1d5db'
                                                        }}
                                                    >
                                                        Action
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {loading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                flexDirection: 'column', 
                                                                alignItems: 'center', 
                                                                gap: 2,
                                                                color: '#6b7280'
                                                            }}>
                                                                <CircularProgress />
                                                                <Typography variant="h6" sx={{ color: '#374151' }}>
                                                                    Loading data from Lambda API...
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                                    Fetching real sales data from DynamoDB
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : dailyData.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                                                            <Box sx={{ 
                                                                display: 'flex', 
                                                                flexDirection: 'column', 
                                                                alignItems: 'center', 
                                                                gap: 2,
                                                                color: '#6b7280'
                                                            }}>
                                                                <CalendarTodayIcon sx={{ fontSize: 48, color: '#d1d5db' }} />
                                                                <Typography variant="h6" sx={{ color: '#374151' }}>
                                                                    {selectedDates.length === 0 ? 'No data available' : 'No data found for selected dates'}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                                    {selectedDates.length === 0 
                                                                        ? 'No sales data available in the current date range' 
                                                                        : `No sales data found for the selected ${selectedDates.length === 1 ? 'date' : 'dates'}. Try selecting different dates.`}
                                                                </Typography>
                                                            </Box>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    dailyData.map((row, index) => {
                                                    const isHighActivity = row.status === 'high';
                                                    const isSpecialEvent = row.isSpecialEvent;
                                                    const isWeekend = row.isWeekend;
                                                    
                                                    return (
                                                        <TableRow
                                                            key={row.date}
                                                            sx={{
                                                                bgcolor: isSpecialEvent ? '#eff6ff' : 
                                                                        isWeekend ? '#fef7e0' : 'white',
                                                                '&:hover': {
                                                                    bgcolor: isSpecialEvent ? '#dbeafe' : 
                                                                             isWeekend ? '#fef3c7' : '#f9fafb',
                                                                },
                                                                transition: 'background-color 0.2s ease'
                                                            }}
                                                        >
                                                            {/* Date Column */}
                                                            <TableCell align="center" sx={{ py: 2 }}>
                                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                                                    <Typography variant="h6" sx={{ 
                                                                        fontWeight: 'bold',
                                                                        color: isSpecialEvent ? '#1d4ed8' : '#374151',
                                                                        fontSize: '1rem'
                                                                    }}>
                                                                        {row.date}
                                                                    </Typography>
                                                                    {isSpecialEvent && (
                                                                        <Chip 
                                                                            label="🎉 Event" 
                                                                            size="small" 
                                                                            sx={{ 
                                                                                bgcolor: '#fef3c7',
                                                                                color: '#d97706',
                                                                                fontSize: '0.65rem',
                                                                                height: 18,
                                                                                fontWeight: 'bold'
                                                                            }} 
                                                                        />
                                                                    )}
                                                                    {isWeekend && !isSpecialEvent && (
                                                                        <Chip 
                                                                            label="📅 Weekend" 
                                                                            size="small" 
                                                                            sx={{ 
                                                                                bgcolor: '#e0f2fe',
                                                                                color: '#0369a1',
                                                                                fontSize: '0.65rem',
                                                                                height: 18,
                                                                                fontWeight: 'bold'
                                                                            }} 
                                                                        />
                                                                    )}
                                                                </Box>
                                                            </TableCell>

                                                            {/* Total Orders Column */}
                                                            <TableCell align="center" sx={{ py: 2 }}>
                                                                <Box sx={{ 
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    px: 2,
                                                                    py: 1,
                                                                    borderRadius: '8px',
                                                                    bgcolor: row.status === 'high' ? '#fef2f2' :
                                                                            row.status === 'medium' ? '#fefbf2' : '#f0fdf4',
                                                                    border: `1px solid ${row.status === 'high' ? '#fecaca' :
                                                                                         row.status === 'medium' ? '#fed7aa' : '#bbf7d0'}`
                                                                }}>
                                                                    <Typography variant="h6" sx={{ 
                                                                        fontWeight: 'bold',
                                                                        color: row.status === 'high' ? '#dc2626' :
                                                                               row.status === 'medium' ? '#d97706' : '#16a34a',
                                                                        fontSize: '1.1rem'
                                                                    }}>
                                                                        {row.totalOrders}
                                                                    </Typography>
                                                                    <Typography variant="caption" sx={{ 
                                                                        color: row.status === 'high' ? '#dc2626' :
                                                                               row.status === 'medium' ? '#d97706' : '#16a34a',
                                                                        fontWeight: 'medium'
                                                                    }}>
                                                                        orders
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>

                                                            {/* Revenue Column */}
                                                            <TableCell align="center" sx={{ py: 2 }}>
                                                                <Box sx={{ 
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: 1,
                                                                    px: 2,
                                                                    py: 1,
                                                                    borderRadius: '8px',
                                                                    bgcolor: '#f0fdf4',
                                                                    border: '1px solid #bbf7d0'
                                                                }}>
                                                                    <Typography variant="h6" sx={{ 
                                                                        fontWeight: 'bold',
                                                                        color: '#16a34a',
                                                                        fontSize: '1rem'
                                                                    }}>
                                                                        RM {row.totalRevenue.toFixed(2)}
                                                                    </Typography>
                                                                </Box>
                                                            </TableCell>

                                                            {/* Action Column */}
                                                            <TableCell align="center" sx={{ py: 2 }}>
                                                                <Button
                                                                    variant="contained"
                                                                    size="medium"
                                                                    onClick={() => handleViewOrderDetails(row.date)}
                                                                    startIcon={<VisibilityIcon />}
                                                                    sx={{
                                                                        bgcolor: '#3b82f6',
                                                                        color: 'white',
                                                                        '&:hover': {
                                                                            bgcolor: '#2563eb',
                                                                            transform: 'translateY(-1px)',
                                                                            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
                                                                        },
                                                                        minWidth: 100,
                                                                        textTransform: 'none',
                                                                        fontWeight: 'bold',
                                                                        borderRadius: '8px',
                                                                        transition: 'all 0.2s ease'
                                                                    }}
                                                                >
                                                                    VIEW
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                }))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 3 }} />
                        
                        {/* Enhanced Summary Stats - Real Data Based */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
                            {(() => {
                                // Calculate metrics from real data
                                const avgOrdersPerDay = dailyData.length > 0 ? Math.round(summary.total_orders / dailyData.length) : 0;
                                
                                // Find highest volume day
                                const highestVolumeDay = dailyData.reduce((prev, current) => 
                                    (prev.totalOrders > current.totalOrders) ? prev : current, 
                                    { totalOrders: 0, date: 'N/A' }
                                );
                                
                                // Calculate growth rate (compare with previous period if we have enough data)
                                const growthRate = dailyData.length >= 2 ? 
                                    ((dailyData[dailyData.length - 1].totalOrders - dailyData[0].totalOrders) / dailyData[0].totalOrders * 100) : 0;
                                
                                // Format highest volume day date
                                const formatDate = (dateStr: string) => {
                                    if (dateStr === 'N/A') return 'N/A';
                                    const [day, month, year] = dateStr.split('/');
                                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                    return date.toLocaleDateString('en-US', { weekday: 'long' });
                                };

                                return (
                                    <>
                                        <MetricCard sx={{ flex: 1 }}>
                                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                                <Box sx={{ 
                                                    width: 48, 
                                                    height: 48, 
                                                    borderRadius: '50%', 
                                                    bgcolor: alpha('#1976d2', 0.1),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto 16px auto'
                                                }}>
                                                    <TrendingUpIcon sx={{ color: '#1976d2', fontSize: 24 }} />
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                                                    {avgOrdersPerDay}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                    Average Orders Per Day
                                                </Typography>
                                                <Typography variant="caption" sx={{ 
                                                    color: '#10b981', 
                                                    fontWeight: 'bold',
                                                    bgcolor: alpha('#10b981', 0.1),
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    mt: 1,
                                                    display: 'inline-block'
                                                }}>
                                                    {dailyData.length} day{dailyData.length !== 1 ? 's' : ''} selected
                                                </Typography>
                                            </CardContent>
                                        </MetricCard>
                                        
                                        <MetricCard sx={{ flex: 1 }}>
                                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                                <Box sx={{ 
                                                    width: 48, 
                                                    height: 48, 
                                                    borderRadius: '50%', 
                                                    bgcolor: alpha('#2e7d32', 0.1),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto 16px auto'
                                                }}>
                                                    <RestaurantIcon sx={{ color: '#2e7d32', fontSize: 24 }} />
                                                </Box>
                                                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32', mb: 1 }}>
                                                    {formatDate(highestVolumeDay.date)}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                    Highest Volume Day
                                                </Typography>
                                                <Typography variant="caption" sx={{ 
                                                    color: '#2e7d32', 
                                                    fontWeight: 'bold',
                                                    bgcolor: alpha('#2e7d32', 0.1),
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    mt: 1,
                                                    display: 'inline-block'
                                                }}>
                                                    {highestVolumeDay.totalOrders} orders
                                                </Typography>
                                            </CardContent>
                                        </MetricCard>
                                        
                                        <MetricCard sx={{ flex: 1 }}>
                                            <CardContent sx={{ textAlign: 'center', p: 3 }}>
                                                <Box sx={{ 
                                                    width: 48, 
                                                    height: 48, 
                                                    borderRadius: '50%', 
                                                    bgcolor: alpha('#ed6c02', 0.1),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    margin: '0 auto 16px auto'
                                                }}>
                                                    <AnalyticsIcon sx={{ color: '#ed6c02', fontSize: 24 }} />
                                                </Box>
                                                <Typography variant="h5" sx={{ 
                                                    fontWeight: 'bold', 
                                                    color: growthRate >= 0 ? '#ed6c02' : '#dc2626', 
                                                    mb: 1 
                                                }}>
                                                    {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                                    {dailyData.length >= 2 ? 'Period Growth Rate' : 'Revenue per Order'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ 
                                                    color: dailyData.length >= 2 ? 
                                                           (growthRate >= 0 ? '#10b981' : '#dc2626') : '#6b7280',
                                                    fontWeight: 'bold',
                                                    bgcolor: dailyData.length >= 2 ? 
                                                             (growthRate >= 0 ? alpha('#10b981', 0.1) : alpha('#dc2626', 0.1)) : 
                                                             alpha('#6b7280', 0.1),
                                                    px: 1,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    mt: 1,
                                                    display: 'inline-block'
                                                }}>
                                                    {dailyData.length >= 2 ? 
                                                     (growthRate >= 0 ? 'Increasing' : 'Decreasing') : 
                                                     `RM ${summary.total_orders > 0 ? (summary.total_revenue / summary.total_orders).toFixed(2) : '0.00'}`}
                                                </Typography>
                                            </CardContent>
                                        </MetricCard>
                                    </>
                                );
                            })()}
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* Stock vs Usage Chart */}
                <Grid item xs={12}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1f2937', mb: 3 }}>
                            📈 Stock vs Usage Trends
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                            Track inventory levels against daily usage patterns
                        </Typography>
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={inventoryTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#6b7280"
                                    fontSize={12}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    fontSize={12}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="stock" 
                                    stroke={blue[500]} 
                                    strokeWidth={3}
                                    name="Stock Level"
                                    dot={{ fill: blue[500], strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 7, stroke: blue[500], strokeWidth: 2 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="usage" 
                                    stroke={orange[500]} 
                                    strokeWidth={3}
                                    name="Usage"
                                    dot={{ fill: orange[500], strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 7, stroke: orange[500], strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        
                        {/* Chart Insights */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            mt: 3, 
                            pt: 3, 
                            borderTop: '1px solid #e5e7eb',
                            gap: 2
                        }}>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="h6" sx={{ color: blue[600], fontWeight: 'bold' }}>
                                    {Math.round(inventoryTrends.reduce((sum, item) => sum + item.stock, 0) / inventoryTrends.length)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    Avg Stock Level
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="h6" sx={{ color: orange[600], fontWeight: 'bold' }}>
                                    {Math.round(inventoryTrends.reduce((sum, item) => sum + item.usage, 0) / inventoryTrends.length)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    Avg Daily Usage
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="h6" sx={{ 
                                    color: inventoryTrends.some(item => item.stock < item.usage) ? red[600] : teal[600], 
                                    fontWeight: 'bold' 
                                }}>
                                    {inventoryTrends.filter(item => item.stock < item.usage).length > 0 ? 'Alert' : 'Optimal'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                    Stock Status
                                </Typography>
                            </Box>
                        </Box>
                    </StyledPaper>
                </Grid>
            </Grid>

            {/* Order Details Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        maxHeight: '80vh'
                    }
                }}
            >
                <DialogTitle sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    bgcolor: '#f8fafc',
                    borderBottom: '1px solid #e5e7eb'
                }}>
                    <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                            Order Details - {selectedTimeSlot}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280' }}>
                            {selectedTimeSlot} • {orderDetails.length} menu items
                        </Typography>
                    </Box>
                    <IconButton onClick={() => setDialogOpen(false)} size="small">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ p: 0 }}>
                    <List sx={{ p: 0 }}>
                        {orderDetails.map((order, index) => (
                            <ListItem
                                key={`${order.dish_id}-${index}`}
                                sx={{
                                    borderBottom: index < orderDetails.length - 1 ? '1px solid #f3f4f6' : 'none',
                                    p: 3,
                                    '&:hover': { bgcolor: '#f9fafb' }
                                }}
                            >
                                <ListItemText
                                    primary={
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                            <Box>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937', mb: 0.5 }}>
                                                    {order.dish_name}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                                    <Chip 
                                                        label={order.category} 
                                                        size="small" 
                                                        sx={{ bgcolor: '#e0e7ff', color: '#3730a3', fontSize: '0.7rem' }}
                                                    />
                                                    <Chip 
                                                        label={order.subcategory} 
                                                        size="small" 
                                                        sx={{ bgcolor: '#ecfdf5', color: '#047857', fontSize: '0.7rem' }}
                                                    />
                                                    {(order.is_special_event === "TRUE" || order.is_special_event === true) && (
                                                        <Chip 
                                                            label="🎉 Special Event" 
                                                            size="small" 
                                                            sx={{ bgcolor: '#fef3c7', color: '#92400e', fontSize: '0.7rem' }}
                                                        />
                                                    )}
                                                    {(order.is_holiday === "TRUE" || order.is_holiday === true) && (
                                                        <Chip 
                                                            label="🏖️ Holiday" 
                                                            size="small" 
                                                            sx={{ bgcolor: '#ddd6fe', color: '#7c2d12', fontSize: '0.7rem' }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#059669' }}>
                                                    RM {parseFloat(order.revenue).toFixed(2)}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                                    {order.quantity_sold} × RM {order.price}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    }
                                    secondary={
                                        <Box sx={{ mt: 2 }}>
                                            <Grid container spacing={2}>
                                                <Grid item xs={6} sm={3}>
                                                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                                                        Quantity Sold
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {order.quantity_sold} units
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                                                        Avg Table Size
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {parseFloat(order.avg_table_size).toFixed(1)} people
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                                                        Meal Period
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium', textTransform: 'capitalize' }}>
                                                        {order.meal_period}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={6} sm={3}>
                                                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                                                        Temperature
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                                        {parseFloat(order.temp_max).toFixed(1)}°C
                                                    </Typography>
                                                </Grid>
                                            </Grid>
                                        </Box>
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                    
                    {/* Summary */}
                    <Box sx={{ 
                        p: 3, 
                        bgcolor: '#f8fafc', 
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <Box>
                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                Total Items: {orderDetails.reduce((sum, order) => sum + parseInt(order.quantity_sold), 0)}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                                Total Revenue: RM {orderDetails.reduce((sum, order) => sum + parseFloat(order.revenue), 0).toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default PerformanceTrends;