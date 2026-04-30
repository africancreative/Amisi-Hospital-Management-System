import { Patient, Encounter, VitalsLog } from './types';

/**
 * AmisiMedOS FHIR R4 Mapping System
 * 
 * Adheres to HL7 FHIR R4 standards for the EventJournal payload.
 * Provides semantic interoperability for clinical data exchange.
 */

export interface FHIRResource {
    resourceType: string;
    id: string;
    meta?: {
        versionId?: string;
        lastUpdated?: string;
        profile?: string[];
    };
}

export interface FHIRPatient extends FHIRResource {
    resourceType: 'Patient';
    identifier: Array<{
        system: string;
        value: string;
        use?: string;
    }>;
    name: Array<{
        use: string;
        family: string;
        given: string[];
    }>;
    gender: 'male' | 'female' | 'other' | 'unknown';
    birthDate: string;
    telecom?: Array<{
        system: 'phone' | 'email';
        value: string;
    }>;
}

export interface FHIREncounter extends FHIRResource {
    resourceType: 'Encounter';
    status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
    class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode';
        code: 'AMB' | 'EMR' | 'IMP' | 'SS'; // Ambulatory, Emergency, Inpatient, Short Stay
        display: string;
    };
    subject: {
        reference: string; // Patient/UUID
    };
}

export interface FHIRObservation extends FHIRResource {
    resourceType: 'Observation';
    status: 'final' | 'preliminary' | 'corrected' | 'cancelled';
    category: Array<{
        coding: Array<{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category';
            code: 'vital-signs';
        }>;
    }>;
    code: {
        coding: Array<{
            system: 'http://loinc.org';
            code: string;
            display: string;
        }>;
    };
    subject: {
        reference: string;
    };
    encounter?: {
        reference: string;
    };
    effectiveDateTime: string;
    valueQuantity?: {
        value: number;
        unit: string;
        system: 'http://unitsofmeasure.org';
        code: string;
    };
}

/**
 * Mapper: Internal Patient -> FHIR Patient
 */
export function mapToFHIRPatient(p: Patient): FHIRPatient {
    return {
        resourceType: 'Patient',
        id: p.id,
        identifier: [
            { system: 'https://amisimedos.com/identifiers/mrn', value: p.mrn, use: 'official' }
        ],
        name: [
            { use: 'official', family: p.lastName, given: [p.firstName] }
        ],
        gender: (p.gender?.toLowerCase() as any) || 'unknown',
        birthDate: p.dob.toISOString().split('T')[0]
    };
}

/**
 * Mapper: Internal Encounter -> FHIR Encounter
 */
export function mapToFHIREncounter(e: Encounter): FHIREncounter {
    const statusMap: Record<string, FHIREncounter['status']> = {
        'CHECKED_IN': 'arrived',
        'TRIAGED': 'triaged',
        'IN_PROGRESS': 'in-progress',
        'COMPLETED': 'finished',
        'DISCHARGED': 'finished'
    };

    const classMap: Record<string, FHIREncounter['class']['code']> = {
        'OPD': 'AMB',
        'ED': 'EMR',
        'IPD': 'IMP',
        'DIAGNOSTICS': 'SS'
    };

    return {
        resourceType: 'Encounter',
        id: e.id,
        status: statusMap[e.status] || 'in-progress',
        class: {
            system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
            code: classMap[e.encounterType] || 'AMB',
            display: e.encounterType
        },
        subject: {
            reference: `Patient/${e.patientId}`
        }
    };
}

/**
 * Mapper: Internal Vitals -> FHIR Observations (LOINC)
 */
export function mapToFHIRObservations(v: VitalsLog): FHIRObservation[] {
    const observations: FHIRObservation[] = [];
    const timestamp = v.recordedAt.toISOString();
    const subRef = { reference: `Patient/${v.patientId}` };
    const encRef = v.encounterId ? { reference: `Encounter/${v.encounterId}` } : undefined;

    const createObs = (code: string, display: string, value: number, unit: string, unitCode: string): FHIRObservation => ({
        resourceType: 'Observation',
        id: `${v.id}-${code}`,
        status: 'final',
        category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'vital-signs' }] }],
        code: { coding: [{ system: 'http://loinc.org', code, display }] },
        subject: subRef,
        encounter: encRef,
        effectiveDateTime: timestamp,
        valueQuantity: { value, unit, system: 'http://unitsofmeasure.org', code: unitCode }
    });

    if (v.temperature) observations.push(createObs('8310-5', 'Body temperature', Number(v.temperature), 'C', 'Cel'));
    if (v.heartRate) observations.push(createObs('8867-4', 'Heart rate', v.heartRate, 'bpm', '/min'));
    if (v.spO2) observations.push(createObs('2708-6', 'Oxygen saturation', v.spO2, '%', '%'));
    if (v.respiratoryRate) observations.push(createObs('9279-1', 'Respiratory rate', v.respiratoryRate, 'bpm', '/min'));

    return observations;
}
