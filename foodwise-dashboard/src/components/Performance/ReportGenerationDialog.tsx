// src/components/Performance/ReportGenerationDialog.tsx

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Divider,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  InsertChart as InsertChartIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { ReportService } from '../../services/reportService';
import { PerformanceResponse } from '../../services/performanceService';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    margin: theme.spacing(2),
  }
}));

const ReportCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  border: '2px solid transparent',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    borderColor: theme.palette.primary.main,
  },
  '&.generating': {
    pointerEvents: 'none',
    opacity: 0.7,
  }
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: 48,
  height: 48,
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '24px',
  marginBottom: theme.spacing(1),
}));

interface ReportGenerationDialogProps {
  open: boolean;
  onClose: () => void;
  data: PerformanceResponse | null;
}

const ReportGenerationDialog: React.FC<ReportGenerationDialogProps> = ({
  open,
  onClose,
  data
}) => {
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleGenerateReport = async (type: 'daily' | 'weekly' | 'monthly') => {
    try {
      if (!data) return;
      setError(null);
      setSuccess(null);
      setGeneratingReport(type);

      const datePayload = {
        selectedStartDate: data.selectedStartDate,
        selectedEndDate: data.selectedEndDate
      };

      switch (type) {
        case 'daily':
          await ReportService.generateDailyReport(datePayload);
          setSuccess('Daily report generated successfully!');
          break;
        case 'weekly':
          await ReportService.generateWeeklyReport(datePayload);
          setSuccess('Weekly report generated successfully!');
          break;
        case 'monthly':
          await ReportService.generateMonthlyReport(datePayload);
          setSuccess('Monthly report generated successfully!');
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate report');
    } finally {
      setGeneratingReport(null);
    }
  };

  const handleClose = () => {
    if (!generatingReport) {
      setError(null);
      setSuccess(null);
      onClose();
    }
  };

  const reportTypes = [
    {
      type: 'daily' as const,
      name: 'Today’s Performance Report',
      buttonText: 'Generate Today’s Report',
      icon: <AssessmentIcon sx={{ fontSize: 24 }} />,
      color: '#3f51b5',
      subtitle: 'Daily',
      description: 'Summarizes key metrics from the current day.',
      estimatedTime: '10-15 seconds'
    },
    {
      type: 'weekly' as const,
      name: 'Weekly Performance Report',
      buttonText: 'Generate Weekly Report',
      icon: <TrendingUpIcon sx={{ fontSize: 24 }} />,
      color: '#4caf50',
      subtitle: 'Weekly',
      description: 'Provides insights into weekly performance trends.',
      estimatedTime: '15-30 seconds'
    },
    {
      type: 'monthly' as const,
      name: 'Monthly Performance Report',
      buttonText: 'Generate Monthly Report',
      icon: <InsertChartIcon sx={{ fontSize: 24 }} />,
      color: '#f44336',
      subtitle: 'Monthly',
      description: 'Detailed analytics for the current or selected month.',
      estimatedTime: '30-45 seconds'
    }
  ];

  return (
    <StyledDialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{
        pb: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        m: 0
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon />
          <Typography variant="h6" component="div" fontWeight="bold">
            Report Generation Center
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={!!generatingReport}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Typography variant="body1" sx={{ mb: 3, color: '#6b7280' }}>
          Select the type of performance report you'd like to generate. Each report provides detailed insights tailored to your analysis needs.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {reportTypes.map((report) => (
            <ReportCard
              key={report.type}
              className={generatingReport === report.type ? 'generating' : ''}
              onClick={() => handleGenerateReport(report.type)}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <IconWrapper sx={{ backgroundColor: `${report.color}20`, color: report.color }}>
                    {generatingReport === report.type ? (
                      <CircularProgress size={24} sx={{ color: report.color }} />
                    ) : (
                      report.icon
                    )}
                  </IconWrapper>

                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" fontWeight="bold" sx={{ color: '#1f2937' }}>
                        {report.name}
                      </Typography>
                      <Box
                        sx={{
                          backgroundColor: `${report.color}20`,
                          color: report.color,
                          px: 1,
                          py: 0.25,
                          fontSize: '0.75rem',
                          borderRadius: '6px',
                          fontWeight: 'bold',
                        }}
                      >
                        {report.subtitle}
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#6b7280', mb: 2 }}>
                      {report.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <ScheduleIcon sx={{ fontSize: 16, color: '#9ca3af' }} />
                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                          {generatingReport === report.type ? 'Generating...' : report.estimatedTime}
                        </Typography>
                      </Box>

                      {generatingReport === report.type && (
                        <Typography variant="caption" sx={{ color: report.color, fontWeight: 'bold' }}>
                          Processing your request...
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </ReportCard>
          ))}
        </Box>

        <Divider sx={{ my: 3 }} />

        <Alert severity="info" variant="outlined">
          Reports are downloaded automatically upon generation. If your download doesn’t start, please check your pop-up settings or try again.
        </Alert>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={!!generatingReport} variant="outlined">
          Close
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ReportGenerationDialog;
