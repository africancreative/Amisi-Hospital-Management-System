import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Centered branding utility for all Amisi MedOS reports.
 * Enforces the Amisi MedOS Logo in the center of the footer.
 */

const BRANDING_TEXT = 'Amisi MedOS — Designed by amisigenuine.com';
const LOGO_PATH = '/logo.png'; 

export async function createReport(title: string, hospitalSettings: any): Promise<any> {
    const doc = new jsPDF() as any;
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header Layout (Customizable)
    // Left side: Hospital info
    doc.setFontSize(20);
    doc.setTextColor(30, 96, 213); // Brand Blue
    doc.text(hospitalSettings.hospitalName, 14, 20);

    doc.setFontSize(8);
    doc.setTextColor(100);
    const addressLines = [
        hospitalSettings.detailedAddress || hospitalSettings.address,
        hospitalSettings.phone ? `Phone: ${hospitalSettings.phone}` : null,
        hospitalSettings.taxId ? `Tax ID: ${hospitalSettings.taxId}` : null,
        hospitalSettings.contactEmail ? `Email: ${hospitalSettings.contactEmail}` : null
    ].filter(Boolean);

    let y = 26;
    addressLines.forEach(line => {
        doc.text(line, 14, y);
        y += 4;
    });

    // Right side: Marketing / Slogan
    if (hospitalSettings.marketingSlogan) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(120);
        const sloganWidth = doc.getTextWidth(hospitalSettings.marketingSlogan);
        doc.text(hospitalSettings.marketingSlogan, pageWidth - sloganWidth - 14, 20);
    }

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Report: ${title}`, 14, y + 10);
    doc.text(`Generated: ${format(new Date(), 'PPP p')}`, 14, y + 15);

    doc.setLineWidth(0.5);
    doc.line(14, y + 20, pageWidth - 14, y + 20);

    return doc;
}

export function applyBranding(doc: any) {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const footerHeightLimit = pageHeight * 0.08;
    
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        // Horizontal separator
        doc.setDrawColor(229, 231, 235); // gray-200
        doc.setLineWidth(0.1);
        doc.line(14, pageHeight - footerHeightLimit, pageWidth - 14, pageHeight - footerHeightLimit);

        // Logo (Centered in Footer)
        const logoSize = 12;
        const logoX = (pageWidth - logoSize) / 2;
        const logoY = pageHeight - 18;
        try {
            doc.addImage(LOGO_PATH, 'PNG', logoX, logoY, logoSize, logoSize);
        } catch (e) {
            console.warn('Branding logo not found at /logo.png');
        }

        // Branding Text
        doc.setFontSize(7);
        doc.setTextColor(150);
        const textWidth = doc.getTextWidth(BRANDING_TEXT);
        doc.text(BRANDING_TEXT, (pageWidth - textWidth) / 2, pageHeight - 5);

        // Page Numbering
        doc.text(`Page ${i} of ${pageCount}`, 14, pageHeight - 10);
    }
}

export async function generatePatientMedicalRecord(patient: any, events: any[], hospitalSettings: any = { hospitalName: "Amisi General Hospital" }): Promise<any> {
    const doc = await createReport(`Clinical Timeline: ${patient.lastName}, ${patient.firstName}`, hospitalSettings);
    const pageWidth = doc.internal.pageSize.getWidth();
    const startY = 65; // Adjusted for dynamic header

    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Patient ID: ${patient.id}`, 14, startY - 20);
    doc.text(`DOB: ${new Date(patient.dob).toLocaleDateString()}`, 14, startY - 15);

    // Clinical Timeline Table
    const tableData = events.map((event: any) => [
        format(new Date(event.createdAt || event.timestamp), 'dd MMM yyyy'),
        event.eventType === 'CHAT' ? 'COMMUNICATION' : (event.type || 'ENCOUNTER'),
        event.eventType === 'CHAT' ? event.authorName : `Dr. ${event.doctorName || 'Unknown'}`,
        event.notes || event.content || 'N/A'
    ]);

    (doc as any).autoTable({
        startY: startY,
        head: [['Date', 'Type', 'Provider', 'Clinical Notes']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [30, 96, 213] }, // Brand Blue
        styles: { fontSize: 8 },
        columnStyles: { 3: { cellWidth: 80 } }
    });

    applyBranding(doc);
    doc.save(`Medical_Record_${patient.lastName}.pdf`);
}

export async function generateInvoice(invoice: any, hospitalSettings: any = { hospitalName: "Amisi General Hospital" }): Promise<any> {
    const doc = await createReport(`INVOICE: #${invoice.id.slice(0, 8)}`, hospitalSettings);
    const startY = 65;

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Status: ${invoice.status.toUpperCase()}`, 14, startY - 15);
    doc.text(`Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 14, startY - 10);

    // Invoice Table
    (doc as any).autoTable({
        startY: startY,
        head: [['Description', 'Quantity', 'Rate', 'Amount']],
        body: (invoice.items || []).length > 0 ? invoice.items.map((item: any) => [
            item.description,
            item.quantity.toString(),
            `$${Number(item.unitPrice).toLocaleString()}`,
            `$${Number(item.subtotal).toLocaleString()}`
        ]) : [['Clinical Consultation / Service', '1', `$${Number(invoice.totalAmount).toLocaleString()}`, `$${Number(invoice.totalAmount).toLocaleString()}`]],
        theme: 'striped',
        headStyles: { fillColor: [30, 96, 213] }, // Brand Blue
        styles: { fontSize: 10 },
        foot: [['Total', '', '', `$${Number(invoice.totalAmount).toLocaleString()}`]],
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });

    applyBranding(doc);
    doc.save(`Invoice_${invoice.id.slice(0, 8)}.pdf`);
}
