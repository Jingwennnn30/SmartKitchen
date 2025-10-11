import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    LinearProgress,
    Grid,
    IconButton,
    Alert,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Close as CloseIcon,
    TrendingUp as TrendingUpIcon,
    TrendingDown as TrendingDownIcon,
    TrendingFlat as TrendingFlatIcon,
    Warning as WarningIcon,
    CheckCircle as CheckCircleIcon,
    Info as InfoIcon,
    Lightbulb as LightbulbIcon,
    Assessment as AssessmentIcon,
    AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { AIInsightsResponse } from '../../services/performanceService';

interface AIAnalysisPopupProps {
    open: boolean;
    onClose: () => void;
    insights: AIInsightsResponse | null;
    loading: boolean;
    error: string | null;
}

const AIAnalysisPopup: React.FC<AIAnalysisPopupProps> = ({
    open,
    onClose,
    insights,
    loading,
    error
}) => {
    // Helper function to safely access AI insights data
    const getAIData = (): any => {
        const data = insights as any;
        
        // Check if we have the proper AI insights structure from Nova Pro Lambda
        if (data?.ai_insights) {
            console.log('✅ Using real AI insights from Nova Pro Lambda');
            return data.ai_insights;
        }
        
        // If we're getting waste analysis data instead of AI insights, create a fallback structure
        if (data?.waste_analysis && data?.summary && data?.insights) {
            console.log('⚠️ AI endpoint returning waste data - creating fallback AI structure');
            return {
                analysis_text: `## AI Analysis Summary\n\n**Performance Status**: ${data.summary.performance_status || 'Unknown'}\n\n**Current Performance**:\n• Average waste rate: ${(data.summary.avg_waste_percentage || 0).toFixed(1)}%\n• Average monthly cost: RM ${(data.summary.avg_monthly_cost || 0).toLocaleString()}\n• Performance trend: ${data.summary.performance_trend || 'stable'}\n\n**Key Insights**:\n${(data.insights || []).map((insight: string, i: number) => `${i + 1}. ${insight}`).join('\n')}\n\n**Note**: This is generated from waste analysis data. For comprehensive AI insights, please ensure the API Gateway is configured correctly.`,
                key_metrics: {
                    current_waste_rate: data.summary?.avg_waste_percentage || 0,
                    target_waste_rate: 5.0,
                    monthly_avg_cost: data.summary?.avg_monthly_cost || 0,
                    trend_direction: data.summary?.performance_trend === 'improving' ? 'decreasing' : 
                                   data.summary?.performance_trend === 'concerning' ? 'increasing' : 'stable',
                    trend_percentage: 0,
                    performance_status: data.summary?.performance_status || 'Unknown'
                },
                quick_insights: (data.insights || []).slice(0, 3),
                recommendations: (data.insights || []).slice(3).length > 0 ? (data.insights || []).slice(3) : [
                    'Monitor waste levels daily to identify trends',
                    'Review inventory management processes',
                    'Implement staff training on portion control',
                    'Consider donation programs for surplus food'
                ],
                risk_level: (data.summary?.avg_waste_percentage || 0) > 8 ? 'high' : 
                           (data.summary?.avg_waste_percentage || 0) > 5 ? 'medium' : 'low',
                savings_potential: {
                    monthly_potential: Math.max(0, ((data.summary?.avg_waste_percentage || 0) - 3) * 
                                                  (data.summary?.avg_monthly_cost || 0) / 100),
                    annual_potential: Math.max(0, ((data.summary?.avg_waste_percentage || 0) - 3) * 
                                               (data.summary?.avg_monthly_cost || 0) * 12 / 100),
                    percentage_reduction: Math.max(0, (data.summary?.avg_waste_percentage || 0) - 3)
                },
                data_quality_score: (data.summary?.total_items_analyzed || 0) > 100 ? 85 : 70
            };
        }
        
        // Final fallback
        console.log('❌ No usable data structure found');
        return {};
    };

    const getRiskColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low': return '#10b981';
            case 'medium': return '#f59e0b';
            case 'high': return '#ef4444';
            case 'critical': return '#dc2626';
            default: return '#6b7280';
        }
    };

    const getRiskIcon = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low': return <CheckCircleIcon sx={{ color: '#10b981' }} />;
            case 'medium': return <InfoIcon sx={{ color: '#f59e0b' }} />;
            case 'high': return <WarningIcon sx={{ color: '#ef4444' }} />;
            case 'critical': return <WarningIcon sx={{ color: '#dc2626' }} />;
            default: return <InfoIcon sx={{ color: '#6b7280' }} />;
        }
    };

    const getTrendIcon = (trendDirection: string) => {
        switch (trendDirection) {
            case 'increasing': return <TrendingUpIcon sx={{ color: '#ef4444' }} />;
            case 'decreasing': return <TrendingDownIcon sx={{ color: '#10b981' }} />;
            default: return <TrendingFlatIcon sx={{ color: '#6b7280' }} />;
        }
    };

    const formatCurrency = (amount: number) => {
        return `RM ${amount.toLocaleString()}`;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: '16px',
                    maxHeight: '90vh',
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e5e7eb'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AssessmentIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                        AI Waste Analysis
                    </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: '#6b7280' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ padding: 3 }}>
                {loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                        <CircularProgress />
                        <Typography sx={{ ml: 2 }}>Analyzing waste data with AI...</Typography>
                    </Box>
                )}

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {!loading && insights && (
                    <Box>

                        
                        {insights && (
                            <Box>
                        {/* Key Metrics Cards */}
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            <Grid item xs={12} md={3}>
                                <Card sx={{ 
                                    backgroundColor: '#fef2f2', 
                                    border: '1px solid #fecaca',
                                    borderRadius: '12px'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography variant="caption" sx={{ color: '#991b1b', fontWeight: 'bold' }}>
                                            Current Waste Rate
                                        </Typography>
                                        <Typography variant="h4" sx={{ color: '#dc2626', fontWeight: 'bold', my: 1 }}>
                                            {getAIData().key_metrics?.current_waste_rate?.toFixed(1) || '0.0'}%
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                            Target: {getAIData().key_metrics?.target_waste_rate || 5}%
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Card sx={{ 
                                    backgroundColor: '#f0f9ff', 
                                    border: '1px solid #bae6fd',
                                    borderRadius: '12px'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography variant="caption" sx={{ color: '#0369a1', fontWeight: 'bold' }}>
                                            Monthly Avg Cost
                                        </Typography>
                                        <Typography variant="h5" sx={{ color: '#0c4a6e', fontWeight: 'bold', my: 1 }}>
                                            {formatCurrency(getAIData().key_metrics?.monthly_avg_cost || 0)}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                            Last 6 months
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Card sx={{ 
                                    backgroundColor: getRiskColor(getAIData().risk_level || 'medium') + '15', 
                                    border: `1px solid ${getRiskColor(getAIData().risk_level || 'medium')}30`,
                                    borderRadius: '12px'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography variant="caption" sx={{ color: getRiskColor(getAIData().risk_level || 'medium'), fontWeight: 'bold' }}>
                                            Risk Level
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 1, gap: 1 }}>
                                            {getRiskIcon(getAIData().risk_level || 'medium')}
                                            <Typography variant="h6" sx={{ color: getRiskColor(getAIData().risk_level || 'medium'), fontWeight: 'bold', textTransform: 'capitalize' }}>
                                                {getAIData().risk_level || 'medium'}
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#6b7280' }}>
                                            {getAIData().key_metrics?.performance_status || 'Unknown'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <Card sx={{ 
                                    backgroundColor: '#f0fdf4', 
                                    border: '1px solid #bbf7d0',
                                    borderRadius: '12px'
                                }}>
                                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                        <Typography variant="caption" sx={{ color: '#166534', fontWeight: 'bold' }}>
                                            Trend
                                        </Typography>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 1, gap: 1 }}>
                                            {getTrendIcon(getAIData().key_metrics?.trend_direction || 'stable')}
                                            <Typography variant="h6" sx={{ color: '#047857', fontWeight: 'bold' }}>
                                                {Math.abs(getAIData().key_metrics?.trend_percentage || 0)}%
                                            </Typography>
                                        </Box>
                                        <Typography variant="caption" sx={{ color: '#6b7280', textTransform: 'capitalize' }}>
                                            {getAIData().key_metrics?.trend_direction || 'stable'}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        {/* Quick Insights */}
                        <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ 
                                    mb: 3, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    fontWeight: 'bold',
                                    color: '#1f2937'
                                }}>
                                    <InfoIcon sx={{ color: '#3b82f6', fontSize: 24 }} />
                                    Key Insights
                                </Typography>
                                <Grid container spacing={2}>
                                    {(getAIData().quick_insights || []).slice(0, 3).map((insight: string, index: number) => (
                                        <Grid item xs={12} key={index}>
                                            <Card sx={{ 
                                                backgroundColor: '#f8fafc',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '12px',
                                                transition: 'all 0.3s ease',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                                                }
                                            }}>
                                                <CardContent sx={{ p: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                        <Box sx={{
                                                            width: 32,
                                                            height: 32,
                                                            borderRadius: '50%',
                                                            backgroundColor: '#3b82f6',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0
                                                        }}>
                                                            <Typography variant="body2" sx={{ 
                                                                color: 'white', 
                                                                fontWeight: 'bold' 
                                                            }}>
                                                                {index + 1}
                                                            </Typography>
                                                        </Box>
                                                        <Typography variant="body2" sx={{ 
                                                            color: '#374151',
                                                            lineHeight: 1.6,
                                                            flex: 1
                                                        }}>
                                                            {insight.replace(/^\*\*.*?\*\*:\s*/, '')}
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Savings Potential */}
                        {getAIData().savings_potential && getAIData().savings_potential?.monthly_potential > 0 && (
                            <Card sx={{ mb: 3, borderRadius: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                                <CardContent>
                                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1, color: '#166534' }}>
                                        <AttachMoneyIcon />
                                        Savings Potential
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={4}>
                                            <Typography variant="body2" sx={{ color: '#059669', fontWeight: 'bold' }}>
                                                Monthly Savings
                                            </Typography>
                                            <Typography variant="h5" sx={{ color: '#047857', fontWeight: 'bold' }}>
                                                {formatCurrency(getAIData().savings_potential?.monthly_potential || 0)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="body2" sx={{ color: '#059669', fontWeight: 'bold' }}>
                                                Annual Potential
                                            </Typography>
                                            <Typography variant="h5" sx={{ color: '#047857', fontWeight: 'bold' }}>
                                                {formatCurrency(getAIData().savings_potential?.annual_potential || 0)}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={4}>
                                            <Typography variant="body2" sx={{ color: '#059669', fontWeight: 'bold' }}>
                                                Reduction Target
                                            </Typography>
                                            <Typography variant="h5" sx={{ color: '#047857', fontWeight: 'bold' }}>
                                                {getAIData().savings_potential?.percentage_reduction || 0}%
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}

                        {/* Recommendations */}
                        <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ 
                                    mb: 3, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    fontWeight: 'bold',
                                    color: '#1f2937'
                                }}>
                                    <LightbulbIcon sx={{ color: '#f59e0b', fontSize: 24 }} />
                                    AI Recommendations
                                </Typography>
                                <Grid container spacing={2}>
                                    {(getAIData().recommendations || []).slice(0, 6).map((recommendation: string, index: number) => {
                                        // Extract title and content from markdown-style text
                                        const titleMatch = recommendation.match(/^\*\*(.*?)\*\*:\s*(.*)/);
                                        const title = titleMatch ? titleMatch[1] : `Recommendation ${index + 1}`;
                                        const content = titleMatch ? titleMatch[2] : recommendation;
                                        
                                        return (
                                            <Grid item xs={12} md={6} key={index}>
                                                <Card sx={{ 
                                                    height: '100%',
                                                    backgroundColor: '#fefbf3',
                                                    border: '1px solid #fed7aa',
                                                    borderRadius: '12px',
                                                    transition: 'all 0.3s ease',
                                                    '&:hover': {
                                                        transform: 'translateY(-2px)',
                                                        boxShadow: '0 8px 24px rgba(245,158,11,0.15)'
                                                    }
                                                }}>
                                                    <CardContent sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 1 }}>
                                                            <Box sx={{
                                                                width: 28,
                                                                height: 28,
                                                                borderRadius: '8px',
                                                                backgroundColor: '#f59e0b',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                flexShrink: 0
                                                            }}>
                                                                <Typography variant="caption" sx={{ 
                                                                    color: 'white', 
                                                                    fontWeight: 'bold',
                                                                    fontSize: '12px'
                                                                }}>
                                                                    {index + 1}
                                                                </Typography>
                                                            </Box>
                                                            <Box sx={{ flex: 1 }}>
                                                                <Typography variant="subtitle2" sx={{ 
                                                                    color: '#92400e',
                                                                    fontWeight: 'bold',
                                                                    mb: 1,
                                                                    fontSize: '14px'
                                                                }}>
                                                                    {title}
                                                                </Typography>
                                                                <Typography variant="body2" sx={{ 
                                                                    color: '#374151',
                                                                    lineHeight: 1.5,
                                                                    fontSize: '13px'
                                                                }}>
                                                                    {content}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Detailed Analysis */}
                        <Card sx={{ borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ 
                                    mb: 3, 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: 1,
                                    fontWeight: 'bold',
                                    color: '#1f2937'
                                }}>
                                    <AssessmentIcon sx={{ color: '#8b5cf6', fontSize: 24 }} />
                                    Comprehensive Analysis
                                </Typography>
                                
                                {/* Enhanced structured analysis display */}
                                {(() => {
                                    const analysisText = getAIData().analysis_text || 'Analysis unavailable';
                                    const lines = analysisText.split('\n');
                                    
                                    // Parse sections from the AI analysis
                                    const sections: { [key: string]: string[] } = {};
                                    let currentSection = 'General';
                                    
                                    lines.forEach((line: string) => {
                                        const trimmed = line.trim();
                                        if (trimmed.includes('EXECUTIVE SUMMARY') || trimmed.includes('Executive Summary')) {
                                            currentSection = 'Executive Summary';
                                            sections[currentSection] = [];
                                        } else if (trimmed.includes('PERFORMANCE STATUS') || trimmed.includes('Performance Status')) {
                                            currentSection = 'Performance Status';
                                            sections[currentSection] = [];
                                        } else if (trimmed.includes('KEY OPPORTUNITIES') || trimmed.includes('Key Opportunities')) {
                                            currentSection = 'Key Opportunities';
                                            sections[currentSection] = [];
                                        } else if (trimmed.includes('IMMEDIATE ACTIONS') || trimmed.includes('Immediate Actions')) {
                                            currentSection = 'Immediate Actions';
                                            sections[currentSection] = [];
                                        } else if (trimmed.includes('3D FEATURE IMPACT') || trimmed.includes('Feature Impact')) {
                                            currentSection = '3D Feature Impact';
                                            sections[currentSection] = [];
                                        } else if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                                            if (!sections[currentSection]) sections[currentSection] = [];
                                            sections[currentSection].push(trimmed.replace(/^[•-]\s*/, ''));
                                        } else if (trimmed && !trimmed.startsWith('**')) {
                                            if (!sections[currentSection]) sections[currentSection] = [];
                                            sections[currentSection].push(trimmed);
                                        }
                                    });

                                    const getSectionIcon = (sectionName: string) => {
                                        switch (sectionName) {
                                            case 'Executive Summary': return '📊';
                                            case 'Performance Status': return '🎯';
                                            case 'Key Opportunities': return '💡';
                                            case 'Immediate Actions': return '⚡';
                                            case '3D Feature Impact': return '🚀';
                                            default: return '📈';
                                        }
                                    };

                                    const getSectionColor = (sectionName: string) => {
                                        switch (sectionName) {
                                            case 'Executive Summary': return '#3b82f6';
                                            case 'Performance Status': return '#10b981';
                                            case 'Key Opportunities': return '#f59e0b';
                                            case 'Immediate Actions': return '#ef4444';
                                            case '3D Feature Impact': return '#8b5cf6';
                                            default: return '#6b7280';
                                        }
                                    };

                                    return (
                                        <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
                                            {Object.entries(sections).map(([sectionName, items], sectionIndex) => (
                                                <Card key={sectionIndex} sx={{ 
                                                    mb: 2, 
                                                    border: `2px solid ${getSectionColor(sectionName)}20`,
                                                    borderRadius: '12px',
                                                    backgroundColor: `${getSectionColor(sectionName)}08`
                                                }}>
                                                    <CardContent sx={{ p: 2.5 }}>
                                                        <Typography variant="h6" sx={{ 
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            mb: 2,
                                                            color: getSectionColor(sectionName),
                                                            fontWeight: '700',
                                                            fontSize: '1.1rem'
                                                        }}>
                                                            <span style={{ fontSize: '1.3rem' }}>{getSectionIcon(sectionName)}</span>
                                                            {sectionName}
                                                        </Typography>
                                                        
                                                        <List sx={{ p: 0 }}>
                                                            {items.map((item, itemIndex) => (
                                                                <ListItem key={itemIndex} sx={{ 
                                                                    py: 0.5, 
                                                                    px: 0,
                                                                    alignItems: 'flex-start'
                                                                }}>
                                                                    <ListItemIcon sx={{ minWidth: '24px', mt: 0.5 }}>
                                                                        <Box sx={{
                                                                            width: 6,
                                                                            height: 6,
                                                                            borderRadius: '50%',
                                                                            backgroundColor: getSectionColor(sectionName),
                                                                        }} />
                                                                    </ListItemIcon>
                                                                    <ListItemText 
                                                                        primary={
                                                                            <Typography variant="body2" sx={{ 
                                                                                color: '#374151',
                                                                                lineHeight: 1.6,
                                                                                fontWeight: '500',
                                                                                '& strong': {
                                                                                    color: getSectionColor(sectionName),
                                                                                    fontWeight: '700'
                                                                                }
                                                                            }}>
                                                                                {item.includes(':') ? (
                                                                                    <>
                                                                                        <strong>{item.split(':')[0]}:</strong>
                                                                                        {item.split(':').slice(1).join(':')}
                                                                                    </>
                                                                                ) : item}
                                                                            </Typography>
                                                                        }
                                                                    />
                                                                </ListItem>
                                                            ))}
                                                        </List>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </Box>
                                    );
                                })()}

                                {/* Data Quality Score */}
                                {getAIData().data_quality_score && (
                                    <Box sx={{ mt: 3, p: 2, backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="subtitle2" sx={{ color: '#166534', fontWeight: 'bold' }}>
                                                Data Quality Score
                                            </Typography>
                                            <Typography variant="h6" sx={{ color: '#059669', fontWeight: 'bold' }}>
                                                {getAIData().data_quality_score || 0}/100
                                            </Typography>
                                        </Box>
                                        <LinearProgress 
                                            variant="determinate" 
                                            value={getAIData().data_quality_score || 0} 
                                            sx={{ 
                                                height: 8, 
                                                borderRadius: 4,
                                                backgroundColor: '#dcfce7',
                                                '& .MuiLinearProgress-bar': {
                                                    backgroundColor: (getAIData().data_quality_score || 0) > 80 ? '#10b981' : 
                                                                   (getAIData().data_quality_score || 0) > 60 ? '#f59e0b' : '#ef4444',
                                                    borderRadius: 4
                                                }
                                            }}
                                        />
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            <DialogActions sx={{ 
                p: 3, 
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e5e7eb'
            }}>
                <Button 
                    onClick={onClose} 
                    variant="contained" 
                    sx={{ 
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    Close Analysis
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AIAnalysisPopup;