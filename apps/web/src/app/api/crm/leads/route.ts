import { NextResponse } from 'next/server';
import { getControlDb } from '@/lib/db';
import { normalizeWebForm, autoTagEnquiry } from '@/lib/enquiry-normalizer';
import { applyAutomationRules } from '@/lib/crm-automation';
import { LeadSource, FacilityType } from '@amisimedos/db';

export async function POST(request: Request): Promise<NextResponse> {
  try {
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
      landingPage,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
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

    // Build UTM params object
    const utmParams = {
      source: utmSource || 'direct',
      medium: utmMedium || 'none',
      campaign: utmCampaign || 'none',
      content: utmContent || 'none',
      term: utmTerm || 'none',
    };

    // Determine source based on UTM or referrer
    let source: LeadSource = LeadSource.Website;
    if (utmSource === 'whatsapp') source = LeadSource.WhatsApp;
    else if (utmSource === 'email') source = LeadSource.Email;
    else if (utmSource === 'sales') source = LeadSource.SalesAgent;

    // Create lead with attribution data
    const lead = await db.lead.create({
      data: {
        hospitalName: standardEnquiry.organization,
        contactName: standardEnquiry.name,
        contactEmail: standardEnquiry.contactInfo.email,
        contactPhone: standardEnquiry.contactInfo.phone,
        source,
        status: 'NewLead',
        facilityType: standardEnquiry.facilityType,
        requestedModules: standardEnquiry.requestedModules || [],
        message: standardEnquiry.message,
        tags: [...tags, `landing:${landingPage || 'direct'}`, `utm_source:${utmParams.source}`],
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
    console.error('Failed to capture lead from landing page:', error);
    return NextResponse.json(
      { error: 'Failed to submit. Please try again.' },
      { status: 500 }
    );
  }
}
