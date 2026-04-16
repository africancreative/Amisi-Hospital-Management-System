import { TenantClient } from '@amisimedos/db';
import crypto from 'crypto';

export type EncounterType = 'OPD' | 'ED' | 'IPD' | 'DIAGNOSTICS';
export type EncounterStatus = 'CHECKED_IN' | 'TRIAGED' | 'IN_PROGRESS' | 'COMPLETED' | 'DISCHARGED';
export type NoteType = 'GENERAL' | 'NURSING' | 'DOCTOR' | 'DISCHARGE' | 'FOLLOW_UP';
export type WorkflowStep = 'CHECK_IN' | 'TRIAGE' | 'CONSULTATION' | 'DIAGNOSTICS' | 'TREATMENT' | 'DISCHARGE';

export interface CreateEncounterInput {
    patientId: string;
    encounterType: EncounterType;
    doctorId?: string;
    doctorName?: string;
    department?: string;
    reason?: string;
}

export interface EncounterStepResult {
    success: boolean;
    encounter?: any;
    step: WorkflowStep;
    billItem?: any;
    notes?: any;
    chat?: any;
    error?: string;
}

export interface BillItemInput {
    visitId: string;
    encounterId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    category: 'CONSULTATION' | 'LAB' | 'PHARMACY' | 'PROCEDURE' | 'RADIOLOGY' | 'BED' | 'NURSING' | 'OTHER';
}

export class ClinicalWorkflowService {
    private db: TenantClient;

    constructor(db: TenantClient) {
        this.db = db;
    }

    async createEncounter(input: CreateEncounterInput): Promise<EncounterStepResult> {
        const visit = await this.db.visit.create({
            data: {
                patientId: input.patientId,
                type: input.encounterType === 'IPD' ? 'INPATIENT' : 
                      input.encounterType === 'ED' ? 'EMERGENCY' : 'OUTPATIENT',
                status: 'OPEN',
                reason: input.reason
            }
        });

        const encounter = await this.db.encounter.create({
            data: {
                patientId: input.patientId,
                visitId: visit.id,
                encounterType: input.encounterType,
                doctorId: input.doctorId,
                doctorName: input.doctorName,
                type: this.getEncounterTypeName(input.encounterType),
                department: input.department,
                status: 'CHECKED_IN',
                checkedInAt: new Date()
            },
            include: {
                patient: true,
                visit: true
            }
        });

        const billItem = await this.createBillItem({
            visitId: visit.id,
            encounterId: encounter.id,
            description: `${input.encounterType} Registration`,
            quantity: 1,
            unitPrice: this.getRegistrationPrice(input.encounterType),
            category: 'CONSULTATION'
        });

        return {
            success: true,
            encounter,
            step: 'CHECK_IN',
            billItem
        };
    }

    async addNote(encounterId: string, authorId: string, authorName: string, authorRole: string, content: string, noteType: NoteType = 'GENERAL') {
        const note = await this.db.encounterNote.create({
            data: {
                encounterId,
                authorId,
                authorName,
                authorRole,
                content,
                noteType
            }
        });

        return note;
    }

    async addChat(encounterId: string, senderId: string, senderName: string, senderRole: string, content: string) {
        const chat = await this.db.encounterChat.create({
            data: {
                encounterId,
                senderId,
                senderName,
                senderRole,
                content
            }
        });

        return chat;
    }

    async createBillItem(input: BillItemInput) {
        const totalPrice = input.quantity * input.unitPrice;
        
        const billItem = await this.db.billItem.create({
            data: {
                visitId: input.visitId,
                description: input.description,
                quantity: input.quantity,
                unitPrice: input.unitPrice,
                totalPrice,
                category: input.category,
                status: 'UNPAID'
            }
        });

        return billItem;
    }

    async processTriage(encounterId: string, esiLevel: number, triageNotes: string, triageById: string, triageByName: string): Promise<EncounterStepResult> {
        const encounter = await this.db.encounter.update({
            where: { id: encounterId },
            data: {
                esiLevel,
                triageNotes,
                status: 'TRIAGED',
                triagedAt: new Date()
            }
        });

        const billItem = await this.createBillItem({
            visitId: encounter.visitId!,
            encounterId,
            description: `Triage (ESI Level ${esiLevel})`,
            quantity: 1,
            unitPrice: this.getTriagePrice(esiLevel),
            category: 'CONSULTATION'
        });

        return {
            success: true,
            encounter,
            step: 'TRIAGE',
            billItem
        };
    }

    async startConsultation(encounterId: string, doctorId: string, doctorName: string): Promise<EncounterStepResult> {
        const encounter = await this.db.encounter.update({
            where: { id: encounterId },
            data: {
                doctorId,
                doctorName,
                status: 'IN_PROGRESS',
                seenAt: new Date()
            }
        });

        const billItem = await this.createBillItem({
            visitId: encounter.visitId!,
            encounterId,
            description: `Consultation - ${doctorName}`,
            quantity: 1,
            unitPrice: this.getConsultationPrice(encounter.encounterType),
            category: 'CONSULTATION'
        });

        return {
            success: true,
            encounter,
            step: 'CONSULTATION',
            billItem
        };
    }

