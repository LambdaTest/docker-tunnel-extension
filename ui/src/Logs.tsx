import {
    Alert,
    Container,
    Grid,
    Snackbar,
    Tooltip,
    Typography,
} from '@mui/material';
import { Box, Stack } from '@mui/system';
import SquareRoundedIcon from '@mui/icons-material/SquareRounded';
import { DockerButton, StopButton, ViewLogsButton } from './MuiTheme';
import { useState, useRef, useEffect } from 'react';
import { useDockerDesktopClient } from './assets/js/dockerDesktop';
import RefreshIcon from '@mui/icons-material/Refresh';

export function Logs({
    setCurrentPage,
    tunnelDataMap,
    setTunnelDataMap,
    activeLogs,
    setActiveLogs,
}) {
    const ddClient = useDockerDesktopClient();

    const bottomRef = useRef(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [toast, setToast] = useState<boolean>(false);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    useEffect(() => {
        if (activeLogs.length > 0) {
            ddClient.docker.cli.exec('logs', ['-f', '-t', activeLogs], {
                stream: {
                    async onOutput(data) {
                        console.log(data.stdout);
                        if (!!data.stdout) {
                            if (
                                data.stdout.indexOf(
                                    'Please restart the binary'
                                ) > -1
                            ) {
                                await ddClient.docker.cli.exec('restart', [
                                    activeLogs,
                                ]);
                                updateLogs(activeLogs);
                            }
                            setLogs((current) => [
                                ...current,
                                String(data.stdout).concat('\n'),
                            ]);
                        }
                    },
                    onError(error: unknown): void {
                        ddClient.desktopUI.toast.error('An error occurred');
                        console.log(error);
                    },
                    onClose(exitCode) {
                        console.log('onClose with exit code ' + exitCode);
                    },
                    splitOutputLines: true,
                },
            });
        }
    }, []);

    const updateLogs = async (containerName: string) => {
        setLogs([]);
        ddClient.docker.cli.exec('logs', ['-f', '-t', containerName], {
            stream: {
                onOutput(data): void {
                    console.log(data.stdout);
                    if (!!data.stdout) {
                        setLogs((current) => [
                            ...current,
                            String(data.stdout).concat('\n'),
                        ]);
                    }
                },
                onError(error: unknown): void {
                    ddClient.desktopUI.toast.error('An error occurred');
                    console.log(error);
                },
                onClose(exitCode) {
                    console.log('onClose with exit code ' + exitCode);
                },
                splitOutputLines: true,
            },
        });
    };

    const updateTunnels = async () => {
        try {
            const resp = await ddClient.docker.cli.exec('ps', [
                '--filter',
                'status=running',
                '--filter',
                'ancestor=lambdatest/tunnel:latest',
                '--format',
                '"{{.Names}}"',
            ]);
            if (resp.stdout.length > 0) {
                const tunnelsArray = resp.stdout.split('\n');
                tunnelsArray.pop();
                setTunnelDataMap(tunnelsArray);
            } else {
                setTunnelDataMap([]);
                setLogs([]);
                setCurrentPage('form');
            }
            const exited = await ddClient.docker.cli.exec('ps', [
                '--filter',
                'status=exited',
                '--filter',
                'ancestor=lambdatest/tunnel:latest',
                '--format',
                '"{{.Names}}"',
            ]);
            if (exited.stdout.length > 0) {
                const stoppedTunnels = exited.stdout.split('\n');
                stoppedTunnels.pop();
                console.log(stoppedTunnels);
                await Promise.all(
                    stoppedTunnels.map(async (value) => {
                        if (value === activeLogs) {
                            setLogs([]);
                            setActiveLogs('');
                        }
                        await ddClient.docker.cli.exec('rm', ['-f', value]);
                    })
                );
            }
            setToast(true);
        } catch (err) {
            setToast(true);
        }
    };

    const getContainerLogs = (containerName: string) => {
        setLogs([]);
        if (activeLogs === containerName) {
            setActiveLogs('');
        } else {
            setActiveLogs(containerName);
            ddClient.docker.cli.exec('logs', ['-f', '-t', containerName], {
                stream: {
                    onOutput(data): void {
                        console.log(data.stdout);
                        if (!!data.stdout) {
                            setLogs((current) => [
                                ...current,
                                String(data.stdout).concat('\n'),
                            ]);
                        }
                    },
                    onError(error: unknown): void {
                        ddClient.desktopUI.toast.error('An error occurred');
                        console.log(error);
                    },
                    onClose(exitCode) {
                        console.log('onClose with exit code ' + exitCode);
                    },
                    splitOutputLines: true,
                },
            });
        }
    };

    const stopDockerCommand = async (value: string) => {
        try {
            await ddClient.docker.cli.exec('stop', [value]);
            await ddClient.docker.cli.exec('rm', ['-f', value]);
            console.log('stopped');
            if (tunnelDataMap.length - 1 === 0) {
                setCurrentPage('form');
                setLogs([]);
            }
            setTunnelDataMap(
                tunnelDataMap.filter((item: string) => item !== value)
            );
            if (activeLogs === value) {
                setLogs([]);
            }
        } catch (err) {
            console.log('ERR: ', err);
            ddClient.desktopUI.toast.error('Error in Stopping Tunnel');
        }
    };

    return (
        <Container sx={{ maxWidth: '800px' }}>
            <Stack spacing={4}>
                <Box height={4}></Box>
                <Typography sx={{ fontSize: '24px', fontWeight: '590' }}>
                    LambdaTest Docker Tunnel
                </Typography>
                <Stack sx={{ border: '1px solid #EAEAEA' }}>
                    <Stack
                        direction={'row'}
                        justifyContent='space-between'
                        alignItems={'center'}
                        style={{
                            lineHeight: '38px',
                            fontWeight: '500',
                            paddingLeft: '13px',
                            paddingRight: '24px',
                            borderBottom: '1px solid #EAEAEA',
                            height: '40px',
                        }}
                    >
                        <Typography>Running Tunnels</Typography>
                        <Tooltip
                            onClick={updateTunnels}
                            title='Refresh Tunnels'
                            placement='top'
                        >
                            <RefreshIcon style={{ cursor: 'pointer' }} />
                        </Tooltip>
                        <Snackbar
                            open={toast}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            autoHideDuration={3000}
                            onClose={() => {
                                setToast(!toast);
                            }}
                        >
                            <Alert
                                onClose={() => {
                                    setToast(!toast);
                                }}
                                severity='success'
                                sx={{ width: '100%' }}
                            >
                                List Updated Successfully
                            </Alert>
                        </Snackbar>
                    </Stack>
                    <Stack sx={{ overflowY: 'scroll', maxHeight: '450px' }}>
                        {tunnelDataMap.map((value: string, index: number) => {
                            return (
                                <Stack
                                    direction={'column'}
                                    key={index}
                                >
                                    <Box
                                        style={{
                                            padding: '4px',
                                            height: '48px',
                                            border: '1px',
                                            display: 'flex',
                                            borderBottom: '1px solid #EAEAEA',
                                        }}
                                    >
                                        <Grid
                                            container
                                            direction='row'
                                            justifyContent={'space-between'}
                                        >
                                            <Stack
                                                spacing={2}
                                                direction='row'
                                                sx={{
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Box></Box>
                                                <Box
                                                    sx={{
                                                        backgroundColor:
                                                            '#70BD43',
                                                        width: '6px',
                                                        height: '6px',
                                                        borderRadius: '50%',
                                                    }}
                                                ></Box>
                                                <Typography>{value}</Typography>
                                            </Stack>
                                            <Stack
                                                spacing={2}
                                                direction='row'
                                                sx={{
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <ViewLogsButton
                                                    size='small'
                                                    variant='outlined'
                                                    onClick={() =>
                                                        getContainerLogs(value)
                                                    }
                                                >
                                                    {activeLogs === value
                                                        ? 'Close Logs'
                                                        : 'View Logs'}
                                                </ViewLogsButton>
                                                <StopButton
                                                    size='small'
                                                    variant='outlined'
                                                    startIcon={
                                                        <SquareRoundedIcon
                                                            sx={{
                                                                width: '8px',
                                                            }}
                                                        />
                                                    }
                                                    onClick={() =>
                                                        stopDockerCommand(value)
                                                    }
                                                >
                                                    Stop
                                                </StopButton>
                                                <Box></Box>
                                            </Stack>
                                        </Grid>
                                    </Box>
                                    {activeLogs === value && (
                                        <Box
                                            sx={{
                                                height: '350px',
                                                overflowY: 'scroll',
                                                backgroundColor: (theme) =>
                                                    theme.palette.mode ===
                                                    'dark'
                                                        ? '#333333'
                                                        : '#F0F0F0',
                                                borderBottom:
                                                    '1px solid #EAEAEA',
                                                padding: '20px',
                                            }}
                                        >
                                            {logs.map(
                                                (log: string, i: number) => {
                                                    return (
                                                        <Typography key={i}>
                                                            {log}
                                                        </Typography>
                                                    );
                                                }
                                            )}
                                            <div ref={bottomRef} />
                                        </Box>
                                    )}
                                </Stack>
                            );
                        })}
                    </Stack>
                </Stack>
                <DockerButton
                    variant='contained'
                    size='large'
                    type='submit'
                    onClick={() => setCurrentPage('form')}
                >
                    + Configure New Tunnel
                </DockerButton>
            </Stack>
        </Container>
    );
}
