import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import Bonjour from 'bonjour-service';

const dev = process.env.NODE_VALUE !== 'production';
const hostname = '0.0.0.0'; // BIND TO ALL INTERFACES for multi-device support
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Initialize Bonjour for mDNS discovery (allows access via amisimedos.local)
const bonjour = new Bonjour();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      
      // SECURITY: Basic CORS for local network
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,x-tenant-id');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> AmisiMedOS Local Node ready on http://localhost:${port}`);
      console.log(`> Accessible via LAN at http://0.0.0.0:${port}`);
      
      // Advertise service on LAN
      bonjour.publish({ 
        name: `AmisiMedOS-${process.env.HOSPITAL_NAME || 'Node'}`, 
        type: 'http', 
        port: port 
      });
      console.log(`> Service advertised via mDNS as AmisiMedOS.local`);
    });
});
