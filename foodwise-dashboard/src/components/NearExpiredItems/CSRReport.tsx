import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

interface CSRData {
    method: string;
    amount: string;
    savedVia: string;
}

interface CSRReportProps {
    data: CSRData[];
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    marginTop: theme.spacing(3)
}));

const SavedItem = styled(Box)(({ theme }) => ({
    backgroundColor: '#F0FFE6',
    padding: theme.spacing(2),
    borderRadius: '8px',
    marginBottom: theme.spacing(1)
}));

const CSRReport: React.FC<CSRReportProps> = ({ data }) => {
    return (
        <StyledPaper>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    CSR Report
                </Typography>
                <Button variant="outlined" size="small">
                    Export as PDF
                </Button>
            </Box>
            <Box>
                {data.map((item, index) => (
                    <SavedItem key={index}>
                        <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                            {item.amount}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Saved via {item.savedVia}
                        </Typography>
                    </SavedItem>
                ))}
            </Box>
        </StyledPaper>
    );
};

export default CSRReport;