'use server';

import { Resend } from 'resend';

// Default to a stub key if not configured, or gracefully handle failure
const resend = new Resend(process.env.RESEND_API_KEY || 're_stub_key_here');

export async function submitHospitalInquiry(data: {
    hospitalName: string;
    contactName: string;
    email: string;
    phone: string;
    bedCapacity: string;
    notes: string;
}): Promise<any> {
    if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY is not defined. Email dispatch bypassed in DEV mode.');
        // We simulate success if no key mapped to unblock dev flow
        return { success: true, simulated: true };
    }

    try {
        const result = await resend.emails.send({
            from: 'AmisiMedOS Onboarding <onboarding@AmisiMedOS.amisigenuine.com>',
            to: ['amisi@amisigenuine.com'],
            subject: `New Hospital Inquiry: ${data.hospitalName}`,
            html: `
                <h2>New Enterprise Inquiry</h2>
                <p><strong>Hospital Name:</strong> ${data.hospitalName}</p>
                <p><strong>Contact:</strong> ${data.contactName}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Bed Capacity:</strong> ${data.bedCapacity}</p>
                <br/>
                <p><strong>Additional Notes:</strong><br/>${data.notes}</p>
                <br/>
                <hr/>
                <p><small>System Generated. Please log into the AmisiMedOS System Admin panel to provision their Tenant.</small></p>
            `,
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

        return { success: true };
    } catch (error: any) {
        console.error('Email dispatch failed:', error);
        throw new Error(error.message || 'Failed to send inquiry.');
    }
}
