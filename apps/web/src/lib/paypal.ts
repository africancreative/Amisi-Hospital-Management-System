import { Client, Environment, LogLevel, OrdersController } from "@paypal/paypal-server-sdk";
import { getControlDb } from "@amisimedos/db";

async function getPayPalConfig() {
    const db = getControlDb();
    const settings = await db.globalSettings.findUnique({
        where: { id: 'singleton' }
    });

    if (settings?.paypalClientId && settings?.paypalClientSecret) {
        return {
            clientId: settings.paypalClientId,
            clientSecret: settings.paypalClientSecret,
            environment: settings.paypalEnv === 'production' ? Environment.Production : Environment.Sandbox
        };
    }

    // Fallback to Env
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
        throw new Error('Missing PayPal credentials in both Database and Environment');
    }

    return {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        environment: process.env.PAYPAL_ENVIRONMENT === 'production' ? Environment.Production : Environment.Sandbox
    };
}

export async function getOrdersController() {
    const config = await getPayPalConfig();
    
    const client = new Client({
        clientCredentialsAuthCredentials: {
            oAuthClientId: config.clientId,
            oAuthClientSecret: config.clientSecret
        },
        timeout: 0,
        environment: config.environment,
        logging: {
            logLevel: LogLevel.Info,
            logRequest: { logBody: true },
            logResponse: { logHeaders: true }
        }
    });

    return new OrdersController(client);
}
