import { Button, InputLabel, Switch, Tab } from '@mui/material';
import { styled } from '@mui/material/styles';

export const AntSwitch = styled(Switch)(({ theme }) => ({
    width: 28,
    height: 16,
    padding: 0,
    display: 'flex',
    '&:active': {
        '& .MuiSwitch-thumb': {
            width: 15,
        },
        '& .MuiSwitch-switchBase.Mui-checked': {
            transform: 'translateX(9px)',
        },
    },
    '& .MuiSwitch-switchBase': {
        padding: 2,
        color: '#fff',
        '&.Mui-checked': {
            transform: 'translateX(12px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
                opacity: 1,
                border: '1px solid rgb(70, 92, 110)',
                backgroundColor: '#101010 !important',
            },
        },
    },
    '& .MuiSwitch-thumb': {
        boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
        width: 12,
        height: 12,
        borderRadius: 6,
        transition: theme.transitions.create(['width'], {
            duration: 200,
        }),
    },
    '& .MuiSwitch-track': {
        borderRadius: 16 / 2,
        opacity: 1,
        backgroundColor:
            theme.palette.mode === 'dark'
                ? 'rgba(255,255,255,.35)'
                : 'rgba(0,0,0,.25)',
        boxSizing: 'border-box',
    },
}));

export const DockerButton = styled(Button)({
    '&': {
        backgroundColor: '#101010',
    },
    '&:hover': {
        backgroundColor: '#333333',
    },
});

export const ViewLogsButton = styled(Button)((props) => ({
    '&': {
        border: '1px solid #EAEAEA',
        color: props.theme.palette.mode === 'dark' ? '#fff' : '#333333',
        fontWeight: '510',
    },
    '&:hover': {
        border: '1px solid #101010',
        backgroundColor: 'transparent !important',
    },
    '&:focus': {
        outline: 'none !important',
        boxShadow: 'none !important',
        backgroundColor: 'transparent !important',
        border: '1px solid #101010',
    },
}));

export const StopButton = styled(Button)((props) => ({
    '&': {
        border: '1px solid #EAEAEA',
        color: props.theme.palette.mode === 'dark' ? '#fff' : '#333333',
        fontWeight: '510',
    },
    '&>span': {
        color: '#EB4646',
    },
    '&:hover': {
        backgroundColor: '#EB4646 !important',
        color: '#FFFFFF',
        '&>span': {
            color: '#FFFFFF',
        },
        border: '1px solid #EB4646',
    },
}));

export const StyledTab = styled(Tab)((props) => ({
    '&.Mui-selected': {
        color: props.theme.palette.mode === 'dark' ? '#fff' : '#333333',
    },
}));

export const Label = styled(InputLabel)({
    transform: 'none',
});
