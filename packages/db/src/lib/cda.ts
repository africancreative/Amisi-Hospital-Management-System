import { Patient, Encounter } from '../types';

/**
 * HL7 CDA R2 Generator Utility for AmisiMedOS
 * Aligned with Section 5.2 of the Technical Whitepaper.
 */

export interface CDADocumentData {
    patient: Patient;
    encounter: Encounter;
    notes: any[];
    author: {
        id: string;
        name: string;
        role: string;
    };
    hospitalName: string;
}

export function generateCDAXML(data: CDADocumentData): string {
    const { patient, encounter, notes, author, hospitalName } = data;
    const now = new Date().toISOString().replace(/[-:T]/g, '').split('.')[0];
    const dob = new Date(patient.dob).toISOString().replace(/[-:T]/g, '').split('.')[0];

    return `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:hl7-org:v3 CDA.xsd">
    <!-- CDA Header -->
    <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
    <id root="2.16.840.1.113883.19.5" extension="${encounter.id}"/>
    <code code="11488-4" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Consultation Note"/>
    <title>AmisiMedOS Clinical Consultation - ${hospitalName}</title>
    <effectiveTime value="${now}"/>
    <confidentialityCode code="N" codeSystem="2.16.840.1.113883.5.25"/>
    <languageCode code="en-US"/>

    <recordTarget>
        <patientRole>
            <id root="2.16.840.1.113883.19.5" extension="${patient.mrn}"/>
            <addr>
                <streetAddressLine>${patient.address || 'Unknown'}</streetAddressLine>
            </addr>
            <telecom value="tel:${patient.phone || '000'}" use="HP"/>
            <patient>
                <name>
                    <given>${patient.firstName}</given>
                    <family>${patient.lastName}</family>
                </name>
                <administrativeGenderCode code="${patient.gender === 'M' ? 'M' : 'F'}" codeSystem="2.16.840.1.113883.5.1"/>
                <birthTime value="${dob}"/>
            </patient>
        </patientRole>
    </recordTarget>

    <author>
        <time value="${now}"/>
        <assignedAuthor>
            <id root="2.16.840.1.113883.19.5" extension="${author.id}"/>
            <assignedPerson>
                <name>
                    <prefix>Dr.</prefix>
                    <family>${author.name}</family>
                </name>
            </assignedPerson>
            <representedOrganization>
                <name>${hospitalName}</name>
            </representedOrganization>
        </assignedAuthor>
    </author>

    <custodian>
        <assignedCustodian>
            <representedCustodianOrganization>
                <id root="2.16.840.1.113883.19.5" extension="AMISI-HOS-ID"/>
                <name>${hospitalName}</name>
            </representedCustodianOrganization>
        </assignedCustodian>
    </custodian>

    <!-- CDA Body -->
    <component>
        <structuredBody>
            <component>
                <section>
                    <code code="10164-2" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="History of Present Illness"/>
                    <title>History of Present Illness</title>
                    <text>
                        <list>
                            ${notes.map(n => `<item>${n.type}: ${n.subjective || n.content || 'N/A'}</item>`).join('\n                            ')}
                        </list>
                    </text>
                </section>
            </component>
            
            <component>
                <section>
                    <code code="29545-1" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Physical Examination"/>
                    <title>Physical Examination</title>
                    <text>
                        <paragraph>${encounter.notes || 'No specific physical exam notes recorded.'}</paragraph>
                        ${encounter.temperature ? `<paragraph>Temperature: ${encounter.temperature} °C</paragraph>` : ''}
                        ${encounter.systolicBP ? `<paragraph>BP: ${encounter.systolicBP}/${encounter.diastolicBP} mmHg</paragraph>` : ''}
                    </text>
                </section>
            </component>

            <component>
                <section>
                    <code code="18776-5" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Treatment Plan"/>
                    <title>Plan of Treatment</title>
                    <text>
                        <paragraph>${encounter.plan || 'Routine follow-up.'}</paragraph>
                    </text>
                </section>
            </component>
        </structuredBody>
    </component>
</ClinicalDocument>`;
}
