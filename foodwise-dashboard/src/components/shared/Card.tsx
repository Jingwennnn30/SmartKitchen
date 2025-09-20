import React from 'react';
import { Card as MuiCard, CardProps as MuiCardProps, CardContent } from '@mui/material';

interface CardProps extends MuiCardProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({ children, ...props }) => {
  return (
    <MuiCard {...props}>
      <CardContent>
        {children}
      </CardContent>
    </MuiCard>
  );
};

export default Card;