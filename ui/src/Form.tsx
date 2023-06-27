import {
    Box,
    CircularProgress,
    Grid,
    Link,
    MenuItem,
    Select,
    Stack,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { Container } from '@mui/system';
import React, { useEffect, useState } from 'react';
import {
    advanceConfig,
    lumsUrl,
    proxyConfigs,
    switchKeyValuePair,
} from './assets/js/constants';
import { useDockerDesktopClient } from './assets/js/dockerDesktop';
import { AntSwitch, DockerButton, Label, StyledTab } from './MuiTheme';

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const formInputObject = {
    userName: '',
    accessToken: '',
    tunnelName: '',
    proxyHost: '',
    proxyPort: '',
    proxyUser: '',
    proxyPassword: '',
    noProxyHosts: '',
    dnsServers: '',
    environment: '',
    localFileServer: '',
    infoApiPorts: '',
    bypassHosts: '',
    allowHosts: '',
    logFilePath: '',
    connectionMode: 'automatic',
    serverDomain: '',
    sharedTunnel: false,
    verbose: false,
    mitm: false,
    ingressOnly: false,
};

export function Form({
    setCurrentPage,
    tunnelDataMap,
    setTunnelDataMap,
    setActiveLogs,
}) {
    const ddClient = useDockerDesktopClient();
    const [tabIndex, setTabIndex] = useState(0);
    const [showProxy, setShowProxy] = useState(false);
    const [configList, setConfigList] = useState(advanceConfig);
    const [createLoading, setCreateLoading] = useState(false);
    const [showResetButton, setShowResetButton] = useState(false);
    const [state, setState] = React.useState(formInputObject);

    const [errorText, setError] = React.useState({
        userNameErr: false,
        accessTokenErr: false,
        tunnelNameText: '',
    });

    useEffect(() => {
        if (state !== formInputObject) {
            setShowResetButton(true);
        } else {
            setShowResetButton(false);
        }
    }, [state]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, [event.target.name]: event.target.value });
        if (event.target.name === 'tunnelName') {
            setError({ ...errorText, tunnelNameText: '' });
        }
    };

    const handleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, [event.target.name]: event.target.checked });
    };

    const handleClear = () => {
        setState(formInputObject);
    };

    const handleProxyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setConfigList([...proxyConfigs, ...advanceConfig]);
        } else {
            setConfigList([...advanceConfig]);
        }
        setShowProxy(event.target.checked);
    };

    const handleOpenProfilePage = () => {
        ddClient.host.openExternal(
            'https://accounts.lambdatest.com/detail/profile'
        );
    };

    let startCommand =
        '-i --add-host localhost:192.168.65.2 --name lt lambdatest/tunnel:latest --user ' +
        state.userName +
        ' --key ' +
        state.accessToken;

    const handleStartTunnel = () => {
        if (state.userName.length === 0) {
            setError({ ...errorText, userNameErr: true });
            return;
        }
        if (state.accessToken.length === 0) {
            setError({ ...errorText, accessTokenErr: true });
            return;
        }

        setCreateLoading(true);

        let selfGeneratedTunnelName = Math.random().toString(16).slice(2);

        if (state.tunnelName.length > 0) {
            if (tunnelDataMap.indexOf(state.tunnelName) > -1) {
                setError({
                    ...errorText,
                    tunnelNameText: 'Name already in use',
                });
                setCreateLoading(false);
                return;
            } else {
                selfGeneratedTunnelName = state.tunnelName;
            }
        }
        if (!!state.tunnelName) {
            startCommand =
                String(startCommand).concat(
                    ' --tunnelName ' + state.tunnelName
                ) + ' --verbose';
        } else {
            setState((state) => {
                return { ...state, tunnelName: selfGeneratedTunnelName };
            });
            startCommand = String(startCommand).concat(
                ' --tunnelName ' + selfGeneratedTunnelName + ' --verbose'
            );
        }

        fetch(`${lumsUrl}/api/user/token/auth`, {
            method: 'POST',
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({
                username: state.userName,
                token: state.accessToken,
            }),
        })
            .then((response) => {
                if (response.status >= 200 && response.status <= 299) {
                    if (!!state.infoApiPorts) {
                        startCommand = String(startCommand).concat(
                            ' --infoAPIPort ' + state.infoApiPorts
                        );
                    }

                    if (!!state.logFilePath) {
                        startCommand = String(startCommand).concat(
                            ' --logFile ' + state.logFilePath
                        );
                    }

                    if (!!state.proxyHost) {
                        startCommand = String(startCommand).concat(
                            ' --proxy-host ' + state.proxyHost
                        );
                    }

                    if (!!state.proxyPort) {
                        startCommand = String(startCommand).concat(
                            ' --proxy-port ' + state.proxyPort
                        );
                    }

                    if (!!state.proxyUser) {
                        startCommand = String(startCommand).concat(
                            ' --proxy-user ' + state.proxyUser
                        );
                    }

                    if (!!state.proxyPassword) {
                        startCommand = String(startCommand).concat(
                            ' --proxy-pass ' + state.proxyPassword
                        );
                    }

                    if (!!state.noProxyHosts) {
                        startCommand = String(startCommand).concat(
                            ' --no-proxy ' + state.noProxyHosts
                        );
                    }

                    if (!!state.dnsServers) {
                        startCommand = String(startCommand).concat(
                            ' --dns ' + state.dnsServers
                        );
                    }

                    if (!!state.environment) {
                        startCommand = String(startCommand).concat(
                            ' --env ' + state.environment
                        );
                    }

                    if (!!state.localFileServer) {
                        startCommand = String(startCommand).concat(
                            ' --dir ' + state.localFileServer
                        );
                    }

                    if (!!state.bypassHosts) {
                        startCommand = String(startCommand).concat(
                            ' --bypassHosts ' + state.bypassHosts
                        );
                    }

                    if (!!state.allowHosts) {
                        startCommand = String(startCommand).concat(
                            ' --allowHosts ' + state.allowHosts
                        );
                    }

                    if (
                        !!state.connectionMode &&
                        state.connectionMode !== 'automatic'
                    ) {
                        if (state.connectionMode === 'ws') {
                            startCommand = String(startCommand).concat(
                                ' --mode ' + state.connectionMode
                            );
                        } else {
                            startCommand = String(startCommand).concat(
                                ' --mode ssh --sshConnType ' +
                                    state.connectionMode
                            );
                        }
                    }

                    if (!!state.serverDomain) {
                        startCommand = String(startCommand).concat(
                            ' --server-domain ' + state.serverDomain
                        );
                    }

                    if (state.sharedTunnel) {
                        startCommand += ` --${switchKeyValuePair.sharedTunnel}`;
                    }

                    if (state.verbose) {
                        startCommand += ` --${switchKeyValuePair.verbose}`;
                    }

                    if (state.mitm) {
                        startCommand += ` --${switchKeyValuePair.mitm}`;
                    }

                    if (state.ingressOnly) {
                        startCommand += ` --${switchKeyValuePair.ingressOnly}`;
                    }

                    startCommand = startCommand.replace(
                        'lt',
                        selfGeneratedTunnelName
                    );

                    console.log(startCommand);

                    let intervalCount = 0;
                    const interval = setInterval(async () => {
                        try {
                            const resp = await ddClient.docker.cli.exec('ps', [
                                '--filter',
                                'status=running',
                                '--filter',
                                'ancestor=lambdatest/tunnel:latest',
                                '--format',
                                '"{{.Names}}"',
                            ]);
                            console.log('resp', resp);
                            const tunnelsArray = resp.stdout.split('\n');
                            tunnelsArray.pop();
                            if (
                                tunnelsArray.length > 0 &&
                                tunnelsArray.length > tunnelDataMap.length
                            ) {
                                setActiveLogs(selfGeneratedTunnelName);
                                setTunnelDataMap(tunnelsArray);
                                setCurrentPage('logs');
                                setCreateLoading(false);
                                clearInterval(interval);
                            } else {
                                if (intervalCount > 5) {
                                    handleClear();
                                    ddClient.desktopUI.toast.error(
                                        'Error in starting tunnel'
                                    );
                                    setCreateLoading(false);
                                    clearInterval(interval);
                                }
                                intervalCount++;
                            }
                        } catch (err) {
                            console.log('ERR: ', err);
                            clearInterval(interval);
                        }
                    }, 3000);

                    ddClient.docker.cli.exec('run', [startCommand]);
                } else {
                    console.log('Invalid Credentials', response);
                    handleClear();
                    ddClient.desktopUI.toast.error('Invalid Credentials');
                    setCreateLoading(false);
                }
            })
            .catch((error) => {
                console.log('Invalid Credentials', error);
                handleClear();
                ddClient.desktopUI.toast.error('Invalid Credentials');
                setCreateLoading(false);
            });
    };

    return (
        <Container sx={{ maxWidth: '520px' }}>
            <Stack spacing={5}>
                <Box></Box>
                <Typography
                    sx={{
                        fontSize: '24px',
                        fontWeight: '590',
                        textAlign: 'center',
                    }}
                >
                    LambdaTest Docker Tunnel
                </Typography>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabIndex}
                        onChange={(
                            event: React.SyntheticEvent,
                            newValue: number
                        ) => {
                            setTabIndex(newValue);
                        }}
                        TabIndicatorProps={{
                            sx: {
                                backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? '#fff'
                                        : '#333333',
                            },
                        }}
                    >
                        <StyledTab
                            label='Basic'
                            {...a11yProps(0)}
                        />
                        <StyledTab
                            label='Advanced Configuration'
                            {...a11yProps(1)}
                        />
                    </Tabs>
                </Box>
                {
                    {
                        0: (
                            <Stack
                                spacing={2}
                                mt={5}
                            >
                                <Stack spacing={0.5}>
                                    <Label htmlFor='userName'>Username</Label>
                                    <TextField
                                        name='userName'
                                        variant='outlined'
                                        size='small'
                                        placeholder='Enter Username'
                                        error={errorText.userNameErr}
                                        value={state.userName}
                                        onChange={handleChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Stack>
                                <Stack spacing={0.5}>
                                    <Label htmlFor='accessToken'>
                                        Access Token
                                    </Label>
                                    <TextField
                                        name='accessToken'
                                        variant='outlined'
                                        size='small'
                                        placeholder='Enter Access Token'
                                        error={errorText.accessTokenErr}
                                        value={state.accessToken}
                                        onChange={handleChange}
                                        helperText={
                                            <>
                                                Get Access Token from{' '}
                                                <Link
                                                    sx={{ cursor: 'pointer' }}
                                                    onClick={
                                                        handleOpenProfilePage
                                                    }
                                                >
                                                    here.
                                                </Link>
                                            </>
                                        }
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                    />
                                </Stack>
                                <Stack spacing={0.5}>
                                    <Label htmlFor='tunnelName'>
                                        Tunnel Name
                                    </Label>
                                    <TextField
                                        name='tunnelName'
                                        variant='outlined'
                                        size='small'
                                        placeholder='Enter Tunnel Name'
                                        value={state.tunnelName}
                                        onChange={handleChange}
                                        InputLabelProps={{
                                            shrink: true,
                                        }}
                                        helperText={
                                            errorText.tunnelNameText.length > 0
                                                ? errorText.tunnelNameText
                                                : ''
                                        }
                                    />
                                </Stack>
                            </Stack>
                        ),
                        1: (
                            <Stack spacing={2}>
                                <Stack
                                    direction={'row'}
                                    spacing={4}
                                    alignItems='center'
                                >
                                    <Typography>Show Proxy Config</Typography>
                                    <AntSwitch
                                        checked={showProxy}
                                        inputProps={{
                                            'aria-label': 'ant design',
                                        }}
                                        onChange={handleProxyChange}
                                    />
                                </Stack>
                                <Grid
                                    container
                                    rowSpacing={2}
                                    justifyContent={'space-between'}
                                >
                                    {configList.map((config, index) => {
                                        return (
                                            <Grid
                                                item
                                                sx={(theme) => ({
                                                    width: '48%',
                                                    [theme.breakpoints.down(
                                                        'sm'
                                                    )]: {
                                                        width: '100%',
                                                    },
                                                })}
                                                key={index}
                                            >
                                                {config.type === 'text' && (
                                                    <Stack
                                                        spacing={0.5}
                                                        style={{
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <Label
                                                            htmlFor={config.id}
                                                        >
                                                            {config.name}
                                                        </Label>
                                                        <TextField
                                                            name={config.id}
                                                            variant='outlined'
                                                            placeholder={
                                                                config.placeholder
                                                            }
                                                            type={
                                                                config.id ===
                                                                'proxyPassword'
                                                                    ? 'password'
                                                                    : 'text'
                                                            }
                                                            size='small'
                                                            InputLabelProps={{
                                                                shrink: true,
                                                            }}
                                                            value={
                                                                state[config.id]
                                                            }
                                                            onChange={
                                                                handleChange
                                                            }
                                                        />
                                                    </Stack>
                                                )}
                                                {config.type === 'select' && (
                                                    <Stack
                                                        spacing={0.5}
                                                        style={{
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <Label>
                                                            {config.name}
                                                        </Label>
                                                        <Select
                                                            fullWidth
                                                            size='small'
                                                            value={
                                                                state.connectionMode
                                                            }
                                                            name={config.id}
                                                            onChange={
                                                                handleChange
                                                            }
                                                        >
                                                            {config.option.map(
                                                                (
                                                                    option: {
                                                                        label: string;
                                                                        value: string;
                                                                    },
                                                                    i: number
                                                                ) => {
                                                                    return (
                                                                        <MenuItem
                                                                            value={
                                                                                option.value
                                                                            }
                                                                            key={
                                                                                i
                                                                            }
                                                                        >
                                                                            {
                                                                                option.label
                                                                            }
                                                                        </MenuItem>
                                                                    );
                                                                }
                                                            )}
                                                        </Select>
                                                    </Stack>
                                                )}
                                                {config.type === 'switch' && (
                                                    <Stack
                                                        direction={'row'}
                                                        spacing={0}
                                                        alignItems='center'
                                                        style={{
                                                            width: '100%',
                                                        }}
                                                    >
                                                        <Typography
                                                            width={'50%'}
                                                        >
                                                            {config.name}
                                                        </Typography>
                                                        <AntSwitch
                                                            name={config.id}
                                                            checked={
                                                                state[config.id]
                                                            }
                                                            inputProps={{
                                                                'aria-label':
                                                                    'ant design',
                                                            }}
                                                            onChange={
                                                                handleChecked
                                                            }
                                                        ></AntSwitch>
                                                    </Stack>
                                                )}
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Stack>
                        ),
                    }[tabIndex]
                }
                <Grid
                    container
                    direction='row'
                    justifyContent={'space-between'}
                >
                    <Stack
                        direction={'row'}
                        spacing={4}
                        alignItems='center'
                    >
                        <DockerButton
                            variant='contained'
                            size='large'
                            type='submit'
                            onClick={handleStartTunnel}
                            disabled={createLoading}
                        >
                            {createLoading ? (
                                <Stack direction={'row'}>
                                    <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                    <CircularProgress
                                        color='inherit'
                                        size={25}
                                    />
                                    <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                                </Stack>
                            ) : (
                                'Launch Tunnel'
                            )}
                        </DockerButton>
                        {showResetButton && (
                            <Typography
                                style={{ cursor: 'pointer' }}
                                onClick={handleClear}
                            >
                                RESET
                            </Typography>
                        )}
                    </Stack>
                    {tunnelDataMap.length > 0 && (
                        <DockerButton
                            variant='contained'
                            size='large'
                            type='submit'
                            onClick={() => {
                                setCurrentPage('logs');
                            }}
                        >
                            Tunnel List
                        </DockerButton>
                    )}
                </Grid>
            </Stack>
        </Container>
    );
}
