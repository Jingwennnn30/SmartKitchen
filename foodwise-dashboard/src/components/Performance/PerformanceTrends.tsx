import React, { useState } from 'react';
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

// Mock data for Historical Order Patterns (Heatmap data)
type HeatmapDataPoint = {
    hour: string;
    orders: number;
};

type HeatmapRow = {
    day: string;
    [key: string]: string | number; // For dynamic hour keys
};

const generateHeatmapData = (): HeatmapRow[] => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => {
        const rowData: HeatmapRow = { day };
        // Add data for working hours (10:00 - 22:00)
        for (let hour = 10; hour < 23; hour++) {
            const hourKey = String(hour).padStart(2, '0') + 'h';
            // Generate higher numbers during peak hours (11:00 - 14:00)
            const isPeakHour = hour >= 11 && hour <= 14;
            const baseValue = isPeakHour ? 25 : 10;
            const variation = isPeakHour ? 25 : 15;
            rowData[hourKey] = Math.floor(Math.random() * variation) + baseValue;
        }
        return rowData;
    });
};

// Mock data for Average Wait Time Trends
const waitTimeTrends = Array.from({ length: 14 }, (_, index) => ({
    date: (index + 1) + '/9',
    avgWaitTime: Math.floor(Math.random() * 15 + 10),
    targetTime: 15
}));

// Mock data for Inventory Usage Trends
const inventoryTrends = Array.from({ length: 14 }, (_, index) => ({
    date: (index + 1) + '/9',
    stock: Math.floor(Math.random() * 200 + 300),
    usage: Math.floor(Math.random() * 150 + 200)
}));

// Mock data for Cost & Waste Analysis
const wasteAnalysis = Array.from({ length: 6 }, (_, index) => ({
    month: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][index],
    foodCost: Math.floor(Math.random() * 5000 + 15000),
    wastePercentage: Number((Math.random() * 8 + 2).toFixed(1))
}));

// Staff Efficiency Score calculation
const staffEfficiency = {
    score: 87,
    total: 100,
    trend: '+2.5%'
};

// Mock order data based on database schema
const generateOrderDetails = (hour: string, date: string) => {
    const dishes = [
        { dish_id: 512, dish_name: 'Liqueurs', category: 'Beverages', subcategory: 'Alcoholic Drinks', price: 14, meal_period: 'both' },
        { dish_id: 401, dish_name: 'Chocolate Cake', category: 'Desserts', subcategory: 'Cakes', price: 15, meal_period: 'both' },
        { dish_id: 403, dish_name: 'Carrot Cake', category: 'Desserts', subcategory: 'Cakes', price: 14, meal_period: 'both' },
        { dish_id: 304, dish_name: 'Potato Wedges', category: 'Sides', subcategory: 'Potatoes', price: 8, meal_period: 'both' },
        { dish_id: 501, dish_name: 'Water', category: 'Beverages', subcategory: 'Non-Alcoholic Drinks', price: 2, meal_period: 'both' },
        { dish_id: 410, dish_name: 'Rice Pudding', category: 'Desserts', subcategory: 'Puddings', price: 14, meal_period: 'both' },
        { dish_id: 201, dish_name: 'Grilled Chicken', category: 'Main Course', subcategory: 'Poultry', price: 25, meal_period: 'both' },
        { dish_id: 101, dish_name: 'Caesar Salad', category: 'Appetizers', subcategory: 'Salads', price: 12, meal_period: 'both' },
    ];

    const orders = [];
    const numOrders = Math.floor(Math.random() * 8) + 3; // 3-10 different dishes per hour

    for (let i = 0; i < numOrders; i++) {
        const dish = dishes[Math.floor(Math.random() * dishes.length)];
        const quantity = Math.floor(Math.random() * 15) + 1; // 1-15 quantity
        const revenue = dish.price * quantity;
        
        orders.push({
            ...dish,
            date,
            hour,
            quantity_sold: quantity,
            revenue,
            avg_table_size: Math.round((Math.random() * 2 + 2) * 10) / 10, // 2.0-4.0
            temp_max: Math.round((Math.random() * 10 + 25) * 10) / 10, // 25-35°C
            is_weekend: new Date(date).getDay() === 0 || new Date(date).getDay() === 6,
            is_holiday: false,
            is_special_event: Math.random() > 0.8,
        });
    }

    return orders;
};

