import { Bonjour } from 'bonjour-service';
import os from 'os';

/**
 * mDNS / Zeroconf Discovery Service
 * 
 * This service broadcasts the presence of the AmisiMedOS Local Node
 * on the local network so that Mobile Clients can discover it automatically.
 */

const bonjour = new Bonjour();
const SITE_NAME = process.env.AMISI_SITE_NAME || 'AmisiMedOS-LocalNode';
const PORT = parseInt(process.env.PORT || '3000', 10);

/**
 * Get the actual LAN IP of this machine.
 */
function getLocalIp() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]!) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

/**
 * Starts advertising the node on the LAN.
 */
export function startDiscovery() {
  const ip = getLocalIp();
  
  console.log(`[Discovery] Starting LAN broadcast for ${SITE_NAME} at ${ip}:${PORT}...`);

  const service = bonjour.publish({
    name: SITE_NAME,
    type: 'amisimedos',
    port: PORT,
    txt: {
      version: '1.0.0',
      node_type: 'CLINICAL_NODE',
      api_path: '/api/trpc',
      host_ip: ip
    }
  });

  service.on('up', () => {
    console.log(`[Discovery] Node is now discoverable as ${SITE_NAME}.local on the LAN.`);
  });

  service.on('error', (err) => {
    console.error('[Discovery] mDNS Error:', err);
  });
}

/**
 * Graceful shutdown for the discovery service.
 */
export function stopDiscovery() {
  bonjour.unpublishAll(() => {
    bonjour.destroy();
    console.log('[Discovery] LAN broadcast stopped.');
  });
}
