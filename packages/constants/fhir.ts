/**
 * AmisiMedOS FHIR Interoperability Layer
 * Standardized mappings for FHIR R4 resources.
 */

export interface FHIRResource {
    resourceType: string;
    id: string;
    meta?: {
        lastUpdated: string;
        versionId: string;
    };
}

export interface FHIRPatient extends FHIRResource {
    resourceType: 'Patient';
    identifier: Array<{ system: string; value: string }>;
    name: Array<{ family: string; given: string[] }>;
    gender: 'male' | 'female' | 'other' | 'unknown';
    birthDate: string;
}

export interface FHIRObservation extends FHIRResource {
    resourceType: 'Observation';
    status: 'final' | 'preliminary' | 'corrected';
    code: {
        coding: Array<{ system: string; code: string; display: string }>;
        text: string;
    };
    subject: { reference: string };
    effectiveDateTime: string;
    valueQuantity?: {
        value: number;
        unit: string;
        system: string;
        code: string;
    };
}

export interface FHIRMedicationRequest extends FHIRResource {
    resourceType: 'MedicationRequest';
    status: 'active' | 'on-hold' | 'cancelled' | 'completed';
    intent: 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option';
    medicationCodeableConcept: {
        coding: Array<{ system: string; code: string; display: string }>;
        text: string;
    };
    subject: { reference: string };
    authoredOn: string;
    requester: { reference: string };
}

export interface FHIREncounter extends FHIRResource {
    resourceType: 'Encounter';
    status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled';
    class: { system: string; code: string; display: string };
    subject: { reference: string };
    participant: Array<{
        type?: Array<{ coding: Array<{ system: string; code: string; display: string }> }>;
        individual: { reference: string };
    }>;
    period: { start: string; end?: string };
}

/**
 * SNOMED CT Clinical Terminology (Subset)
 */
export const SNOMED_CODES = {
    HYPERTENSION: { code: '38341003', display: 'Hypertensive disorder' },
    DIABETES_MELLITUS: { code: '73211009', display: 'Diabetes mellitus' },
    MALARIA: { code: '61462000', display: 'Malaria' },
    PNEUMONIA: { code: '233604007', display: 'Pneumonia' },
};

/**
 * ICD-10 Diagnosis Classification (Subset)
 */
export const ICD10_CODES = {
    MALARIA_FALCIPARUM: { code: 'B50.9', display: 'Plasmodium falciparum malaria, unspecified' },
    ESSENTIAL_HYPERTENSION: { code: 'I10', display: 'Essential (primary) hypertension' },
    TYPE_2_DIABETES: { code: 'E11.9', display: 'Type 2 diabetes mellitus without complications' },
};

/**
 * FHIR System URIs
 */
export const FHIR_SYSTEMS = {
    MRN: 'https://amisigenuine.com/fhir/sid/mrn',
    SNOMED: 'http://snomed.info/sct',
    LOINC: 'http://loinc.org',
    ICD10: 'http://hl7.org/fhir/sid/icd-10',
};
