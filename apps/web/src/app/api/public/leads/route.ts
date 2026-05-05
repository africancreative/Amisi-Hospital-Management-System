import { NextResponse } from 'next/server';
import { getControlDb } from '@/lib/db';
import { normalizeWebForm, autoTagEnquiry } from '@/lib/enquiry-normalizer';
import { applyAutomationRules } from '@/lib/crm-automation';
import { LeadSource, FacilityType } from '@amisimedos/db';

// Rate limiting store (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitMap.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 1000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 5) return false; // 5 requests per minute
  limit.count++;
  return true;
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    console.log('POST /api/public/leads hit - IP:', request.headers.get('x-forwarded-for'));
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const db = getControlDb();
    const body = await request.json();
    const {
      name,
      organization,
      facilityType = 'Clinic',
      email,
      phone,
      requestedModules,
      message,
      source = 'Website',
      landingPage,
      utmParams,
    } = body;

    // Validate required fields
    if (!name || !organization || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name, organization, email' },
        { status: 400 }
      );
    }

    // Normalize the enquiry
    const standardEnquiry = normalizeWebForm({
      name,
      organization,
      facilityType: facilityType as FacilityType,
      email,
      phone,
      requestedModules,
      message,
    });

    // Auto-tag based on content
    const tags = autoTagEnquiry(standardEnquiry);

    // Create lead with attribution data
    const lead = await db.lead.create({
      data: {
        hospitalName: standardEnquiry.organization,
        contactName: standardEnquiry.name,
        contactEmail: standardEnquiry.contactInfo.email,
        contactPhone: standardEnquiry.contactInfo.phone,
        source: standardEnquiry.source,
        status: 'NewLead',
        facilityType: standardEnquiry.facilityType,
        requestedModules: standardEnquiry.requestedModules || [],
        message: standardEnquiry.message,
        tags: [...tags, `landing:${landingPage || 'direct'}`],
        customConfig: JSON.stringify({
          utmParams,
          landingPage,
          submittedAt: new Date().toISOString(),
        }),
      },
    });

    // Trigger automation asynchronously
    applyAutomationRules(lead.id, 'create').catch(err =>
      console.error('Automation failed for lead', lead.id, err)
    );

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Thank you! We will contact you soon.',
    });
  } catch (error: any) {
    console.error('Failed to capture lead:', error);
    return NextResponse.json(
      { error: 'Failed to submit. Please try again.' },
      { status: 500 }
    );
  }
}
