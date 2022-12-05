import React from 'react';
import Button from '@mui/material/Button';
import { Box } from '@mui/system';

import { createDockerDesktopClient } from '@docker/extension-api-client';
import { Stack, TextField, Typography } from '@mui/material';


// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();


function useDockerDesktopClient() {
  return client;
}

export function App() {
  // const [response, setResponse] = React.useState<string>();

  const ddClient = useDockerDesktopClient();

  // const fetchAndDisplayResponse = async () => {
  //   const result = await ddClient.extension.vm?.service?.get('/hello');
  //   setResponse(JSON.stringify(result));
  // };

  

  const [state, setState] = React.useState({
    userName: "",
    accessKey: "",
  });

  // const [dockerInfo, setDockerInfo] = React.useState<any>(null);
  
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    console.log(event.target.value)
    const value = event.target.value;
    setState({
      ...state,
      [event.target.name]: value,
    });
    
  }
  
  const startCommand ="-i --name lt lambdatest/tunnel:latest --user "+state.userName+" --key "+ state.accessKey

  async function runDockerCommand() {
    console.log(startCommand)
    await ddClient.docker.cli.exec('run', [
      startCommand,
      '"{{ json .Status }}"',
     
    ]);
    console.log(isTunnelVisible + "Before")
    setIsTunnelVisible(true)
    console.log(isTunnelVisible + "After")
    // setDockerInfo(result.parseJsonObject());
  }

  // const logCommand = "-f /lt"

  // function dockerLogs()
  // {
  //    ddClient.docker.cli.exec('logs', [
  //     logCommand
     
  //   ]);
  // }

  const containerName = "lt"

   function stopDockerCommand() {
    
    ddClient.docker.cli.exec('stop', [
      containerName
    ]);
    
  }

   function removeDockerCommand() {
    console.log(containerName)

    const logs = ddClient.docker.cli.exec('rm', ['-f', containerName]);
    console.log(logs)
  }

  const [logs, setLogs] = React.useState<string[]>([]);

  const [isTunnelVisible, setIsTunnelVisible] = React.useState(false)

  React.useEffect(() => {
    const listener = ddClient.docker.cli.exec('logs', ["-f", "-t", "/lt"], {
      stream: {
        onOutput(data): void {
          console.log(data.stdout);
          if(!!data.stdout){
            if(!isTunnelVisible){
              setIsTunnelVisible(true)
            }
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

    return () => {
      listener.close();
    }
  }, []);


  return (
    <>
      <Stack direction="column" alignItems="center" spacing={2}>
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
    
      <Box id="logBox"
      sx={{
        
        width: 700,
        height: 300,
        backgroundColor: '#f4f4f6',
        font : "white",
        whiteSpace:'pre-wrap'
      }}
      >
      {logs}
      </Box>
      </Stack>
      </Stack>


      // Running tunnel visibility
      <div>{isTunnelVisible}</div>
     { isTunnelVisible && <div style=
    {{ 
      display: 'flex',
     alignItems: 'center'}}
    ><div style={{
    backgroundColor: 'green',
    width: '12px',
    height: '12px',
    borderRadius: '50%',
    alignItems: 'center',
    marginRight: '5px',
    }}
  ></div><div>Tunnel Name</div></div>
  }
    </>
    
  );
}


