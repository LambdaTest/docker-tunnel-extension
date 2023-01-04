import React, { useState } from 'react';
import Button from '@mui/material/Button';
import { Box } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';

import { createDockerDesktopClient } from '@docker/extension-api-client';
import {
  Stack,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Paper,
  Grid,
} from '@mui/material';

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

export function App() {
  const ddClient = useDockerDesktopClient();
  const bottomRef = React.useRef(null);

  const [state, setState] = React.useState({
    userName: '',
    accessKey: '',
    tunnelName: '',
    proxyHost: '',
    proxyPort: '',
    proxyUser: '',
    proxyPassword: '',
    noProxyUser: '',
    dnsServer: '',
    environment: '',
    localFileServerDirectory: '',
    infoApiPort: '',
    bypassHosts: '',
    allowHosts: '',
    logfilepath: '',
    connectionMode: '',
    serverDomain: '',
  });

  const [tunnelDataMap, setTunnelDataMap] = useState({});
  const [createLoading, setCreateLoading] = useState(false);
  const [currentLogId, setCurrentLogId] = useState('');
  const [tunnelNameErr, setTunnelNameErr] = useState(false);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    if (event.target.name === 'tunnelName') {
      setTunnelNameErr(false);
    }
    setState({
      ...state,
      [event.target.name]: value,
    });
  }

  function selectHandleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const value = event.target.value;
    setState({
      ...state,
      [event.target.name]: value,
    });
  }

  const [formats, setFormats] = React.useState(() => []);

  const toggleHandleChange = (
    event: React.MouseEvent<HTMLElement>,
    newFormats: string[]
  ) => {
    setFormats(newFormats);
  };

  let startCommand =
    '-i --name lt lambdatest/tunnel:latest --user ' +
    state.userName +
    ' --key ' +
    state.accessKey;

  function runDockerCommand() {
    setCreateLoading(true);
    let selfGeneratedTunnelName = Math.random().toString(16).slice(2);

    if (state.tunnelName.length > 0) {
      if (state.tunnelName in tunnelDataMap) {
        setTunnelNameErr(true);
        setCreateLoading(false);
        return;
      } else {
        selfGeneratedTunnelName = state.tunnelName;
      }
    }

    if (!!state.tunnelName) {
      startCommand =
        String(startCommand).concat(' --tunnelName ' + state.tunnelName) +
        ' --verbose';
    } else {
      setState((state) => {
        return { ...state, tunnelName: selfGeneratedTunnelName };
      });
      startCommand = String(startCommand).concat(
        ' --tunnelName ' + selfGeneratedTunnelName + ' --verbose'
      );
    }

    if (!!state.infoApiPort) {
      startCommand = String(startCommand).concat(
        ' --infoAPIPort ' + state.infoApiPort
      );
    }

    if (!!state.logfilepath) {
      startCommand = String(startCommand).concat(
        ' --logFile ' + state.logfilepath
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

    if (!!state.noProxyUser) {
      startCommand = String(startCommand).concat(
        ' --no-proxy ' + state.noProxyUser
      );
    }

    if (!!state.dnsServer) {
      startCommand = String(startCommand).concat(' --dns ' + state.dnsServer);
    }

    if (!!state.environment) {
      startCommand = String(startCommand).concat(' --env ' + state.environment);
    }

    if (!!state.localFileServerDirectory) {
      startCommand = String(startCommand).concat(
        ' --dir ' + state.localFileServerDirectory
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

    if (!!state.connectionMode) {
      startCommand = String(startCommand).concat(
        ' --mode ' + state.connectionMode
      );
    }

    if (!!state.serverDomain) {
      startCommand = String(startCommand).concat(
        ' --server-domain ' + state.serverDomain
      );
    }

    formats.forEach((name) => {
      startCommand += ` --${name}`;
    });

    startCommand = startCommand.replace('lt', selfGeneratedTunnelName);
    console.log(startCommand);

    setTimeout(async () => {
      try {
        const resp = await ddClient.docker.cli.exec('ps', [
          '--filter',
          'status=running',
          '--format',
          '"{{.Names}}"',
        ]);
        console.log('resp', resp);
        const tunnelsArray = resp.stdout.split('\n');
        tunnelsArray.pop();
        if (
          tunnelsArray.length > 0 &&
          tunnelsArray.length > Object.keys(tunnelDataMap).length
        ) {
          const tunnelsMap = {};
          tunnelsArray.forEach((value) => {
            tunnelsMap[value] = '';
          });
          setTunnelDataMap(tunnelsMap);
          setIsTunnelVisible(true);
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
  }

  function getContainerLogs(containerName: string) {
    setLogs([]);
    setCurrentLogId(containerName);
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

  async function stopDockerCommand(value: string) {
    try {
      await ddClient.docker.cli.exec('stop', [value]);
      await ddClient.docker.cli.exec('rm', ['-f', value]);
      console.log('stopped');
      const tunnelMap = { ...tunnelDataMap };
      delete tunnelMap[value];
      if (currentLogId === value) {
        setLogs([]);
      }
      if (Object.keys(tunnelMap).length === 0) {
        setIsTunnelVisible(false);
        setIsCreatingNewTunnel(false);
        setLogs([]);
      }
      setTunnelDataMap(tunnelMap);
    } catch (err) {
      console.log('ERR: ', err);
      ddClient.desktopUI.toast.error('Error in Stopping Tunnel');
    }
  }

  const [logs, setLogs] = React.useState<string[]>([]);

  const [isTunnelVisible, setIsTunnelVisible] = React.useState(false);
  const [isShowAdvancedConfig, setIsShowAdvancedConfig] = React.useState(false);
  const [isCreatingNewTunnel, setIsCreatingNewTunnel] = React.useState(false);

  React.useEffect(() => {
    const func = async () => {
      const resp = await ddClient.docker.cli.exec('ps', [
        '--filter',
        'status=running',
        '--format',
        '"{{.Names}}"',
      ]);
      if (resp.stdout.length > 0) {
        const tunnelsArray = resp.stdout.split('\n');
        tunnelsArray.pop();
        const tunnelsMap = {};
        tunnelsArray.forEach((value) => {
          tunnelsMap[value] = '';
        });
        console.log('tunnelsMap', tunnelsMap);
        setTunnelDataMap(tunnelsMap);
        setIsTunnelVisible(true);
      }
    };
    func();
  }, []);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <>
      {!isTunnelVisible ? (
        <Stack direction="column" alignItems="center" spacing={2}>
          <Box
            sx={{
              maxWidth: '100%',
              height: 100,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="h3">LambdaTest Tunnel </Typography>
          </Box>

          <Box
            sx={{
              maxWidth: '100%',
            }}
          >
            <TextField
              fullWidth
              required
              id="userName"
              label="Username"
              variant="outlined"
              sx={{ bottom: 30 }}
              name="userName"
              value={state.userName}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              required
              id="accesskey"
              label="Access key"
              variant="outlined"
              sx={{ bottom: 20 }}
              name="accessKey"
              value={state.accessKey}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              id="tunnelName"
              label="Tunnel Name"
              variant="outlined"
              sx={{ top: 2, bottom: 5 }}
              name="tunnelName"
              value={state.tunnelName}
              onChange={handleChange}
              error={tunnelNameErr}
              helperText={tunnelNameErr ? 'Name already in use' : ''}
            />

            <div
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                marginTop: 10,
                marginBottom: 20,
              }}
            >
              <label
                onClick={() => setIsShowAdvancedConfig((current) => !current)}
              >
                Advanced Configurations
              </label>
            </div>
            {isShowAdvancedConfig && (
              <div>
                <div>
                  <TextField
                    fullWidth
                    id="proxyhost"
                    label="Proxy Host"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="proxyHost"
                    value={state.proxyHost}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="proxyport"
                    label="Proxy Port"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="proxyPort"
                    value={state.proxyPort}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="proxyuser"
                    label="Proxy User"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="proxyUser"
                    value={state.proxyUser}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="proxypassword"
                    label="Proxy Password"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="proxyPassword"
                    value={state.proxyPassword}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="noproxyhosts"
                    label="No Proxy Hosts"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="noProxyUser"
                    value={state.noProxyUser}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="dnsServers"
                    label="DNS Servers"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="dnsServer"
                    value={state.dnsServer}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="environment"
                    label="Environment"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="environment"
                    value={state.environment}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="fileServer"
                    label="Local File Server Directory"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="localFileServerDirectory"
                    value={state.localFileServerDirectory}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="infoApiPort"
                    label="Info API Port"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="infoApiPort"
                    value={state.infoApiPort}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="bypassHosts"
                    label="Bypass Hosts"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="bypassHosts"
                    value={state.bypassHosts}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="allowHosts"
                    label="Allow Hosts"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="allowHosts"
                    value={state.allowHosts}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="logFilePath"
                    label="Log File Path"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="logfilepath"
                    value={state.logfilepath}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <TextField
                    fullWidth
                    id="serverDomain"
                    label="Server Domain"
                    variant="outlined"
                    sx={{ marginBottom: 2 }}
                    name="serverDomain"
                    value={state.serverDomain}
                    onChange={handleChange}
                  />
                </div>
                <div style={{ display: 'flex' }}>
                  <label
                    style={{
                      fontWeight: 'bold',
                      marginTop: 2,
                      marginBottom: 2,
                    }}
                  >
                    CONNECTION MODE
                  </label>
                  <ToggleButtonGroup
                    color="primary"
                    onChange={toggleHandleChange}
                    aria-label="Platform"
                    value={formats}
                  >
                    <ToggleButton value="mitm" aria-label="bold">
                      MITM
                    </ToggleButton>
                    <ToggleButton value="verbose" aria-label="bold">
                      Verbose
                    </ToggleButton>
                    <ToggleButton value="shared-tunnel" aria-label="bold">
                      Shared Tunnel
                    </ToggleButton>{' '}
                    <ToggleButton value="ingress-only" aria-label="bold">
                      Ingress Only
                    </ToggleButton>{' '}
                  </ToggleButtonGroup>
                </div>
                <select
                  style={{ fontWeight: 'bold' }}
                  name="CONNECTION MODE"
                  id="connectionMode"
                  onChange={selectHandleChange}
                >
                  <option>Auto</option>
                  <option>SSH (22)</option>
                  <option>SSH (443)</option>
                </select>
              </div>
            )}
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              onClick={runDockerCommand}
              disabled={createLoading}
            >
              Start Tunnel
            </Button>
            {isCreatingNewTunnel && (
              <Button
                variant="contained"
                onClick={() => {
                  setIsTunnelVisible(true);
                }}
              >
                Back to Tunnel List
              </Button>
            )}
          </Stack>
        </Stack>
      ) : (
        <Stack direction="column" alignItems="center" spacing={2}>
          <Button
            variant="contained"
            onClick={() => {
              setIsTunnelVisible(false);
              setIsCreatingNewTunnel(true);
            }}
          >
            Add Tunnel{' '}
            <AddIcon
              style={{ color: 'white', marginLeft: '5px', width: '17px' }}
            ></AddIcon>
          </Button>
          <Grid
            container
            direction={'row'}
            style={{ maxWidth: '800px', display: 'flex' }}
            spacing={3}
          >
            <Grid item xs="auto">
              <div
                style={{
                  width: '270px',
                  backgroundColor: '#e7ebf0',
                  padding: '5px',
                  height: '400px',
                }}
              >
                <Paper
                  style={{
                    textAlign: 'center',
                    lineHeight: '35px',
                    fontWeight: '500',
                    marginBottom: '8px',
                  }}
                >
                  Running Tunnels
                </Paper>
                <Stack
                  style={{ height: '340px', overflowY: 'scroll' }}
                  spacing={0.5}
                >
                  {Object.keys(tunnelDataMap).map(function (value) {
                    return (
                      <Paper
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          padding: '4px',
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          style={{ alignItems: 'center' }}
                        >
                          <div
                            style={{
                              backgroundColor: 'green',
                              width: '16px',
                              height: '16px',
                              borderRadius: '50%',
                            }}
                          ></div>
                          <label
                            style={{
                              width: '100px',
                              overflow: 'hidden',
                              whiteSpace: 'nowrap',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {value}
                          </label>
                          <div>
                            <Button
                              onClick={() => {
                                getContainerLogs(value);
                              }}
                            >
                              Logs
                            </Button>
                          </div>
                          <button
                            style={{
                              backgroundColor: 'red',
                              width: '16px',
                              height: '16px',
                              borderRadius: '25%',
                              alignItems: 'center',
                              marginRight: '10px',
                              marginLeft: '10px',
                            }}
                            onClick={() => {
                              stopDockerCommand(value);
                            }}
                          ></button>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              </div>
            </Grid>
            <Grid item xs>
              <div style={{ height: '400px' }}>
                <Paper
                  style={{
                    textAlign: 'center',
                    lineHeight: '35px',
                    fontWeight: '500',
                  }}
                >
                  Logs
                </Paper>
                <div style={{ overflowY: 'scroll', height: '360px' }}>
                  {logs.map((log) => {
                    return <div>{log}</div>;
                  })}
                  <div ref={bottomRef} />
                </div>
              </div>
            </Grid>
          </Grid>
        </Stack>
      )}
    </>
  );
}
