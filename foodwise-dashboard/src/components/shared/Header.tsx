import React from 'react';
import { AppBar, Toolbar, IconButton, Box, Select, MenuItem } from '@mui/material';
import { styled } from '@mui/material/styles';
import NotificationsIcon from '@mui/icons-material/Notifications';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: '#ffffff',
    boxShadow: '0px 1px 4px rgba(0, 0, 0, 0.1)',
    zIndex: theme.zIndex.drawer - 1,
    height: 64,
    width: 'calc(100% - 240px)',
    marginLeft: '240px'
}));

const BranchSelect = styled(Select)(({ theme }) => ({
    color: 'white',
    '.MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: 'rgba(255, 255, 255, 0.7)',
    },
    '.MuiSelect-icon': {
        color: 'white',
    },
}));

const Header = () => {
    return (
        <StyledAppBar position="fixed">
            <Toolbar sx={{ minHeight: '64px' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
                    <BranchSelect
                        value="KL Branch"
                        size="small"
                        sx={{
                            width: 150,
                            color: 'rgba(0, 0, 0, 0.87)',
                            '.MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.23)',
                            },
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'rgba(0, 0, 0, 0.87)',
                            },
                            '.MuiSelect-icon': {
                                color: 'rgba(0, 0, 0, 0.54)',
                            },
                        }}
                    >
                        <MenuItem value="KL Branch">KL Branch</MenuItem>
                    </BranchSelect>
                    <IconButton>
                        <NotificationsIcon />
                    </IconButton>
                </Box>
            </Toolbar>
        </StyledAppBar>
    );
};

export default Header;