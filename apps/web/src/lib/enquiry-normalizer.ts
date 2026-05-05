import { LeadSource, FacilityType } from '@amisimedos/db';

export interface StandardEnquiry {
  name: string;
  organization: string;
  facilityType: FacilityType;
  contactInfo: { email: string; phone?: string };
  requestedModules?: string[];
  message?: string;
  source: LeadSource;
}

// Normalize web form submissions (public frontend forms)
export function normalizeWebForm(data: {
  name: string;
  organization: string;
  facilityType: FacilityType;
  email: string;
  phone?: string;
  requestedModules?: string[];
  message?: string;
}): StandardEnquiry {
  if (!data.name || !data.organization || !data.email || !data.facilityType) {
    throw new Error('Missing critical fields (name, organization, email, facility type)');
  }
  return {
    name: data.name,
    organization: data.organization,
    facilityType: data.facilityType,
    contactInfo: { email: data.email, phone: data.phone },
    requestedModules: data.requestedModules || [],
    message: data.message,
    source: LeadSource.Website,
  };
}

// Normalize WhatsApp enquiries (parse message content)
export function normalizeWhatsApp(data: {
  senderPhone: string;
  message: string;
  senderName?: string;
  organization?: string;
}): StandardEnquiry {
  const msg = data.message.toLowerCase();
  
  // Infer facility type from message
  let facilityType: FacilityType = FacilityType.CLINIC;
  if (msg.includes('hospital')) facilityType = FacilityType.HOSPITAL;
  else if (msg.includes('pharmacy')) facilityType = FacilityType.PHARMACY;

  // Extract organization
  const orgMatch = data.message.match(/organization:\s*([^\n]+)/i);
  const organization = orgMatch ? orgMatch[1].trim() : data.organization || 'Unknown';

  // Extract name
  const nameMatch = data.message.match(/name:\s*([^\n]+)/i);
  const name = nameMatch ? nameMatch[1].trim() : data.senderName || 'Unknown';

  // Extract email
  const emailMatch = data.message.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (!emailMatch) throw new Error('No email found in WhatsApp enquiry');
  const email = emailMatch[0];

  // Extract modules
  const modulesMatch = data.message.match(/modules:\s*([^\n]+)/i);
  const requestedModules = modulesMatch ? modulesMatch[1].split(',').map(m => m.trim()) : [];

  return {
    name,
    organization,
    facilityType,
    contactInfo: { email, phone: data.senderPhone },
    requestedModules,
    message: data.message,
    source: LeadSource.WhatsApp,
  };
}

// Auto-tag leads based on intent
export function autoTagEnquiry(enquiry: StandardEnquiry): string[] {
  const tags: string[] = [];
  const content = `${enquiry.message || ''} ${enquiry.organization}`.toLowerCase();
  const modules = (enquiry.requestedModules || []).map(m => m.toLowerCase());

  // Add facility type as tag
  tags.push(enquiry.facilityType.toLowerCase());  
  
  // Add module tags
  tags.push(...modules);
  
  // Intent-based tags
  if (content.includes('pediatric')) tags.push('pediatric');
  if (content.includes('lab')) tags.push('lab');
  if (content.includes('urgent')) tags.push('urgent');

  return Array.from(new Set(tags)); // Remove duplicates
}
