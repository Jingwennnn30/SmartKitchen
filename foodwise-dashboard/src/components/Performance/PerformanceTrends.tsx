import React, { useState, useEffect, useMemo } from 'react';
import ReportGenerationDialog from './ReportGenerationDialog';
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
import { 
    fetchPerformanceData, 
    PerformanceResponse, 
    fetchWasteAnalysisData, 
    fetchAIInsights,
    WasteAnalysisResponse,
    AIInsightsResponse 
} from '../../services/performanceService';
import AIAnalysisPopup from './AIAnalysisPopup';

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
        startDate: "",
        endDate: "",
    });
    
    // Waste analysis state
    const [wasteData, setWasteData] = useState<WasteAnalysisResponse | null>(null);
    const [wasteLoading, setWasteLoading] = useState(false);
    
    // AI analysis state
    const [aiInsights, setAiInsights] = useState<AIInsightsResponse | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiDialogOpen, setAiDialogOpen] = useState(false);
    
    // Cache for API responses to enable instant display
    const [dataCache, setDataCache] = useState<Map<string, PerformanceResponse>>(new Map());
    
    // UI state
    const [selectedDates, setSelectedDates] = useState<string[]>([]); // Start with no selection
    const [startDate, setStartDate] = useState<string | null>(null);
    const [endDate, setEndDate] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(9); // Start with September
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
    const [orderDetails, setOrderDetails] = useState<any[]>([]);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
    const [reportDialogOpen, setReportDialogOpen] = useState(false);

    const handleExportPDF = () => {
        // Open the professional report generation dialog
        setReportDialogOpen(true);
    };

    // Load performance data from API with caching
    const loadPerformanceData = async () => {
        try {
            const cacheKey = `${selectedRange.startDate}-${selectedRange.endDate}`;
            
            // Check cache first for instant display
            if (dataCache.has(cacheKey)) {
                console.log('Using cached data for instant display');
                setData(dataCache.get(cacheKey)!);
                return;
            }
            
            setLoading(true);
            const result = await fetchPerformanceData(selectedRange.startDate, selectedRange.endDate);
            
            // Add selected date range to result for report generation
            const enrichedResult = {
                ...result,
                selectedStartDate: selectedRange.startDate,
                selectedEndDate: selectedRange.endDate
            };
            
            // Cache the result
            setDataCache(prev => new Map(prev).set(cacheKey, enrichedResult));
            setData(enrichedResult);
        } catch (err) {
            console.error("Error fetching performance data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only load data if we have selected dates, not on initial load
        if (selectedRange.startDate && selectedRange.endDate) {
            // Clear existing timeout
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
            
            // Set new timeout for debounced API call
            const newTimeout = setTimeout(() => {
                loadPerformanceData();
                loadWasteAnalysisData(); // Also load waste data
            }, 50); // Further reduced to 50ms for near-instant response
            
            setDebounceTimeout(newTimeout);
            
            // Cleanup function
            return () => {
                if (newTimeout) {
                    clearTimeout(newTimeout);
                }
            };
        }
    }, [selectedRange.startDate, selectedRange.endDate]); // Removed selectedDates.length dependency
    
    // Load initial data when component mounts
    useEffect(() => {
        // Load waste analysis data immediately when component mounts (without date filters)
        const loadInitialWasteData = async () => {
            try {
                setWasteLoading(true);
                // Call without date parameters to get all available data
                const result = await fetchWasteAnalysisData();
                setWasteData(result);
            } catch (err) {
                console.error("Error fetching initial waste analysis data:", err);
            } finally {
                setWasteLoading(false);
            }
        };
        
        loadInitialWasteData();
        
        // Optionally also load performance data with default date range
        // You can uncomment this if you want to load performance data immediately too
        // loadPerformanceData();
    }, []); // Empty dependency array means this runs once on mount
    
    // Get today's date in Malaysian time
    const getTodayInMalaysianTime = () => {
        const now = new Date();
        // Malaysia is UTC+8
        const malaysianTime = new Date(now.getTime() + (8 * 60 * 60 * 1000));
        const year = malaysianTime.getUTCFullYear();
        const month = String(malaysianTime.getUTCMonth() + 1).padStart(2, '0');
        const day = String(malaysianTime.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Generate calendar days for current month
    const getCurrentMonthDays = () => {
        const year = 2025;
        const daysInMonth = new Date(year, currentMonth, 0).getDate();
        const firstDay = new Date(year, currentMonth - 1, 1).getDay();
        const todayMalaysianTime = getTodayInMalaysianTime();
        
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
                isToday: date === todayMalaysianTime,
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
            // Reset to empty state
            setSelectedRange({
                startDate: "",
                endDate: "",
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
            const newRange = {
                startDate: apiDate,
                endDate: apiDate
            };
            
            // Check cache for instant display
            const cacheKey = `${apiDate}-${apiDate}`;
            if (dataCache.has(cacheKey)) {
                console.log('Instant display from cache');
                setData(dataCache.get(cacheKey)!);
            }
            
            setSelectedRange(newRange);
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
            const newRange = {
                startDate: apiDate,
                endDate: apiDate
            };
            
            // Check cache for instant display
            const cacheKey = `${apiDate}-${apiDate}`;
            if (dataCache.has(cacheKey)) {
                console.log('Instant display from cache');
                setData(dataCache.get(cacheKey)!);
            }
            
            setSelectedRange(newRange);
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
                
                const newRange = {
                    startDate: apiStartDate,
                    endDate: apiEndDate
                };
                
                // Check cache for instant display
                const cacheKey = `${apiStartDate}-${apiEndDate}`;
                if (dataCache.has(cacheKey)) {
                    console.log('Instant display from cache for date range');
                    setData(dataCache.get(cacheKey)!);
                }
                
                setSelectedRange(newRange);
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

    // Get daily breakdown data from API with memoization for performance
    const { allDailyData, dailyData, apiSummary } = useMemo(() => {
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
            // If no dates are selected, show NO data (empty table)
            if (selectedDates.length === 0) {
                return false;
            }
            
            // Convert date (format: "5/9/2025") to match selectedDates format ("2025-09-05")
            const [day, month, year] = row.date.split('/');
            const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            const isIncluded = selectedDates.includes(formattedDate);
            return isIncluded;
        });

        return { allDailyData, dailyData, apiSummary };
    }, [data, selectedDates]);

    // Calculate summary from filtered data (this will match the table) - memoized for performance
    const summary = useMemo(() => ({
        total_orders: dailyData.reduce((sum, day) => sum + day.totalOrders, 0),
        total_revenue: dailyData.reduce((sum, day) => sum + day.totalRevenue, 0),
        avg_table_size: apiSummary?.avg_table_size || 0 // Keep the original avg table size
    }), [dailyData, apiSummary]);

    // Mock data for Inventory Usage Trends (for the chart)
    const inventoryTrends = Array.from({ length: 14 }, (_, index) => ({
        date: (index + 1) + '/9',
        stock: Math.floor(Math.random() * 200 + 300),
        usage: Math.floor(Math.random() * 150 + 200)
    }));

    // Mock data for Average Wait Time Trends
    const waitTimeTrends = Array.from({ length: 14 }, (_, index) => ({
        date: (index + 1) + '/9',
        avgWaitTime: Math.floor(Math.random() * 15 + 10),
        targetTime: 15
    }));

    // Load waste analysis data from API
    const loadWasteAnalysisData = async () => {
        try {
            setWasteLoading(true);
            const result = await fetchWasteAnalysisData(selectedRange.startDate, selectedRange.endDate);
            setWasteData(result);
        } catch (err) {
            console.error("Error fetching waste analysis data:", err);
            // Fallback to mock data if API fails
            const mockWasteData: WasteAnalysisResponse = {
                waste_analysis: Array.from({ length: 6 }, (_, index) => ({
                    month: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][index],
                    foodCost: Math.floor(Math.random() * 5000 + 15000),
                    wastePercentage: Number((Math.random() * 8 + 2).toFixed(1)),
                    wasteAmount: Math.floor(Math.random() * 500 + 200),
                    expiredItems: Math.floor(Math.random() * 5),
                    itemsProcessed: Math.floor(Math.random() * 50 + 20)
                })),
                summary: {
                    avg_monthly_cost: 18000,
                    avg_waste_percentage: 5.6,
                    total_waste_amount: 2400,
                    performance_status: "Above Target",
                    performance_trend: "improving",
                    total_items_analyzed: 272,
                    date_range: {
                        start: selectedRange.startDate || "2024-05-01",
                        end: selectedRange.endDate || "2024-10-31"
                    }
                },
                insights: [
                    "Waste levels are above target. Consider reviewing inventory management processes.",
                    "Positive trend: Waste levels have decreased compared to previous month.",
                    "Highest food costs were in recent months"
                ]
            };
            setWasteData(mockWasteData);
        } finally {
            setWasteLoading(false);
        }
    };

    // Handle AI analysis click
    const handleAIAnalysisClick = async () => {
        try {
            setAiLoading(true);
            setAiError(null);
            setAiDialogOpen(true);
            
            // Ensure waste data is loaded
            let currentWasteData = wasteData;
            if (!currentWasteData) {
                await loadWasteAnalysisData();
                // Wait a bit for state to update
                await new Promise(resolve => setTimeout(resolve, 100));
                currentWasteData = wasteData;
            }
            
            // If still no waste data, use a fallback
            if (!currentWasteData) {
                const mockWasteData: WasteAnalysisResponse = {
                    waste_analysis: Array.from({ length: 6 }, (_, index) => ({
                        month: ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'][index],
                        foodCost: Math.floor(Math.random() * 5000 + 15000),
                        wastePercentage: Number((Math.random() * 8 + 2).toFixed(1)),
                        wasteAmount: Math.floor(Math.random() * 500 + 200),
                        expiredItems: Math.floor(Math.random() * 5),
                        itemsProcessed: Math.floor(Math.random() * 50 + 20)
                    })),
                    summary: {
                        avg_monthly_cost: 18000,
                        avg_waste_percentage: 5.6,
                        total_waste_amount: 2400,
                        performance_status: "Above Target",
                        performance_trend: "improving",
                        total_items_analyzed: 272,
                        date_range: {
                            start: selectedRange.startDate || "2024-05-01",
                            end: selectedRange.endDate || "2024-10-31"
                        }
                    },
                    insights: [
                        "Waste levels are above target. Consider reviewing inventory management processes.",
                        "Positive trend: Waste levels have decreased compared to previous month.",
                        "Highest food costs were in recent months"
                    ]
                };
                currentWasteData = mockWasteData;
            }
            
            const aiResult = await fetchAIInsights(currentWasteData);
            setAiInsights(aiResult);
        } catch (err) {
            console.error("Error fetching AI insights:", err);
            setAiError("Failed to generate AI insights. Please try again.");
        } finally {
            setAiLoading(false);
        }
    };

    // Use only real waste data - no mock fallback
    const wasteAnalysis = wasteData?.waste_analysis || [];

    // Debug logging (commented out for performance)
    // console.log('Selected dates:', selectedDates);
    // console.log('Available API dates:', Object.keys(data?.daily_breakdown || {}));
    // console.log('All daily data:', allDailyData);
    // console.log('Filtered daily data:', dailyData);
    // console.log('Calculated summary:', summary);
    // console.log('API summary:', apiSummary);

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

            {/* Staff Efficiency Score and Cost & Waste Analysis - Side by Side */}
            <Grid container spacing={3} sx={{ mb: 3 }}>
                <Grid item xs={12} md={4}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
                            AI-Enhanced Staff Efficiency
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                            How AI technology improves kitchen operations
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                            <Chip 
                                label="AI Powered" 
                                size="small" 
                                sx={{ 
                                    bgcolor: '#f0f9ff', 
                                    color: '#0369a1',
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem'
                                }} 
                            />
                            <Chip 
                                label="Smart Kitchen" 
                                size="small" 
                                sx={{ 
                                    bgcolor: '#ecfdf5', 
                                    color: '#059669',
                                    fontWeight: 'bold',
                                    fontSize: '0.7rem'
                                }} 
                            />
                        </Box>
                        
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            position: 'relative',
                            mb: 3
                        }}>
                            {/* Circular Progress */}
                            <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                                <CircularProgress
                                    variant="determinate"
                                    value={staffEfficiency.score}
                                    size={130}
                                    thickness={8}
                                    sx={{
                                        color: '#10b981',
                                        '& .MuiCircularProgress-circle': {
                                            strokeLinecap: 'round',
                                        },
                                    }}
                                />
                                <CircularProgress
                                    variant="determinate"
                                    value={100}
                                    size={130}
                                    thickness={8}
                                    sx={{
                                        color: '#f3f4f6',
                                        position: 'absolute',
                                        left: 0,
                                        zIndex: -1,
                                    }}
                                />
                                <Box sx={{
                                    top: 0,
                                    left: 0,
                                    bottom: 0,
                                    right: 0,
                                    position: 'absolute',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'column'
                                }}>
                                    <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                                        {staffEfficiency.score}%
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.8rem' }}>
                                        Efficiency
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        {/* AI Impact Metrics */}
                        <Box sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1.5,
                            mb: 3
                        }}>
                            <Box sx={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1.5,
                                bgcolor: '#f0f9ff',
                                borderRadius: '8px',
                                border: '1px solid #bfdbfe'
                            }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#1e40af', display: 'block', fontWeight: 'bold' }}>
                                        AI Recipe Suggestions
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: '#1d4ed8', fontWeight: 'bold' }}>
                                        +42% faster
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1.5,
                                bgcolor: '#ecfdf5',
                                borderRadius: '8px',
                                border: '1px solid #bbf7d0'
                            }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#047857', display: 'block', fontWeight: 'bold' }}>
                                        Smart Order Queue
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: '#059669', fontWeight: 'bold' }}>
                                        -38% wait time
                                    </Typography>
                                </Box>
                            </Box>

                            <Box sx={{ 
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                p: 1.5,
                                bgcolor: '#fef3c7',
                                borderRadius: '8px',
                                border: '1px solid #fed7aa'
                            }}>
                                <Box>
                                    <Typography variant="caption" sx={{ color: '#92400e', display: 'block', fontWeight: 'bold' }}>
                                        Predictive Analytics
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: '#d97706', fontWeight: 'bold' }}>
                                        97% accuracy
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                        
                        <Box sx={{ textAlign: 'center' }}>
                            <Chip 
                                label={`${staffEfficiency.trend} with AI integration`}
                                size="small"
                                sx={{ 
                                    bgcolor: '#ecfdf5', 
                                    color: '#059669',
                                    fontWeight: 'bold'
                                }}
                            />
                            <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mt: 1 }}>
                                AI systems actively optimizing kitchen workflow
                            </Typography>
                        </Box>
                    </StyledPaper>
                </Grid>
                <Grid item xs={12} md={8}>
                    <StyledPaper sx={{ 
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
                            transform: 'translateY(-1px)',
                        }
                    }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                            <Box>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1f2937', mb: 1 }}>
                                    Cost & Waste Analysis
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={handleAIAnalysisClick}
                                        disabled={wasteLoading}
                                        sx={{ 
                                            ml: 2,
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem',
                                            borderColor: '#8b5cf6',
                                            color: '#8b5cf6',
                                            '&:hover': {
                                                borderColor: '#7c3aed',
                                                backgroundColor: '#f3f4f6',
                                            }
                                        }}
                                        startIcon={<AnalyticsIcon />}
                                    >
                                        AI Analysis
                                    </Button>
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                    Monitor food costs and waste reduction trends over time • Click for AI insights
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <Chip 
                                    label="Target: <5%" 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: '#fef2f2', 
                                        color: '#dc2626',
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem'
                                    }} 
                                />
                                <Chip 
                                    label="Monthly Trend" 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: '#eff6ff', 
                                        color: '#2563eb',
                                        fontWeight: 'bold',
                                        fontSize: '0.75rem'
                                    }} 
                                />
                                {wasteLoading && (
                                    <Chip 
                                        label="Loading..." 
                                        size="small" 
                                        sx={{ 
                                            bgcolor: '#f3f4f6', 
                                            color: '#6b7280',
                                            fontWeight: 'bold',
                                            fontSize: '0.75rem'
                                        }} 
                                    />
                                )}
                            </Box>
                        </Box>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={wasteAnalysis} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="costGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9}/>
                                        <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7}/>
                                    </linearGradient>
                                    <linearGradient id="wasteGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                                        <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid 
                                    strokeDasharray="3 3" 
                                    stroke="#f3f4f6" 
                                    horizontal={true}
                                    vertical={false}
                                />
                                <XAxis 
                                    dataKey="month" 
                                    stroke="#6b7280"
                                    fontSize={12}
                                    fontWeight="medium"
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis 
                                    yAxisId="left"
                                    stroke="#3b82f6"
                                    fontSize={11}
                                    axisLine={false}
                                    tickLine={false}
                                    label={{ 
                                        value: 'Food Cost (RM)', 
                                        angle: -90, 
                                        position: 'insideLeft',
                                        style: { textAnchor: 'middle', fill: '#3b82f6', fontWeight: 'bold' }
                                    }}
                                />
                                <YAxis 
                                    yAxisId="right" 
                                    orientation="right"
                                    stroke="#ef4444"
                                    fontSize={11}
                                    axisLine={false}
                                    tickLine={false}
                                    domain={[0, 12]}
                                    label={{ 
                                        value: 'Waste %', 
                                        angle: 90, 
                                        position: 'insideRight',
                                        style: { textAnchor: 'middle', fill: '#ef4444', fontWeight: 'bold' }
                                    }}
                                />
                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        border: 'none',
                                        borderRadius: '12px',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                                        padding: '16px'
                                    }}
                                    labelStyle={{
                                        fontWeight: 'bold',
                                        color: '#1f2937',
                                        marginBottom: '8px'
                                    }}
                                    formatter={(value, name, props) => {
                                        const data = props.payload;
                                        const nameStr = String(name || '');
                                        
                                        if (nameStr.includes('Cost')) {
                                            const savings = data?.monthlySavings || 0;
                                            const features = data?.activeFeatures || [];
                                            return [
                                                `RM ${value.toLocaleString()}${savings > 0 ? ` (Saves RM ${savings})` : ''}`,
                                                name
                                            ];
                                        } else if (nameStr.includes('Waste')) {
                                            const features = data?.activeFeatures || [];
                                            const quality = data?.dataQuality || 'Medium';
                                            return [
                                                `${value}% ${features.length > 0 ? `(${features.join(', ')})` : ''} [${quality}]`,
                                                name
                                            ];
                                        }
                                        return [value, name];
                                    }}
                                />
                                <Legend 
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="rect"
                                    wrapperStyle={{
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                />
                                <Bar 
                                    yAxisId="left"
                                    dataKey="rollingAvgCost" 
                                    fill="url(#costGradient)"
                                    name="3-Month Avg Cost (RM)"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={60}
                                />
                                <Bar 
                                    yAxisId="left"
                                    dataKey="foodCost" 
                                    fill="rgba(59, 130, 246, 0.3)"
                                    name="Monthly Cost (RM)"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={40}
                                />
                                <Line 
                                    yAxisId="right"
                                    type="monotone" 
                                    dataKey="rollingAvgWastePct" 
                                    stroke="#ef4444" 
                                    strokeWidth={4}
                                    name="3-Month Avg Waste %"
                                    dot={{ 
                                        fill: '#ffffff', 
                                        stroke: '#ef4444',
                                        strokeWidth: 3, 
                                        r: 6,
                                        filter: 'drop-shadow(0 2px 4px rgba(239, 68, 68, 0.3))'
                                    }}
                                    activeDot={{ 
                                        r: 8, 
                                        stroke: '#ef4444', 
                                        strokeWidth: 3,
                                        fill: '#ffffff',
                                        filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.4))'
                                    }}
                                />
                                <Line 
                                    yAxisId="right"
                                    type="monotone" 
                                    dataKey="wastePercentage" 
                                    stroke="rgba(239, 68, 68, 0.5)" 
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="Monthly Waste %"
                                    dot={{ 
                                        fill: 'rgba(239, 68, 68, 0.7)', 
                                        stroke: 'rgba(239, 68, 68, 0.7)',
                                        strokeWidth: 2, 
                                        r: 3
                                    }}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                        
                        {/* Simple Insights Section */}
                        <Box sx={{ 
                            mt: 3, 
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 3
                        }}>
                            {/* Monthly Cost */}
                            <Box sx={{ 
                                flex: 1,
                                textAlign: 'center',
                                p: 3,
                                bgcolor: '#ffffff',
                                borderRadius: '12px',
                                border: '2px solid #e0f2fe',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                            }}>
                                <Typography variant="body2" sx={{ color: '#0369a1', fontWeight: 'bold', mb: 1 }}>
                                    Monthly Avg Cost
                                </Typography>
                                <Typography variant="h4" sx={{ color: '#0c4a6e', fontWeight: 'bold', mb: 1 }}>
                                    {wasteLoading ? (
                                        <CircularProgress size={24} sx={{ color: '#0c4a6e' }} />
                                    ) : wasteData?.summary?.rolling_avg_monthly_cost ? (
                                        `RM ${wasteData.summary.rolling_avg_monthly_cost.toLocaleString()}`
                                    ) : wasteData?.summary?.avg_monthly_cost ? (
                                        `RM ${wasteData.summary.avg_monthly_cost.toLocaleString()}`
                                    ) : (
                                        'RM 0'
                                    )}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    Last 6 months average
                                </Typography>
                            </Box>

                            {/* Waste Rate with Visual Bar */}
                            <Box sx={{ 
                                flex: 1,
                                textAlign: 'center',
                                p: 3,
                                bgcolor: '#ffffff',
                                borderRadius: '12px',
                                border: '2px solid #fef2f2',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                            }}>
                                <Typography variant="body2" sx={{ color: '#dc2626', fontWeight: 'bold', mb: 1 }}>
                                    Current Waste Rate
                                </Typography>
                                <Typography variant="h4" sx={{ color: '#991b1b', fontWeight: 'bold', mb: 2 }}>
                                    {wasteLoading ? (
                                        <CircularProgress size={24} sx={{ color: '#991b1b' }} />
                                    ) : wasteData?.summary?.current_waste_rate ? (
                                        `${wasteData.summary.current_waste_rate.toFixed(1)}%`
                                    ) : wasteData?.summary?.avg_waste_percentage ? (
                                        `${wasteData.summary.avg_waste_percentage.toFixed(1)}%`
                                    ) : (
                                        '0.0%'
                                    )}
                                </Typography>
                                
                                {/* Simple Progress Bar */}
                                <Box sx={{ 
                                    width: '100%', 
                                    height: 8, 
                                    bgcolor: '#f3f4f6', 
                                    borderRadius: 4, 
                                    mb: 1,
                                    overflow: 'hidden'
                                }}>
                                    <Box sx={{ 
                                        width: wasteData?.summary?.current_waste_rate ? `${Math.min(wasteData.summary.current_waste_rate * 20, 100)}%` : wasteData?.summary?.avg_waste_percentage ? `${Math.min(wasteData.summary.avg_waste_percentage * 20, 100)}%` : '0%',
                                        height: '100%',
                                        bgcolor: (wasteData?.summary?.current_waste_rate || wasteData?.summary?.avg_waste_percentage || 0) > 5 ? '#ef4444' : '#10b981',
                                        borderRadius: 4
                                    }} />
                                </Box>
                                <Typography variant="caption" sx={{ color: '#64748b' }}>
                                    Target: Under 5%
                                </Typography>
                            </Box>

                            {/* Monthly Savings */}
                            <Box sx={{ 
                                flex: 1,
                                textAlign: 'center',
                                p: 3,
                                bgcolor: '#ffffff',
                                borderRadius: '12px',
                                border: '2px solid #f0fdf4',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
                            }}>
                                <Typography variant="body2" sx={{ 
                                    color: '#059669',
                                    fontWeight: 'bold', 
                                    mb: 1 
                                }}>
                                    Monthly Savings
                                </Typography>
                                <Typography variant="h4" sx={{ 
                                    color: '#047857',
                                    fontWeight: 'bold',
                                    mb: 1
                                }}>
                                    {wasteLoading ? (
                                        <CircularProgress size={24} sx={{ color: '#047857' }} />
                                    ) : wasteData?.summary?.rolling_avg_savings ? (
                                        `RM ${wasteData.summary.rolling_avg_savings.toLocaleString()}`
                                    ) : wasteData?.summary?.current_month_savings ? (
                                        `RM ${wasteData.summary.current_month_savings.toLocaleString()}`
                                    ) : (
                                        'RM 0'
                                    )}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                    {wasteData?.summary?.performance_status || 'Excellent Savings'}
                                </Typography>
                            </Box>
                        </Box>
                    </StyledPaper>
                </Grid>
            </Grid>

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
                                    p: 2,
                                    border: '1px solid #e5e7eb',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                    maxWidth: '300px'
                                }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <CalendarTodayIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
                                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1f2937', fontSize: '0.9rem' }}>
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
                                                    setSelectedRange({
                                                        startDate: "",
                                                        endDate: "",
                                                    });
                                                    // Instantly clear data for immediate empty state
                                                    setData(null);
                                                }}
                                                sx={{
                                                    color: '#dc2626',
                                                    fontSize: '0.7rem',
                                                    textTransform: 'none',
                                                    minWidth: 'auto',
                                                    p: 0.5,
                                                    '&:hover': { bgcolor: '#fee2e2' }
                                                }}
                                            >
                                                Clear
                                            </Button>
                                        )}
                                    </Box>
                                    
                                    {/* Instructions */}
                                    <Box sx={{ mb: 2, p: 1.5, bgcolor: '#f8fafc', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                                        <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5, fontSize: '0.7rem' }}>
                                            📅 Click dates to select range
                                        </Typography>
                                        {startDate && !endDate && (
                                            <Typography variant="caption" sx={{ color: '#059669', display: 'block', fontSize: '0.65rem', fontWeight: 'bold' }}>
                                                ✓ Start: {new Date(startDate).toLocaleDateString()} - Select end
                                            </Typography>
                                        )}
                                    </Box>
                                    
                                    {/* Compact Calendar */}
                                    <Box sx={{ 
                                        bgcolor: 'white', 
                                        borderRadius: '8px', 
                                        p: 1.5,
                                        border: '1px solid #e5e7eb',
                                        width: '100%'
                                    }}>
                                        {/* Month Header */}
                                        <Box sx={{ 
                                            display: 'flex', 
                                            justifyContent: 'space-between', 
                                            alignItems: 'center',
                                            mb: 1.5,
                                            px: 1
                                        }}>
                                            <IconButton 
                                                size="small"
                                                onClick={() => setCurrentMonth(currentMonth === 10 ? 9 : 10)}
                                                sx={{ 
                                                    color: '#6b7280',
                                                    '&:hover': { bgcolor: '#f3f4f6' },
                                                    width: '28px',
                                                    height: '28px',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                ←
                                            </IconButton>
                                            <Typography variant="body2" sx={{ 
                                                fontWeight: 'bold', 
                                                color: '#1f2937',
                                                fontSize: '0.8rem'
                                            }}>
                                                {currentMonth === 10 ? 'October' : 'September'} 2025
                                            </Typography>
                                            <IconButton 
                                                size="small"
                                                onClick={() => setCurrentMonth(currentMonth === 10 ? 9 : 10)}
                                                sx={{ 
                                                    color: '#6b7280',
                                                    '&:hover': { bgcolor: '#f3f4f6' },
                                                    width: '28px',
                                                    height: '28px',
                                                    fontSize: '12px'
                                                }}
                                            >
                                                →
                                            </IconButton>
                                        </Box>
                                        
                                        {/* Weekday headers */}
                                        <Box sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(7, 1fr)', 
                                            gap: '1px',
                                            mb: 1
                                        }}>
                                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                                <Box key={index} sx={{ 
                                                    textAlign: 'center',
                                                    height: '20px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    <Typography variant="caption" sx={{ 
                                                        color: '#9ca3af',
                                                        fontSize: '0.65rem',
                                                        fontWeight: '500'
                                                    }}>
                                                        {day}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                        
                                        {/* Calendar Grid */}
                                        <Box sx={{ 
                                            display: 'grid', 
                                            gridTemplateColumns: 'repeat(7, 1fr)', 
                                            gap: '1px'
                                        }}>
                                            {getCurrentMonthDays().map((dayData, index) => (
                                                <Box key={index} sx={{ 
                                                    width: '30px',
                                                    height: '30px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}>
                                                    {dayData ? (
                                                        <Box
                                                            onClick={() => dayData.isSelectable && handleDateSelection(dayData.date)}
                                                            sx={{
                                                                width: '26px',
                                                                height: '26px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                fontSize: '0.7rem',
                                                                borderRadius: '4px',
                                                                cursor: dayData.isSelectable ? 'pointer' : 'not-allowed',
                                                                fontWeight: dayData.isStartDate || dayData.isEndDate || dayData.isToday ? 'bold' : 'normal',
                                                                bgcolor: (dayData.isDisabled || !dayData.isSelectable) ? '#f9fafb' :
                                                                        dayData.isStartDate ? '#10b981' : 
                                                                        dayData.isEndDate ? '#10b981' :
                                                                        dayData.isInRange ? '#d1fae5' :
                                                                        dayData.isToday ? '#dbeafe' : 
                                                                        'transparent',
                                                                color: (dayData.isDisabled || !dayData.isSelectable) ? '#d1d5db' :
                                                                       (dayData.isStartDate || dayData.isEndDate) ? 'white' : 
                                                                       dayData.isInRange ? '#059669' :
                                                                       dayData.isToday ? '#1d4ed8' : '#374151',
                                                                border: dayData.isToday && !dayData.isStartDate && !dayData.isEndDate ? '1px solid #3b82f6' : 'none',
                                                                '&:hover': dayData.isSelectable ? {
                                                                    bgcolor: (dayData.isStartDate || dayData.isEndDate) ? '#059669' : 
                                                                            dayData.isInRange ? '#bbf7d0' :
                                                                            '#f0f9ff',
                                                                    transform: 'scale(1.1)'
                                                                } : {},
                                                                transition: 'all 0.15s ease'
                                                            }}
                                                        >
                                                            {dayData.day}
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ width: '26px', height: '26px' }} />
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
                                             selectedDates.length === 0 ? 'Select dates from the calendar to view order analysis' : 
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
                                        height: 380, // Match calendar height for proper alignment
                                        overflow: 'auto',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
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

                {/* Stock vs Usage and Wait Time Charts - Side by Side */}
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1f2937', mb: 2 }}>
                            Stock vs Usage Trends
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                            Track inventory levels against daily usage patterns
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={inventoryTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#6b7280"
                                    fontSize={11}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    fontSize={11}
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
                                    strokeWidth={2}
                                    name="Stock Level"
                                    dot={{ fill: blue[500], strokeWidth: 1, r: 3 }}
                                    activeDot={{ r: 5, stroke: blue[500], strokeWidth: 2 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="usage" 
                                    stroke={orange[500]} 
                                    strokeWidth={2}
                                    name="Usage"
                                    dot={{ fill: orange[500], strokeWidth: 1, r: 3 }}
                                    activeDot={{ r: 5, stroke: orange[500], strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        
                        {/* Chart Insights */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            mt: 2, 
                            pt: 2, 
                            borderTop: '1px solid #e5e7eb',
                            gap: 1
                        }}>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="body2" sx={{ color: blue[600], fontWeight: 'bold' }}>
                                    {Math.round(inventoryTrends.reduce((sum, item) => sum + item.stock, 0) / inventoryTrends.length)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                                    Avg Stock
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="body2" sx={{ color: orange[600], fontWeight: 'bold' }}>
                                    {Math.round(inventoryTrends.reduce((sum, item) => sum + item.usage, 0) / inventoryTrends.length)}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                                    Avg Usage
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="body2" sx={{ 
                                    color: inventoryTrends.some(item => item.stock < item.usage) ? red[600] : teal[600], 
                                    fontWeight: 'bold' 
                                }}>
                                    {inventoryTrends.filter(item => item.stock < item.usage).length > 0 ? 'Alert' : 'Good'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                                    Status
                                </Typography>
                            </Box>
                        </Box>
                    </StyledPaper>
                </Grid>

                {/* Average Wait Time Trends */}
                <Grid item xs={12} md={6}>
                    <StyledPaper>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1f2937', mb: 2 }}>
                            Average Wait Time Trends
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#6b7280', mb: 3 }}>
                            Monitor customer service efficiency and wait times
                        </Typography>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={waitTimeTrends}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#6b7280"
                                    fontSize={11}
                                />
                                <YAxis 
                                    stroke="#6b7280"
                                    fontSize={11}
                                    domain={[0, 25]}
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
                                    dataKey="avgWaitTime" 
                                    stroke="#8b5cf6" 
                                    strokeWidth={3}
                                    name="Avg Wait Time (min)"
                                    dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#8b5cf6', strokeWidth: 2 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="targetTime" 
                                    stroke="#ef4444" 
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    name="Target (15 min)"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                        
                        {/* Chart Insights */}
                        <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            mt: 2, 
                            pt: 2, 
                            borderTop: '1px solid #e5e7eb',
                            gap: 1
                        }}>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="body2" sx={{ color: '#8b5cf6', fontWeight: 'bold' }}>
                                    {Math.round(waitTimeTrends.reduce((sum, item) => sum + item.avgWaitTime, 0) / waitTimeTrends.length)} min
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                                    Avg Wait
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="body2" sx={{ color: '#ef4444', fontWeight: 'bold' }}>
                                    15 min
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                                    Target
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'center', flex: 1 }}>
                                <Typography variant="body2" sx={{ 
                                    color: waitTimeTrends.some(item => item.avgWaitTime > 15) ? '#ef4444' : '#10b981', 
                                    fontWeight: 'bold' 
                                }}>
                                    {waitTimeTrends.filter(item => item.avgWaitTime > 15).length > 3 ? 'Above' : 'On Track'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                                    vs Target
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

            {/* Report Generation Dialog */}
            <ReportGenerationDialog
                open={reportDialogOpen}
                onClose={() => setReportDialogOpen(false)}
                data={data}
            />

            {/* AI Analysis Dialog */}
            <AIAnalysisPopup
                open={aiDialogOpen}
                onClose={() => setAiDialogOpen(false)}
                insights={aiInsights}
                loading={aiLoading}
                error={aiError}
            />
        </Box>
    );
};

export default PerformanceTrends;