const PerformanceTrends: React.FC = () => {
    const handleExportPDF = () => {
        // PDF export logic would go here
        console.log('Exporting to PDF...');
    };

    const [selectedDates, setSelectedDates] = useState<string[]>([]); // Start with no selection
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(10); // Start with October
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [orderDetails, setOrderDetails] = useState<any[]>([]);
    
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
            return;
        }
        
        // If clicking on the same end date, reset to just start date
        if (endDate === date && startDate) {
            setEndDate(null);
            setSelectedDates([startDate]);
            return;
        }
        
        if (!startDate || (startDate && endDate)) {
            // First click or reset selection - set as start date
            setStartDate(date);
            setEndDate(null);
            setSelectedDates([date]);
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
                setSelectedDates(getDateRange(startDate, date));
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
        setOrderDetails(generateOrderDetails('12:00', date)); // Use noon as default time
        setDialogOpen(true);
    };

    // Generate daily order data based on database schema
    const generateDailyOrderData = () => {
        const dailyData: any[] = [];
        
        // Generate data for September and October 2025
        const months = [
            { month: 9, days: 30 }, // September
            { month: 10, days: 31 } // October
        ];
        
        months.forEach(({ month, days }) => {
            for (let day = 1; day <= days; day++) {
                const dateStr = `${day}/${month}/2025`;
                const date = new Date(2025, month - 1, day);
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                const isHoliday = false; // For now, no holidays
                const isSpecialEvent = day % 7 === 0; // Every 7th day is a special event
                
                // Calculate totals based on multiple dishes sold that day
                const totalOrders = Math.floor(Math.random() * 50) + (isWeekend ? 80 : 120);
                const avgPrice = 15 + Math.random() * 10; // Average price between 15-25
                const totalRevenue = totalOrders * avgPrice;
                
                dailyData.push({
                    date: dateStr,
                    totalOrders,
                    totalRevenue: totalRevenue.toFixed(2),
                    avgTableSize: (2 + Math.random() * 2).toFixed(1), // 2-4 people average
                    dailyCustomers: totalOrders * 2.5, // Approximate customers based on orders
                    isWeekend,
                    isHoliday,
                    isSpecialEvent,
                    status: totalOrders >= 150 ? 'high' : totalOrders >= 100 ? 'medium' : 'low'
                });
            }
        });
        return dailyData;
    };

    const allDailyData = generateDailyOrderData();
    
    // Filter data to show only selected dates
    const dailyData = selectedDates.length === 0 ? [] : 
                     allDailyData.filter(row => {
                         // Convert row.date (format: "14/10/2025") to match selectedDates format ("2025-10-14")
                         const [day, month, year] = row.date.split('/');
                         const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                         return selectedDates.includes(formattedDate);
                     });

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
                                Real-time insights and business intelligence dashboard
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

            <Grid container spacing={3}>
                {/* Staff Efficiency Score */}
                <Grid item xs={12} md={4}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Staff Efficiency Score
                        </Typography>
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            mt: 2
                        }}>
                            <Typography variant="h2" sx={{ color: teal[500] }}>
                                {staffEfficiency.score}%
                            </Typography>
                            <Typography 
                                variant="subtitle1" 
                                sx={{ 
                                    color: staffEfficiency.trend.startsWith('+') ? 'success.main' : 'error.main',
                                    mt: 1
                                }}
                            >
                                {staffEfficiency.trend} vs last month
                            </Typography>
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* Wait Time Trends */}
                <Grid item xs={12} md={8}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Average Wait Time Trends
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={waitTimeTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="avgWaitTime" 
                                    stroke={blue[500]} 
                                    name="Average Wait Time"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="targetTime" 
                                    stroke={orange[500]} 
                                    strokeDasharray="5 5" 
                                    name="Target Time"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </StyledPaper>
                </Grid>

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
                                    {selectedDates.length === 0 ? 'Select dates from calendar to view analysis' : 
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
                                            {selectedDates.length === 0 ? 'Please select a date range from the calendar to view order data' : 
                                             selectedDates.length === 1 ? 'Showing data for selected date' :
                                             startDate && endDate ? `Showing data from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()} (${selectedDates.length} days)` :
                                             `Showing data for ${selectedDates.length} selected dates`}
                                        </Typography>
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
                                                {dailyData.length === 0 ? (
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
                                                                    No dates selected
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                                    Please select one or more dates from the calendar to view order data
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
                                                                        RM {row.totalRevenue}
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
                        
                        {/* Enhanced Summary Stats */}
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 3 }}>
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
                                        12:00-14:00
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        Peak Performance Hours
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
                                        46 avg orders/hr
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
                                        Saturday
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
                                        320 total orders
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
                                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#ed6c02', mb: 1 }}>
                                        +12.5%
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>
                                        Weekly Growth Rate
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
                                        Above target
                                    </Typography>
                                </CardContent>
                            </MetricCard>
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* Inventory Usage Trends */}
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Inventory Usage Trends
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={inventoryTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="stock" 
                                    stroke={blue[500]} 
                                    name="Stock Level"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="usage" 
                                    stroke={orange[500]} 
                                    name="Usage"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </StyledPaper>
                </Grid>

                {/* Cost & Waste Analysis */}
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom>
                            Cost & Waste Analysis
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={wasteAnalysis}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis yAxisId="left" orientation="left" stroke={blue[500]} />
                                <YAxis yAxisId="right" orientation="right" stroke={red[500]} />
                                <Tooltip />
                                <Legend />
                                <Bar
                                    yAxisId="left"
                                    dataKey="foodCost"
                                    name="Food Cost (RM)"
                                    fill={blue[500]}
                                    activeBar={<Rectangle fill={blue[700]} stroke={blue[700]} />}
                                />
                                <Bar
                                    yAxisId="right"
                                    dataKey="wastePercentage"
                                    name="Waste %"
                                    fill={red[500]}
                                    activeBar={<Rectangle fill={red[700]} stroke={red[700]} />}
                                />
                            </BarChart>
                        </ResponsiveContainer>
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
                                                    {order.is_special_event && (
                                                        <Chip 
                                                            label="Special Event" 
                                                            size="small" 
                                                            sx={{ bgcolor: '#fef3c7', color: '#92400e', fontSize: '0.7rem' }}
                                                        />
                                                    )}
                                                </Box>
                                            </Box>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#059669' }}>
                                                    RM {order.revenue.toFixed(2)}
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
                                                        {order.avg_table_size} people
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
                                                        {order.temp_max}°C
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
                                Total Items: {orderDetails.reduce((sum, order) => sum + order.quantity_sold, 0)}
                            </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                                Total Revenue: RM {orderDetails.reduce((sum, order) => sum + order.revenue, 0).toFixed(2)}
                            </Typography>
                        </Box>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default PerformanceTrends;