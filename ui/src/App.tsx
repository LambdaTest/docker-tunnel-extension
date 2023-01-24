import React, { useState } from 'react';
import { Landing } from './Landing';
import { Form } from './Form';
import { Logs } from './Logs';
import { useDockerDesktopClient } from './assets/js/dockerDesktop';

export function App() {
    const ddClient = useDockerDesktopClient();
    const [currentPage, setCurrentPage] = useState('landing');
    const [tunnelDataMap, setTunnelDataMap] = useState([]);
    const [activeLogs, setActiveLogs] = useState('');

    React.useEffect(() => {
        const func = async () => {
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
                console.log('tunnelsMap', tunnelsArray);
                setTunnelDataMap(tunnelsArray);
                setCurrentPage('logs');
            }
        };
        func();
    }, [ddClient.docker.cli]);

    return (
        <>
            {
                {
                    landing: <Landing setCurrentPage={setCurrentPage} />,
                    form: (
                        <Form
                            setCurrentPage={setCurrentPage}
                            tunnelDataMap={tunnelDataMap}
                            setTunnelDataMap={setTunnelDataMap}
                            setActiveLogs={setActiveLogs}
                        />
                    ),
                    logs: (
                        <Logs
                            setCurrentPage={setCurrentPage}
                            tunnelDataMap={tunnelDataMap}
                            setTunnelDataMap={setTunnelDataMap}
                            activeLogs={activeLogs}
                            setActiveLogs={setActiveLogs}
                        />
                    ),
                }[currentPage]
            }
        </>
    );
}
