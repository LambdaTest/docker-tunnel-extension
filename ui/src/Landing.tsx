import { Box, Typography } from '@mui/material';
import { Container, Stack } from '@mui/system';
import { DockerButton } from './MuiTheme';

export function Landing({ setCurrentPage }) {
    return (
        <Container maxWidth='sm'>
            <Stack
                direction={'row'}
                alignItems='center'
                height={'100vh'}
                display='flex'
            >
                <Stack
                    alignItems={'center'}
                    spacing={4}
                >
                    <Typography
                        fontWeight={'bold'}
                        variant='h1'
                    >
                        Lambdatest Docker Tunnel
                    </Typography>
                    <Typography
                        textAlign={'center'}
                        fontWeight={500}
                    >
                        No need to launch tunnel through CLI anymore. LambdaTest
                        Tunnel Docker Extension will automatically execute the
                        tunnel binary to establish a secure connection for
                        testing locally hosted pages on LambdaTest.
                    </Typography>
                    <DockerButton
                        variant='contained'
                        size='large'
                        onClick={() => setCurrentPage('form')}
                    >
                        Setup Tunnel
                    </DockerButton>
                    <Box></Box>
                    <img
                        src={require('./assets/image/shipImage.svg').default}
                        alt='Dockership'
                    />
                </Stack>
            </Stack>
        </Container>
    );
}
