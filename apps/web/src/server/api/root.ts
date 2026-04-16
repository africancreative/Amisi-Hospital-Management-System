import { router } from '@/server/trpc/trpc';
import { patientRouter } from './routers/patient';
import { billingRouter } from './routers/billing';
import { chatRouter } from './routers/chat';
import { communicationRouter } from './routers/communication';
import { internalChatRouter } from './routers/internalChat';
import { syncRouter } from './routers/sync';
import { labRouter } from './routers/lab';
import { pharmacyRouter } from './routers/pharmacy';
import { radiologyRouter } from './routers/radiology';
import { wardRouter } from './routers/ward';
import { nursingRouter } from './routers/nursing';
import { analyticsRouter } from './routers/analytics';
import { clinicalRouter } from './routers/clinical';
import { systemRouter } from './routers/system';
import { auditRouter } from './routers/audit';
import { authRouter } from './routers/auth';

/**
 * Root tRPC Router
 */
export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  patient: patientRouter,
  billing: billingRouter,
  chat: chatRouter,
  communication: communicationRouter,
  internalChat: internalChatRouter,
  sync: syncRouter,
  lab: labRouter,
  pharmacy: pharmacyRouter,
  radiology: radiologyRouter,
  ward: wardRouter,
  nursing: nursingRouter,
  analytics: analyticsRouter,
  clinical: clinicalRouter,
  audit: auditRouter,
});









export type AppRouter = typeof appRouter;
