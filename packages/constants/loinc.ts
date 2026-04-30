/**
 * Standard LOINC Dictionary for AmisiMedOS
 * Aligned with International Interoperability Standards.
 */

export interface LabParameter {
    code: string;
    display: string;
    unit: string;
    range: string;
}

export interface LabTestDefinition {
    loinc: string;
    name: string;
    parameters: LabParameter[];
}

export const LOINC_LAB_TESTS: Record<string, LabTestDefinition> = {
    'FBC': {
        loinc: '58410-2',
        name: 'Full Blood Count',
        parameters: [
            { code: 'WBC', display: 'White Blood Cell Count', unit: '10^3/uL', range: '4.5 - 11.0' },
            { code: 'RBC', display: 'Red Blood Cell Count', unit: '10^6/uL', range: '4.5 - 5.9' },
            { code: 'HGB', display: 'Hemoglobin', unit: 'g/dL', range: '13.5 - 17.5' },
            { code: 'HCT', display: 'Hematocrit', unit: '%', range: '41 - 53' },
            { code: 'PLT', display: 'Platelet Count', unit: '10^3/uL', range: '150 - 450' }
        ]
    },
    'MP': {
        loinc: '50550-3',
        name: 'Malaria Parasite',
        parameters: [
            { code: 'MP_RESULT', display: 'Malaria Result', unit: 'Qualitative', range: 'Negative' },
            { code: 'MP_DENSITY', display: 'Parasite Density', unit: '/uL', range: '0' }
        ]
    },
    'LFT': {
        loinc: '24325-3',
        name: 'Liver Function Test',
        parameters: [
            { code: 'ALT', display: 'Alanine Aminotransferase', unit: 'U/L', range: '7 - 56' },
            { code: 'AST', display: 'Aspartate Aminotransferase', unit: 'U/L', range: '10 - 40' },
            { code: 'ALP', display: 'Alkaline Phosphatase', unit: 'U/L', range: '44 - 147' },
            { code: 'BIL_T', display: 'Bilirubin, Total', unit: 'mg/dL', range: '0.1 - 1.2' }
        ]
    },
    'UE': {
        loinc: '24326-1',
        name: 'Urea & Electrolytes',
        parameters: [
            { code: 'UREA', display: 'Urea', unit: 'mg/dL', range: '7 - 20' },
            { code: 'CREAT', display: 'Creatinine', unit: 'mg/dL', range: '0.7 - 1.3' },
            { code: 'SOD', display: 'Sodium', unit: 'mEq/L', range: '135 - 145' },
            { code: 'POT', display: 'Potassium', unit: 'mEq/L', range: '3.6 - 5.2' }
        ]
    }
};
