import Bonjour, { Service } from 'bonjour-service';
import os from 'os';

/**
 * AmisiMedOS Local Node — LAN Discovery via mDNS (Bonjour/Avahi)
 *
 * This broadcasts the node's presence on the local network so that
 * workstations can discover it at `amisimedos-local.local` without
 * needing to know the server's manual IP address.
 *
 * On macOS/Windows, this uses Bonjour.
 * On Linux, it requires Avahi (install: apt install avahi-daemon).
 */
export function startLanDiscovery(apiPort: number): void {
    const bonjour = new Bonjour();

    const hostname = os.hostname();

    // Broadcast the API sidecar service
    bonjour.publish({
        name: `AmisiMedOS Edge Node — ${hostname}`,
        type: 'amisimedos',
        port: apiPort,
        txt: {
            version: '1.0.0',
            webPort: '3000',
            nodeType: 'EDGE',
        },
    });

    // Also advertise as HTTP for simple browser discovery
    bonjour.publish({
        name: `AmisiMedOS Web — ${hostname}`,
        type: 'http',
        port: 3000,
        txt: {
            path: '/',
            description: 'AmisiMedOS Clinical Dashboard',
        },
    });

    console.log(`[LAN Discovery] mDNS broadcasting as "${hostname}.local" on port ${apiPort}`);
    console.log(`[LAN Discovery] Clients can discover via: amisimedos-local.local:3000`);

    // Graceful cleanup on shutdown
    process.on('SIGINT', () => {
        bonjour.unpublishAll(() => bonjour.destroy());
    });
    process.on('SIGTERM', () => {
        bonjour.unpublishAll(() => bonjour.destroy());
    });
}

/**
 * Browse for other AmisiMedOS nodes on the LAN.
 * Useful for multi-node hospital setups relaying data to a primary node.
 */
export function discoverPeerNodes(
    onFound: (ip: string, port: number, name: string) => void,
): void {
    const bonjour = new Bonjour();
    bonjour.find({ type: 'amisimedos' }, (service: Service) => {
        const ip = service.addresses?.[0] ?? service.host;
        onFound(ip, service.port, service.name);
    });
}
