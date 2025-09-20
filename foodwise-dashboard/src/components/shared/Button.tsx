import React from 'react';
import { ButtonProps as MuiButtonProps, Button as MuiButton } from '@mui/material';

interface ButtonProps extends MuiButtonProps {
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => {
  return (
    <MuiButton {...props}>
      {children}
    </MuiButton>
  );
};

export default Button;