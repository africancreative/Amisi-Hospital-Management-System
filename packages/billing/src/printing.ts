import { TenantClient } from '@amisimedos/db';

export type PrintFormat = 'THERMAL' | 'A4';
export type DocumentType = 'RECEIPT' | 'INVOICE' | 'BILL' | 'STATEMENT';

export interface PrintData {
    invoiceId: string;
    format: PrintFormat;
    copies?: number;
}

export interface ReceiptData {
    invoiceNumber: string;
    date: string;
    patientName: string;
    patientMrn: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
    }>;
    subtotal: number;
    tax: number;
    total: number;
    amountPaid: number;
    balance: number;
    paymentMethod: string;
    cashierName: string;
    hospitalName: string;
    hospitalAddress: string;
    hospitalPhone: string;
    footerMessage?: string;
}

export interface InvoiceData {
    invoiceNumber: string;
    date: string;
    dueDate?: string;
    patientName: string;
    patientMrn: string;
    patientAddress?: string;
    patientPhone?: string;
    insuranceProvider?: string;
    insurancePolicyNumber?: string;
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
        category?: string;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    amountPaid: number;
    balance: number;
    status: string;
    hospitalName: string;
    hospitalAddress: string;
    hospitalPhone: string;
    hospitalEmail?: string;
    hospitalTaxId?: string;
    terms?: string;
    notes?: string;
}

export class PrintService {
    private db: TenantClient;

    constructor(db: TenantClient) {
        this.db = db;
    }

