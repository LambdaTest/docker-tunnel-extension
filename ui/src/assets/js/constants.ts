export const lumsUrl = 'https://accounts.lambdatest.com';

export const proxyConfigs: {
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

export const advanceConfig: {
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

export const switchKeyValuePair = {
    sharedTunnel: 'shared-tunnel',
    verbose: 'verbose',
    mitm: 'mitm',
    ingressOnly: 'ingress-only',
};
