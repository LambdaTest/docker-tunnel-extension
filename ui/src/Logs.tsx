import { Container, Grid, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import SquareRoundedIcon from '@mui/icons-material/SquareRounded';
import { DockerButton, StopButton, ViewLogsButton } from './MuiTheme';
import { useState, useRef, useEffect } from 'react';
import { useDockerDesktopClient } from './assets/js/dockerDesktop';

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

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    useEffect(() => {
        if (activeLogs.length > 0) {
            ddClient.docker.cli.exec('logs', ['-f', '-t', activeLogs], {
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
    }, []);

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
                    <Box
                        style={{
                            lineHeight: '38px',
                            fontWeight: '500',
                            paddingLeft: '13px',
                            borderBottom: '1px solid #EAEAEA',
                        }}
                    >
                        Running Tunnels
                    </Box>
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
                                                    endIcon={
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
                    + Add New Tunnel
                </DockerButton>
            </Stack>
        </Container>
    );
}