    async orderDiagnostics(encounterId: string, orderedById: string, orderedByName: string, tests: { name: string; category: 'LAB' | 'RADIOLOGY'; price: number }[]): Promise<EncounterStepResult> {
        const encounter = await this.db.encounter.findUnique({ where: { id: encounterId } });
        
        const orderItems = await Promise.all(
            tests.map(test => 
                this.db.diagnosticOrder.create({
                    data: {
                        patientId: encounter!.patientId,
                        encounterId,
                        category: test.category,
                        testName: test.name,
                        orderedBy: orderedByName,
                        status: 'pending'
                    }
                })
            )
        );

        const billItems = await Promise.all(
            tests.map(test =>
                this.createBillItem({
                    visitId: encounter!.visitId!,
                    encounterId,
                    description: `${test.category}: ${test.name}`,
                    quantity: 1,
                    unitPrice: test.price,
                    category: test.category === 'LAB' ? 'LAB' : 'RADIOLOGY'
                })
            )
        );

        return {
            success: true,
            encounter,
            step: 'DIAGNOSTICS',
            billItem: billItems
        };
    }

    async completeEncounter(encounterId: string, notes?: string, plan?: string): Promise<EncounterStepResult> {
        const encounter = await this.db.encounter.update({
            where: { id: encounterId },
            data: {
                status: 'COMPLETED',
                notes,
                plan,
                completedAt: new Date()
            }
        });

        return {
            success: true,
            encounter,
            step: 'DISCHARGE'
        };
    }

    async dischargePatient(encounterId: string, dischargeSummary: string): Promise<EncounterStepResult> {
        const encounter = await this.db.encounter.update({
            where: { id: encounterId },
            data: {
                status: 'DISCHARGED',
                dischargeSummary,
                dischargedAt: new Date()
            }
        });

        const visit = await this.db.visit.update({
            where: { id: encounter.visitId! },
            data: {
                status: 'CLOSED',
                dischargedAt: new Date()
            }
        });

        const billItem = await this.createBillItem({
            visitId: visit.id,
            encounterId,
            description: 'Discharge Fee',
            quantity: 1,
            unitPrice: 50,
            category: 'OTHER'
        });

        return {
            success: true,
            encounter,
            step: 'DISCHARGE',
            billItem
        };
    }

    async admitToIPD(encounterId: string, bedId: string, wardId: string, admissionReason: string): Promise<EncounterStepResult> {
        const encounter = await this.db.encounter.update({
            where: { id: encounterId },
            data: {
                status: 'IN_PROGRESS',
                roomBed: bedId
            }
        });

        const admission = await this.db.admission.create({
            data: {
                encounterId,
                bedId,
                admissionReason,
                status: 'ADMITTED'
            }
        });

        const bed = await this.db.bed.update({
            where: { id: bedId },
            data: { status: 'OCCUPIED' }
        });

        const billItem = await this.createBillItem({
            visitId: encounter.visitId!,
            encounterId,
            description: `IPD Admission - ${bed.ward?.name || 'Ward'}`,
            quantity: 1,
            unitPrice: 100,
            category: 'BED'
        });

        return {
            success: true,
            encounter,
            step: 'TREATMENT',
            billItem
        };
    }

    async getEncounterNotes(encounterId: string) {
        return this.db.encounterNote.findMany({
            where: { encounterId },
            orderBy: { createdAt: 'asc' }
        });
    }

    async getEncounterChats(encounterId: string) {
        return this.db.encounterChat.findMany({
            where: { encounterId },
            orderBy: { createdAt: 'asc' }
        });
    }

    private getEncounterTypeName(type: EncounterType): string {
        switch (type) {
            case 'OPD': return 'Outpatient';
            case 'ED': return 'Emergency';
            case 'IPD': return 'Inpatient';
            case 'DIAGNOSTICS': return 'Diagnostics';
            default: return 'General';
        }
    }

    private getRegistrationPrice(type: EncounterType): number {
        switch (type) {
            case 'OPD': return 50;
            case 'ED': return 100;
            case 'IPD': return 200;
            case 'DIAGNOSTICS': return 25;
            default: return 50;
        }
    }

    private getTriagePrice(level: number): number {
        const prices: Record<number, number> = { 1: 150, 2: 100, 3: 75, 4: 50, 5: 25 };
        return prices[level] || 50;
    }

    private getConsultationPrice(type: EncounterType): number {
        switch (type) {
            case 'OPD': return 100;
            case 'ED': return 150;
            case 'IPD': return 200;
            case 'DIAGNOSTICS': return 50;
            default: return 100;
        }
    }
}

export const createClinicalWorkflow = (db: TenantClient) => new ClinicalWorkflowService(db);