    async generateReceipt(invoiceId: string, format: PrintFormat = 'THERMAL'): Promise<ReceiptData> {
        const invoice = await this.db.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                patient: true,
                billItems: true,
                payments: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            }
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);

        const receipt: ReceiptData = {
            invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
            date: invoice.createdAt.toISOString().split('T')[0],
            patientName: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
            patientMrn: invoice.patient.mrn,
            items: invoice.billItems.map(item => ({
                description: item.description,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                total: Number(item.totalPrice)
            })),
            subtotal: Number(invoice.totalAmount),
            tax: 0,
            total: Number(invoice.totalAmount),
            amountPaid: totalPaid,
            balance: Number(invoice.balanceDue),
            paymentMethod: invoice.payments[0]?.method || 'CASH',
            cashierName: 'System',
            hospitalName: 'AmisiMedOS Hospital',
            hospitalAddress: '123 Medical Drive, City',
            hospitalPhone: '+254 700 000000',
            footerMessage: 'Thank you for choosing us!'
        };

        return receipt;
    }

    async generateInvoice(invoiceId: string, format: PrintFormat = 'A4'): Promise<InvoiceData> {
        const invoice = await this.db.invoice.findUnique({
            where: { id: invoiceId },
            include: {
                patient: true,
                billItems: true,
                payments: true
            }
        });

        if (!invoice) {
            throw new Error('Invoice not found');
        }

        const totalPaid = invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);

        const invoiceData: InvoiceData = {
            invoiceNumber: invoice.id.slice(0, 8).toUpperCase(),
            date: invoice.createdAt.toISOString().split('T')[0],
            patientName: `${invoice.patient.firstName} ${invoice.patient.lastName}`,
            patientMrn: invoice.patient.mrn,
            patientAddress: invoice.patient.address || undefined,
            patientPhone: invoice.patient.phone || undefined,
            insuranceProvider: invoice.patient.insuranceProvider || undefined,
            insurancePolicyNumber: invoice.patient.insuranceId || undefined,
            items: invoice.billItems.map(item => ({
                description: item.description,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                total: Number(item.totalPrice),
                category: item.category
            })),
            subtotal: Number(invoice.totalAmount),
            discount: 0,
            tax: 0,
            total: Number(invoice.totalAmount),
            amountPaid: totalPaid,
            balance: Number(invoice.balanceDue),
            status: invoice.status,
            hospitalName: 'AmisiMedOS Hospital',
            hospitalAddress: '123 Medical Drive, City',
            hospitalPhone: '+254 700 000000',
            hospitalEmail: 'billing@amisimedos.com',
            hospitalTaxId: 'TAX123456',
            terms: 'Payment due within 30 days',
            notes: 'Thank you for your business'
        };

        return invoiceData;
    }

    generateThermalHTML(receipt: ReceiptData): string {
        const itemsHTML = receipt.items.map(item => `
            <tr>
                <td>${this.escapeHtml(item.description)}</td>
                <td style="text-align:right">${item.quantity}</td>
                <td style="text-align:right">${item.unitPrice.toFixed(2)}</td>
                <td style="text-align:right">${item.total.toFixed(2)}</td>
            </tr>
        `).join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Receipt</title>
    <style>
        @page { size: 80mm; margin: 0; }
        body { 
            font-family: 'Courier New', monospace; 
            font-size: 10px; 
            width: 80mm; 
            margin: 0 auto;
            padding: 5mm;
        }
        .header { text-align: center; margin-bottom: 10px; }
        .header h2 { margin: 0; font-size: 14px; }
        .info { margin-bottom: 10px; }
        .info p { margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 9px; }
        th, td { padding: 2px; border-bottom: 1px dashed #ccc; }
        .totals { margin-top: 10px; border-top: 2px solid #000; }
        .totals p { margin: 2px 0; display: flex; justify-content: space-between; }
        .total-row { font-weight: bold; font-size: 12px; }
        .footer { text-align: center; margin-top: 15px; font-size: 9px; }
        @media print { body { width: 80mm; } }
    </style>
</head>
<body>
    <div class="header">
        <h2>${this.escapeHtml(receipt.hospitalName)}</h2>
        <p>${this.escapeHtml(receipt.hospitalAddress)}</p>
        <p>${this.escapeHtml(receipt.hospitalPhone)}</p>
    </div>
    
    <div class="info">
        <p><strong>Receipt:</strong> ${receipt.invoiceNumber}</p>
        <p><strong>Date:</strong> ${receipt.date}</p>
        <p><strong>Patient:</strong> ${this.escapeHtml(receipt.patientName)}</p>
        <p><strong>MRN:</strong> ${receipt.patientMrn}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Item</th>
                <th style="text-align:right">Qty</th>
                <th style="text-align:right">Price</th>
                <th style="text-align:right">Total</th>
            </tr>
        </thead>
        <tbody>
            ${itemsHTML}
        </tbody>
    </table>

    <div class="totals">
        <p><span>Subtotal:</span> <span>${receipt.subtotal.toFixed(2)}</span></p>
        <p><span>Tax:</span> <span>${receipt.tax.toFixed(2)}</span></p>
        <p class="total-row"><span>TOTAL:</span> <span>${receipt.total.toFixed(2)}</span></p>
        <p><span>Paid:</span> <span>${receipt.amountPaid.toFixed(2)}</span></p>
        <p class="total-row"><span>BALANCE:</span> <span>${receipt.balance.toFixed(2)}</span></p>
    </div>

    <div class="footer">
        <p>Payment: ${receipt.paymentMethod}</p>
        <p>Cashier: ${receipt.cashierName}</p>
        <p>${receipt.footerMessage || ''}</p>
    </div>
</body>
</html>`;
    }

    generateA4InvoiceHTML(invoice: InvoiceData): string {
        const itemsHTML = invoice.items.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${this.escapeHtml(item.description)}</td>
                <td style="text-align:center">${item.quantity}</td>
                <td style="text-align:right">${item.unitPrice.toFixed(2)}</td>
                <td style="text-align:right">${item.total.toFixed(2)}</td>
            </tr>
        `).join('');

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice ${invoice.invoiceNumber}</title>
    <style>
        @page { size: A4; margin: 15mm; }
        body { 
            font-family: Arial, sans-serif; 
            font-size: 11px; 
            max-width: 210mm; 
            margin: 0 auto;
            color: #333;
        }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .hospital-info h1 { margin: 0 0 10px 0; color: #1a73e8; }
        .invoice-info { text-align: right; }
        .invoice-info h2 { margin: 0 0 10px 0; }
        .patient-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
        .patient-info table { width: 100%; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th { background: #1a73e8; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        .totals { float: right; width: 300px; }
        .totals table { margin: 0; }
        .totals td { border: none; padding: 5px; }
        .totals .total-row { font-size: 14px; font-weight: bold; border-top: 2px solid #333; }
        .balance { color: #d32f2f; }
        .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
        .status { 
            display: inline-block; padding: 3px 10px; border-radius: 3px; 
            background: ${invoice.status === 'PAID' ? '#4caf50' : '#ff9800'}; 
            color: white;
        }
        @media print { body { -webkit-print-color-adjust: exact; } }
    </style>
</head>
<body>
    <div class="header">
        <div class="hospital-info">
            <h1>${this.escapeHtml(invoice.hospitalName)}</h1>
            <p>${this.escapeHtml(invoice.hospitalAddress)}</p>
            <p>Phone: ${invoice.hospitalPhone}</p>
            ${invoice.hospitalEmail ? `<p>Email: ${invoice.hospitalEmail}</p>` : ''}
            ${invoice.hospitalTaxId ? `<p>Tax ID: ${invoice.hospitalTaxId}</p>` : ''}
        </div>
        <div class="invoice-info">
            <h2>INVOICE</h2>
            <p><strong>Invoice #:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Date:</strong> ${invoice.date}</p>
            ${invoice.dueDate ? `<p><strong>Due Date:</strong> ${invoice.dueDate}</p>` : ''}
            <p><span class="status">${invoice.status}</span></p>
        </div>
    </div>

    <div class="patient-info">
        <table>
            <tr>
                <td><strong>Patient Name:</strong> ${this.escapeHtml(invoice.patientName)}</td>
                <td><strong>MRN:</strong> ${invoice.patientMrn}</td>
            </tr>
            ${invoice.patientAddress ? `<tr><td><strong>Address:</strong> ${this.escapeHtml(invoice.patientAddress)}</td></tr>` : ''}
            ${invoice.patientPhone ? `<tr><td><strong>Phone:</strong> ${invoice.patientPhone}</td></tr>` : ''}
            ${invoice.insuranceProvider ? `
            <tr>
                <td><strong>Insurance:</strong> ${invoice.insuranceProvider}</td>
                <td><strong>Policy #:</strong> ${invoice.insurancePolicyNumber || 'N/A'}</td>
            </tr>
            ` : ''}
        </table>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Description</th>
                <th style="text-align:center">Qty</th>
                <th style="text-align:right">Unit Price</th>
                <th style="text-align:right">Total</th>
            </tr>
        </thead>
        <tbody>
            ${itemsHTML}
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr><td>Subtotal:</td><td style="text-align:right">${invoice.subtotal.toFixed(2)}</td></tr>
            ${invoice.discount > 0 ? `<tr><td>Discount:</td><td style="text-align:right">-${invoice.discount.toFixed(2)}</td></tr>` : ''}
            ${invoice.tax > 0 ? `<tr><td>Tax:</td><td style="text-align:right">${invoice.tax.toFixed(2)}</td></tr>` : ''}
            <tr class="total-row"><td>TOTAL:</td><td style="text-align:right">${invoice.total.toFixed(2)}</td></tr>
            <tr><td>Paid:</td><td style="text-align:right">${invoice.amountPaid.toFixed(2)}</td></tr>
            <tr class="total-row"><td>BALANCE:</td><td style="text-align:right" class="balance">${invoice.balance.toFixed(2)}</td></tr>
        </table>
    </div>

    <div style="clear:both"></div>

    ${invoice.terms ? `<p><strong>Terms:</strong> ${invoice.terms}</p>` : ''}
    ${invoice.notes ? `<p><strong>Notes:</strong> ${invoice.notes}</p>` : ''}

    <div class="footer">
        <p>Thank you for your business!</p>
        <p>Generated by AmisiMedOS</p>
    </div>
</body>
</html>`;
    }

    private escapeHtml(text: string): string {
        const map: Record<string, string> = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    async printReceipt(invoiceId: string, format: PrintFormat = 'THERMAL'): Promise<string> {
        if (format === 'THERMAL') {
            const receipt = await this.generateReceipt(invoiceId, 'THERMAL');
            return this.generateThermalHTML(receipt);
        } else {
            const invoice = await this.generateInvoice(invoiceId, 'A4');
            return this.generateA4InvoiceHTML(invoice);
        }
    }

    async printInvoice(invoiceId: string, format: PrintFormat = 'A4'): Promise<string> {
        if (format === 'A4') {
            const invoice = await this.generateInvoice(invoiceId, 'A4');
            return this.generateA4InvoiceHTML(invoice);
        } else {
            const receipt = await this.generateReceipt(invoiceId, 'THERMAL');
            return this.generateThermalHTML(receipt);
        }
    }
}

export const createPrintService = (db: TenantClient) => new PrintService(db);