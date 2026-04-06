"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const zod_1 = require("zod");
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load root workspace env. 
// In a real Vercel/Docker environment this happens natively, but locally we do this:
dotenv.config({ path: path_1.default.join(__dirname, '../../../.env') });
const ConfigSchema = zod_1.z.object({
    NEON_DATABASE_URL: zod_1.z.string().url('Must be a valid Postgres URL for the Control Plane'),
    // Depending on architecture, the default EDGE DB could be needed, or optional.
    LOCAL_EDGE_DATABASE_URL: zod_1.z.string().url().optional(),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
});
let config;
try {
    exports.config = config = ConfigSchema.parse(process.env);
}
catch (error) {
    console.warn('[DB Config] Warning: Missing or invalid environment variables. Some database features may fail.');
    // Provide a dummy config so the module can load, but connections will fail later if actually used
    exports.config = config = {
        NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || '',
        LOCAL_EDGE_DATABASE_URL: process.env.LOCAL_EDGE_DATABASE_URL || '',
        NODE_ENV: 'development',
    };
}
