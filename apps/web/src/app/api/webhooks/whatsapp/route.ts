import { NextResponse } from 'next/server';
import { getControlDb } from '@/lib/db';
import { normalizeWhatsApp, autoTagEnquiry } from '@/lib/enquiry-normalizer';
import { applyAutomationRules } from '@/lib/crm-automation';
import { LeadSource, FacilityType } from '@amisimedos/db';

// WhatsApp webhook verification (for Meta/Facebook)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || 'amisimedos-whatsapp-token';

  if (mode === 'subscribe' && token === verifyToken) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse('Verification failed', { status: 403 });
}

// Receive WhatsApp messages
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const db = getControlDb();
    const body = await request.json();

    // Meta WhatsApp Business API format
    if (body.object === 'whatsapp_business_account') {
      const entries = body.entry || [];
      let leadsCreated = 0;

      for (const entry of entries) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            const messages = change.value?.messages || [];
            
            for (const msg of messages) {
              if (msg.type === 'text') {
                try {
                  const enquiry = normalizeWhatsApp({
                    senderPhone: msg.from,
                    message: msg.text.body,
                  });

                  const tags = autoTagEnquiry(enquiry);

                  const lead = await db.lead.create({
                    data: {
                      hospitalName: enquiry.organization,
                      contactName: enquiry.name,
                      contactEmail: enquiry.contactInfo.email,
                      contactPhone: enquiry.contactInfo.phone,
                      source: LeadSource.WhatsApp,
                      status: 'NewLead',
                      facilityType: enquiry.facilityType,
                      requestedModules: enquiry.requestedModules || [],
                      message: enquiry.message,
                      tags: [...tags, 'whatsapp'],
                      customConfig: JSON.stringify({
                        waMessageId: msg.id,
                        waTimestamp: new Date(msg.timestamp * 1000).toISOString(),
                        submittedAt: new Date().toISOString(),
                      }),
                    },
                  });

                  applyAutomationRules(lead.id, 'create').catch(err =>
                    console.error('Automation failed for lead', lead.id, err)
                  );

                  leadsCreated++;
                } catch (err: any) {
                  console.error('Failed to process WhatsApp message:', err.message);
                }
              }
            }
          }
        }
      }

      return NextResponse.json({ success: true, leadsCreated });
    }

    // Simple direct format (for testing or custom integrations)
    if (body.senderPhone && body.message) {
      try {
        const enquiry = normalizeWhatsApp({
          senderPhone: body.senderPhone,
          message: body.message,
          senderName: body.senderName,
          organization: body.organization,
        });

        const tags = autoTagEnquiry(enquiry);

        const lead = await db.lead.create({
          data: {
            hospitalName: enquiry.organization,
            contactName: enquiry.name,
            contactEmail: enquiry.contactInfo.email,
            contactPhone: enquiry.contactInfo.phone,
            source: LeadSource.WhatsApp,
            status: 'NewLead',
            facilityType: enquiry.facilityType,
            requestedModules: enquiry.requestedModules || [],
            message: enquiry.message,
            tags: [...tags, 'whatsapp'],
            customConfig: JSON.stringify({
              submittedAt: new Date().toISOString(),
            }),
          },
        });

        applyAutomationRules(lead.id, 'create').catch(err =>
          console.error('Automation failed for lead', lead.id, err)
        );

        return NextResponse.json({
          success: true,
          leadId: lead.id,
          message: 'WhatsApp enquiry captured successfully.',
        });
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message || 'Failed to process WhatsApp enquiry' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true, message: 'No messages to process' });
  } catch (error: any) {
    console.error('WhatsApp webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
