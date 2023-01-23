import {
    Box,
    Grid,
    InputLabel,
    Link,
    MenuItem,
    Select,
    Stack,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { Container } from '@mui/system';
import React, { useState } from 'react';
import { useDockerDesktopClient } from './assets/js/dockerDesktop';
import { AntSwitch, DockerButton, StyledTab } from './MuiTheme';

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const proxyConfigs: {
    id: string;
    name: string;
    placeholder: string;
    type: string;
}[] = [
    {
        id: 'proxyHost',
        name: 'Proxy Host',
        placeholder: 'Enter Proxy Host',
        type: 'text',
    },
    {
        id: 'proxyPort',
        name: 'Proxy Port',
        placeholder: 'Enter Proxy Port',
        type: 'text',
    },
    {
        id: 'proxyUser',
        name: 'Proxy User',
        placeholder: 'Enter Proxy User',
        type: 'text',
    },
    {
        id: 'proxyPassword',
        name: 'Proxy Password',
        placeholder: 'Enter Proxy Password',
        type: 'text',
    },
    {
        id: 'noProxyHosts',
        name: 'No Proxy Hosts',
        placeholder: 'Enter No Proxy Hosts',
        type: 'text',
    },
    {
        id: 'dnsServers',
        name: 'DNS Servers',
        placeholder: 'Enter DNS Servers',
        type: 'text',
    },
];

const advanceConfig: {
    id: string;
    name: string;
    placeholder?: string;
    type: string;
    option?: { value: string; label: string }[];
}[] = [
    {
        id: 'environment',
        name: 'Environment',
        placeholder: 'Enter Environment',
        type: 'text',
    },
    {
        id: 'localFileServer',
        name: 'Local File Server Directory',
        placeholder: 'Enter Local File Server Directory',
        type: 'text',
    },
    {
        id: 'infoApiPorts',
        name: 'Info API Ports',
        placeholder: 'Enter Info API Ports',
        type: 'text',
    },
    {
        id: 'bypassHosts',
        name: 'Bypass Hosts',
        placeholder: 'Enter Bypass Hosts',
        type: 'text',
    },
    {
        id: 'allowHosts',
        name: 'Allow Hosts',
        placeholder: 'Enter Hosts',
        type: 'text',
    },
    {
        id: 'logFilePath',
        name: 'Log File Path',
        placeholder: 'Paste Directory Path Here',
        type: 'text',
    },
    {
        id: 'connectionMode',
        name: 'Connection Mode',
        option: [
            { label: 'Auto', value: 'automatic' },
            { label: 'SSH (22)', value: 'over_22' },
            { label: 'SSH (443)', value: 'over_443' },
            { label: 'SSH (WSS)', value: 'over_ws' },
            { label: 'WebSocket', value: 'ws' },
        ],
        type: 'select',
    },
    {
        id: 'serverDomain',
        name: 'Server Domain',
        placeholder: 'Enter Server Domain',
        type: 'text',
    },
    { id: 'sharedTunnel', name: 'Shared Tunnel', type: 'switch' },
    { id: 'verbose', name: 'Verbose', type: 'switch' },
    { id: 'mitm', name: 'MITM', type: 'switch' },
    { id: 'ingressOnly', name: 'Ingress Only', type: 'switch' },
];

const switchKeyValuePair = {
    sharedTunnel: 'shared-tunnel',
    verbose: 'verbose',
    mitm: 'mitm',
    ingressOnly: 'ingress-only',
};

export function Form({ setCurrentPage, tunnelDataMap, setTunnelDataMap }) {
    const ddClient = useDockerDesktopClient();
    const [tabIndex, setTabIndex] = useState(0);
    const [showProxy, setShowProxy] = useState(false);
    const [configList, setConfigList] = useState(advanceConfig);
    const [createLoading, setCreateLoading] = useState(false);
    const [state, setState] = React.useState({
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
    });

    const [errorText, setError] = React.useState({
        userNameErr: false,
        accessTokenErr: false,
        tunnelNameText: '',
    });

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, [event.target.name]: event.target.value });
    };

    const handleChecked = (event: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, [event.target.name]: event.target.checked });
    };

    const handleClear = () => {
        setState({
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
        });
    };

    const handleProxyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setConfigList([...proxyConfigs, ...advanceConfig]);
        } else {
            setConfigList([...advanceConfig]);
        }
        setShowProxy(event.target.checked);
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
        let selfGeneratedTunnelName = Math.random().toString(16).slice(2);

        if (state.tunnelName.length > 0) {
            if (state.tunnelName in tunnelDataMap) {
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

        if (!!state.connectionMode && state.connectionMode !== 'automatic') {
            if (state.connectionMode === 'ws') {
                startCommand = String(startCommand).concat(
                    ' --mode ' + state.connectionMode
                );
            } else {
                startCommand = String(startCommand).concat(
                    ' --mode ssh --sshConnType ' + state.connectionMode
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

        startCommand = startCommand.replace('lt', selfGeneratedTunnelName);

        console.log(startCommand);

        setTimeout(async () => {
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
                    setTunnelDataMap(tunnelsArray);
                    setCurrentPage('logs');
                } else {
                    ddClient.desktopUI.toast.error('Error in starting tunnel');
                    setCreateLoading(false);
                }
                setCreateLoading(false);
            } catch (err) {
                console.log('ERR: ', err);
            }
        }, 5000);
        ddClient.docker.cli.exec('run', [startCommand]);
    };

    return (
        <Container sx={{ maxWidth: '520px' }}>
            <Stack spacing={5}>
                <Box></Box>
                <Typography sx={{ fontSize: '24px', fontWeight: '590' }}>
                    Lambdatest Docker Tunnel
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
                            style: {
                                background: '#333333',
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
                                    <InputLabel htmlFor='userName'>
                                        Username
                                    </InputLabel>
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
                                    <InputLabel htmlFor='accessToken'>
                                        Access Token
                                    </InputLabel>
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
                                                <Link href='https://accounts.lambdatest.com/detail/profile'>
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
                                    <InputLabel htmlFor='tunnelName'>
                                        Tunnel Name
                                    </InputLabel>
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
                                                ? 'Name already in use'
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
                                                        <InputLabel
                                                            htmlFor={config.id}
                                                        >
                                                            {config.name}
                                                        </InputLabel>
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
                                                        <InputLabel>
                                                            {config.name}
                                                        </InputLabel>
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
                        Launch Tunnel
                    </DockerButton>
                    <Typography
                        style={{ cursor: 'pointer' }}
                        onClick={handleClear}
                    >
                        RESET
                    </Typography>
                </Stack>
            </Stack>
        </Container>
    );
}
