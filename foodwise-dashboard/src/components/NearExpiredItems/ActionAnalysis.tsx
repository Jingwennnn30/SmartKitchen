import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Cell } from 'recharts';

interface ActionAnalysisProps {
    data: {
        name: string;
        value: number;
        color: string;
    }[];
}

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '10px',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    marginTop: theme.spacing(3)
}));

const ActionAnalysis: React.FC<ActionAnalysisProps> = ({ data }) => {
    return (
        <StyledPaper>
            <Typography variant="h6" gutterBottom>
                Action Taken Analysis
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <PieChart width={300} height={300}>
                    <Pie
                        data={data}
                        cx={150}
                        cy={150}
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                    </Pie>
                </PieChart>
            </Box>
        </StyledPaper>
    );
};

export default ActionAnalysis;