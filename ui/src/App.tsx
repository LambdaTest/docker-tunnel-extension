import React from 'react';
import Button from '@mui/material/Button';
import { Box } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import PerfectScrollbar from 'react-perfect-scrollbar'

import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Stack, TextField, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';


// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();


function useDockerDesktopClient() {
  return client;
}

export function App() {

  const ddClient = useDockerDesktopClient();

  const [state, setState] = React.useState({
    userName: "",
    accessKey: "",
    tunnelName: "",
    proxyHost: "",
    proxyPort: "",
    proxyUser: "",
    proxyPassword: "",
    noProxyUser: "",
    dnsServer: "",
    environment: "",
    localFileServerDirectory: "",
    infoApiPort: "",
    bypassHosts: "",
    allowHosts: "",
    logfilepath: "",
    connectionMode: "",
    serverDomain: ""
  });
  
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;
    setState({
      ...state,
      [event.target.name]: value,
    });
  }

  function handleAddIconButton(event: React.ChangeEvent<HTMLButtonElement>){

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
    newFormats: string[],
  ) => {
    setFormats(newFormats);
  };
  
  let startCommand ="-i --name lt lambdatest/tunnel:latest --user "+state.userName+" --key "+ state.accessKey

  async function runDockerCommand() {
    var selfGeneratedTunnelName = Math.random().toString(16).slice(2)

    if(!!state.tunnelName){
      startCommand = String(startCommand).concat(" --tunnelName " + state.tunnelName) + " --verbose";
    }else {
      setState((state) => { return {...state, 
        tunnelName: selfGeneratedTunnelName
      }})
      startCommand = String(startCommand).concat(" --tunnelName " + selfGeneratedTunnelName + " --verbose");
    }

    if(!!state.infoApiPort){
      startCommand = String(startCommand).concat(" --infoAPIPort " + state.infoApiPort);
    }

    if(!!state.logfilepath){
      startCommand = String(startCommand).concat(" --logFile " + state.logfilepath);
    }

    if(!!state.proxyHost){
      startCommand = String(startCommand).concat(" --proxy-host " + state.proxyHost);
    }

    if(!!state.proxyPort){
      startCommand = String(startCommand).concat(" --proxy-port " + state.proxyPort);
    }

    if(!!state.proxyUser){
      startCommand = String(startCommand).concat(" --proxy-user " + state.proxyUser);
    }

    if(!!state.proxyPassword){
      startCommand = String(startCommand).concat(" --proxy-pass " + state.proxyPassword);
    }

    if(!!state.noProxyUser){
      startCommand = String(startCommand).concat(" --no-proxy " + state.noProxyUser);
    }
    
    if(!!state.dnsServer){
      startCommand = String(startCommand).concat(" --dns " + state.dnsServer);
    }

    if(!!state.environment){
      startCommand = String(startCommand).concat(" --env " + state.environment);
    }
    
    if(!!state.localFileServerDirectory){
      startCommand = String(startCommand).concat(" --dir " + state.localFileServerDirectory);
    }
    
    if(!!state.bypassHosts){
      startCommand = String(startCommand).concat(" --bypassHosts " + state.bypassHosts);
    }
    
    if(!!state.allowHosts){
      startCommand = String(startCommand).concat(" --allowHosts " + state.allowHosts);
    }

    if(!!state.connectionMode){
      startCommand = String(startCommand).concat(" --mode " + state.connectionMode);
    }

    if(!!state.serverDomain){
      startCommand = String(startCommand).concat(" --server-domain " + state.serverDomain);
    }

    formats.forEach(name => {
      startCommand += ` --${name}`
    })

    startCommand = startCommand.replace("lt",selfGeneratedTunnelName)
    console.log(startCommand)

    if(!localStorage.getItem("tunnelToDataLogMap")){
      localStorage.setItem("tunnelToDataLogMap",JSON.stringify(new Map()))
  }
    let tempMap = JSON.parse(localStorage.getItem("tunnelToDataLogMap"))
    if(!!tempMap) {
      tempMap[selfGeneratedTunnelName] = ""
      localStorage.setItem("tunnelToDataLogMap",JSON.stringify(tempMap));
    }
    // if(isTunnelVisible){
    //   setIsTunnelVisible(true)
    //   setIsSingleTunnelRunning(true)
    // }
    
    setIsTunnelVisible(true)
    setIsSingleTunnelRunning(true)

    await ddClient.docker.cli.exec('run', [
      startCommand,
    ]);
    
  }

  function getContainerLogs(containerName){
    ddClient.docker.cli.exec('logs', ["-f", "-t", containerName], {
      stream: {
        onOutput(data): void {
          console.log(data.stdout);
          if(!!data.stdout){
            // if(!localStorage.getItem("tunnelToDataLogMap")){
            //     localStorage.setItem("tunnelToDataLogMap",JSON.stringify(new Map()))
            // }
            // let tempMap = JSON.parse(localStorage.getItem("tunnelToDataLogMap"))
            // if(!!tempMap) {
            //   if(String(data.stdout).includes("tunnelName")){
            //     tempMap[String(data.stdout).match("--tunnelName(.*)--verbose")[1].trim()] = data.stdout
            //     localStorage.setItem("tunnelToDataLogMap",JSON.stringify(tempMap));
            //   }
            //   if(isTunnelVisible){
            //     setIsTunnelVisible(true)
            //     setIsSingleTunnelRunning(true)
            // }
            setLogs((current) => [...current, String(data.stdout).concat("\n")]);
          }
        },
        onError(error: unknown): void {
          ddClient.desktopUI.toast.error('An error occurred');
          console.log(error);
        },
        onClose(exitCode) {
          console.log("onClose with exit code " + exitCode);
        },
        splitOutputLines: true,
      },
    });
  }

  const containerName = "lt"

   function stopDockerCommand() {
    ddClient.docker.cli.exec('stop', [
      containerName
    ]);

    let tunnelMap = JSON.parse(localStorage.getItem("tunnelToDataLogMap"));
    if(!!tunnelMap){
      delete tunnelMap[""]
      localStorage.setItem("tunnelToDataLogMap",JSON.stringify(tunnelMap));
    }
  }

  function stopSpecificTunnel(tunnelName: string) {
    ddClient.docker.cli.exec('stop',[
      tunnelName
    ]);
  }

   function removeDockerCommand() {
    console.log(containerName)

    const logs = ddClient.docker.cli.exec('rm', ['-f', containerName]);
    console.log(logs)
  }

  const [logs, setLogs] = React.useState<string[]>([]);

  const [isTunnelVisible, setIsTunnelVisible] = React.useState(false)
  const [isShowAdvancedConfig, setIsShowAdvancedConfig] = React.useState(false)
  const [isSingleTunnelRunning, setIsSingleTunnelRunning] = React.useState(false)
  const [isCreatingNewTunnel, setIsCreatingNewTunnel] = React.useState(false)

  // React.useEffect(() => {
  //   const listener = ddClient.docker.cli.exec('logs', ["-f", "-t", "/lt"], {
  //     stream: {
  //       onOutput(data): void {
  //         console.log(data.stdout);
  //         if(!!data.stdout){
  //           if(!localStorage.getItem("tunnelToDataLogMap")){
  //               localStorage.setItem("tunnelToDataLogMap",JSON.stringify(new Map()))
  //           }
  //           let tempMap = JSON.parse(localStorage.getItem("tunnelToDataLogMap"))
  //           if(!!tempMap) {
  //             if(String(data.stdout).includes("tunnelName")){
  //               tempMap[String(data.stdout).match("--tunnelName(.*)--verbose")[1].trim()] = data.stdout
  //               localStorage.setItem("tunnelToDataLogMap",JSON.stringify(tempMap));
  //             }
  //             if(!isTunnelVisible){
  //               setIsTunnelVisible(true)
  //               setIsSingleTunnelRunning(true)
  //             }
  //           }
  //           setLogs((current) => [...current, String(data.stdout).concat("\n")]);
  //         }
  //       },
  //       onError(error: unknown): void {
  //         ddClient.desktopUI.toast.error('An error occurred');
  //         console.log(error);
  //       },
  //       onClose(exitCode) {
  //         console.log("onClose with exit code " + exitCode);
  //       },
  //       splitOutputLines: true,
  //     },
  //   });

  //   return () => {
  //     listener.close();
  //   }
  // }, []);

  function returnCreateNewTunnelHTML() {
      setIsTunnelVisible(false)
      setIsCreatingNewTunnel(true)

  }

  React.useEffect(() => {
    console.log('isTunnelVisible', isTunnelVisible)
  }, [isTunnelVisible])

  return (
    <>
      {/* { <Stack direction="column" alignItems="center" spacing={2}> */}
      {!isSingleTunnelRunning && <Stack direction="column" alignItems="center" spacing={2}>
      <Box sx={{
          maxWidth: '100%',
          height: 100,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
      <Typography variant="h3">LambdaTest Tunnel  </Typography>
      </Box>
      
      <Box sx={{
          maxWidth: '100%'}}>
      
      <TextField fullWidth id="userName"  label="Username" variant="outlined" sx={{ bottom: 30 }} name="userName" value={state.userName} onChange={handleChange} />
      <TextField fullWidth id="accesskey" label="Access key" variant="outlined" sx={{ bottom: 20 }} name="accessKey" value={state.accessKey} onChange={handleChange} />
      <TextField fullWidth id="tunnelName" label="Tunnel Name" variant="outlined" sx={{ top:2, bottom: 5 }} name="tunnelName" value={state.tunnelName} onChange={handleChange}/>

      <div style={{ fontSize:16, fontWeight: 'bold', marginTop:10, marginBottom: 20 }}>
        <label onClick={() => setIsShowAdvancedConfig((current) => !current)}>Advanced Configurations</label>
        {/* <img src='images/downarray.png'/> */}
      </div>
      { isShowAdvancedConfig && <div>
        <div>
          <TextField fullWidth id="proxyhost" label="Proxy Host" variant="outlined" sx={{ marginBottom: 2 }} name="proxyHost" value={state.proxyHost} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="proxyport" label="Proxy Port" variant="outlined" sx={{ marginBottom: 2 }} name="proxyPort" value={state.proxyPort} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="proxyuser" label="Proxy User" variant="outlined" sx={{ marginBottom: 2 }} name="proxyUser" value={state.proxyUser} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="proxypassword" label="Proxy Password" variant="outlined" sx={{ marginBottom: 2 }} name="proxyPassword" value={state.proxyPassword} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="noproxyhosts" label="No Proxy Hosts" variant="outlined" sx={{ marginBottom: 2 }} name="noProxyUser" value={state.noProxyUser} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="dnsServers" label="DNS Servers" variant="outlined" sx={{ marginBottom: 2 }} name="dnsServer" value={state.dnsServer} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="environment" label="Environment" variant="outlined" sx={{ marginBottom: 2 }} name="environment" value={state.environment} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="fileServer" label="Local File Server Directory" variant="outlined" sx={{ marginBottom: 2 }} name="localFileServerDirectory" value={state.localFileServerDirectory} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="infoApiPort" label="Info API Port" variant="outlined" sx={{ marginBottom: 2 }} name="infoApiPort" value={state.infoApiPort} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="bypassHosts" label="Bypass Hosts" variant="outlined" sx={{ marginBottom: 2 }} name="bypassHosts" value={state.bypassHosts} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="allowHosts" label="Allow Hosts" variant="outlined" sx={{ marginBottom: 2 }} name="allowHosts" value={state.allowHosts} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="logFilePath" label="Log File Path" variant="outlined" sx={{ marginBottom: 2 }} name="logfilepath" value={state.logfilepath} onChange={handleChange}/>
        </div>
        <div>
          <TextField fullWidth id="serverDomain" label="Server Domain" variant="outlined" sx={{ marginBottom: 2 }} name="serverDomain" value={state.serverDomain} onChange={handleChange}/>
        </div>
        <div style={{display:'flex'}}>
          <label style={{fontWeight: 'bold', marginTop:2, marginBottom: 2}} >CONNECTION MODE</label>
          <ToggleButtonGroup
          color="primary"
          onChange={toggleHandleChange}
          aria-label="Platform"
          value={formats}
          >
          <ToggleButton value="mitm" aria-label="bold">MITM</ToggleButton>
          <ToggleButton value="verbose" aria-label="bold">Verbose</ToggleButton>
          <ToggleButton value="shared-tunnel" aria-label="bold">Shared Tunnel</ToggleButton> //--shared-tunnel
          <ToggleButton value="ingress-only" aria-label="bold">Ingress Only</ToggleButton> //--ingress-only
        </ToggleButtonGroup>

        </div>
        <select style={{fontWeight: 'bold' }} name='CONNECTION MODE' id='connectionMode' onChange={selectHandleChange}>
          <option>Auto</option>
          <option>SSH (22)</option>
          <option>SSH (443)</option>
        </select>
      
      </div>
      } 
      </Box>
      <Stack direction="row" spacing={2}>
      <Button variant="contained" onClick={runDockerCommand}>
        Start Tunnel
      </Button>

      <Button variant="contained" onClick={() => { stopDockerCommand(); removeDockerCommand();}}>
        Stop Tunnel
      </Button>

      </Stack>

      <Stack >
    
      {/* <PerfectScrollbar>
        <Box id="logBox"
        sx={{
          
          width: 650,
          height: 300,
          backgroundColor: '#f4f4f6',
          font : "white",
          whiteSpace:'pre-wrap'
        }}>
        {logs}
        </Box>
      </PerfectScrollbar> */}

      </Stack>
      </Stack>
     }
      
    { isTunnelVisible && 
     <div style={{ display: 'flex',alignItems: 'center'}}>
      <div style={{ display: 'flex',alignItems: 'center'}}>
        <div>
          { Object.keys(JSON.parse(localStorage.getItem("tunnelToDataLogMap"))).map(function(value){
            return <div style={{display: 'flex'}}>
                <div style={{
                  backgroundColor: 'green',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  alignItems: 'center',
                  marginRight: '5px',
                  marginLeft: '-10px',
                  }}>
                </div>
                <label>{value}</label>
                <div>
                  <Button onClick={() => {getContainerLogs(value)}}>Logs</Button>
                  </div>
                <button style={{
                  backgroundColor: 'red',
                  width: '16px',
                  height: '16px',
                  borderRadius: '25%',
                  alignItems: 'center',
                  marginRight: '10px',
                  marginLeft: '10px'
                  }} onClick={() => { stopDockerCommand(); removeDockerCommand();}}>
                </button>
              </div>
          })
          }
        </div>
      </div>
        <div style={{height : "400px", overflowY:'scroll'}}>
          <div>
            {logs.map((log)=> {
              console.log(log)
              return <div>{log}</div>
            })}
          </div>
        </div>
        <Button
        sx={{
          width:'10px',
          height:'20px'
        }}
         onClick={()=>{returnCreateNewTunnelHTML()}}>
          <AddIcon color="primary"></AddIcon>
        </Button>
      </div>
    }


  { isCreatingNewTunnel && <Stack direction="column" alignItems="center" spacing={2}>
        <Box sx={{
            maxWidth: '100%',
            height: 100,
            alignItems: 'center',
            justifyContent: 'center'
          }}>
        <Typography variant="h3">LambdaTest Tunnel  </Typography>
        </Box>
        
        <Box sx={{
            maxWidth: '100%'}}>
        
        <TextField fullWidth id="userName"  label="Username" variant="outlined" sx={{ bottom: 30 }} name="userName" value={state.userName} onChange={handleChange} />
        <TextField fullWidth id="accesskey" label="Access key" variant="outlined" sx={{ bottom: 20 }} name="accessKey" value={state.accessKey} onChange={handleChange} />
        <TextField fullWidth id="tunnelName" label="Tunnel Name" variant="outlined" sx={{ top:2, bottom: 5 }} name="tunnelName" value={state.tunnelName} onChange={handleChange}/>

        <div style={{ fontSize:16, fontWeight: 'bold', marginTop:10, marginBottom: 20 }}>
          <label onClick={() => setIsShowAdvancedConfig((current) => !current)}>Advanced Configurations</label>
          {/* <img src='images/downarray.png'/> */}
        </div>
        { isShowAdvancedConfig && <div>
          <div>
            <TextField fullWidth id="proxyhost" label="Proxy Host" variant="outlined" sx={{ marginBottom: 2 }} name="proxyHost" value={state.proxyHost} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="proxyport" label="Proxy Port" variant="outlined" sx={{ marginBottom: 2 }} name="proxyPort" value={state.proxyPort} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="proxyuser" label="Proxy User" variant="outlined" sx={{ marginBottom: 2 }} name="proxyUser" value={state.proxyUser} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="proxypassword" label="Proxy Password" variant="outlined" sx={{ marginBottom: 2 }} name="proxyPassword" value={state.proxyPassword} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="noproxyhosts" label="No Proxy Hosts" variant="outlined" sx={{ marginBottom: 2 }} name="noProxyUser" value={state.noProxyUser} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="dnsServers" label="DNS Servers" variant="outlined" sx={{ marginBottom: 2 }} name="dnsServer" value={state.dnsServer} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="environment" label="Environment" variant="outlined" sx={{ marginBottom: 2 }} name="environment" value={state.environment} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="fileServer" label="Local File Server Directory" variant="outlined" sx={{ marginBottom: 2 }} name="localFileServerDirectory" value={state.localFileServerDirectory} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="infoApiPort" label="Info API Port" variant="outlined" sx={{ marginBottom: 2 }} name="infoApiPort" value={state.infoApiPort} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="bypassHosts" label="Bypass Hosts" variant="outlined" sx={{ marginBottom: 2 }} name="bypassHosts" value={state.bypassHosts} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="allowHosts" label="Allow Hosts" variant="outlined" sx={{ marginBottom: 2 }} name="allowHosts" value={state.allowHosts} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="logFilePath" label="Log File Path" variant="outlined" sx={{ marginBottom: 2 }} name="logfilepath" value={state.logfilepath} onChange={handleChange}/>
          </div>
          <div>
            <TextField fullWidth id="serverDomain" label="Server Domain" variant="outlined" sx={{ marginBottom: 2 }} name="serverDomain" value={state.serverDomain} onChange={handleChange}/>
          </div>
          <div style={{display:'flex'}}>
            <label style={{fontWeight: 'bold', marginTop:2, marginBottom: 2}} >CONNECTION MODE</label>
            <ToggleButtonGroup
            color="primary"
            onChange={toggleHandleChange}
            aria-label="Platform"
            value={formats}
            >
            <ToggleButton value="mitm" aria-label="bold">MITM</ToggleButton>
            <ToggleButton value="verbose" aria-label="bold">Verbose</ToggleButton>
            <ToggleButton value="shared-tunnel" aria-label="bold">Shared Tunnel</ToggleButton> //--shared-tunnel
            <ToggleButton value="ingress-only" aria-label="bold">Ingress Only</ToggleButton> //--ingress-only
          </ToggleButtonGroup>

          </div>
          <select style={{fontWeight: 'bold' }} name='CONNECTION MODE' id='connectionMode' onChange={selectHandleChange}>
            <option>Auto</option>
            <option>SSH (22)</option>
            <option>SSH (443)</option>
          </select>
        
        </div>
        } 
        </Box>
        <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={runDockerCommand}>
          Start Tunnel
        </Button>

        <Button variant="contained" onClick={() => { stopDockerCommand(); removeDockerCommand();}}>
          Stop Tunnel
        </Button>
        {/* <Button variant="contained" onClick={dockerLogs}>
          Show Logs
        </Button> */}
        
        {/* onClick={() => { stopDockerCommand(); removeDockerCommand();} */}

        </Stack>

        <Stack >

        <Button
          sx={{
            width:'10px',
            height: '10px'
          }}
          onClick={()=>{setIsTunnelVisible(true); setIsCreatingNewTunnel(false)}}>
            <ClearIcon color="primary"></ClearIcon>
          </Button>
        
        </Stack>
        </Stack>}
    </>
    
  );
}


