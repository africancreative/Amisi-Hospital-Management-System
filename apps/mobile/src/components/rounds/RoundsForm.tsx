import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { ChevronRight, Save, ShieldCheck } from 'lucide-react-native';
import { calculateNEWS2, getRiskLevel } from '@amisimedos/sync/news2';

interface RoundsFormProps {
  patient: any;
  onSave: (data: any) => void;
}

/**
 * Mobile Ward Rounds Form
 * 
 * Optimized for rapid data entry during bedside visits.
 * Features real-time NEWS2 calculation to provide immediate clinical 
 * decision support to the nurse.
 */
export function RoundsForm({ patient, onSave }: RoundsFormProps) {
  const [vitals, setVitals] = useState({
    temp: '',
    hr: '',
    rr: '',
    spO2: '',
    bp: '',
    isOxygen: false,
    cvpu: 'A' // A, C, V, P, U
  });

  const [score, setScore] = useState(0);
  const [risk, setRisk] = useState('LOW');

  // Real-time calculation
  useEffect(() => {
    const systolicBP = vitals.bp ? parseInt(vitals.bp.split('/')[0]) : undefined;
    const computed = calculateNEWS2({
      temperature: parseFloat(vitals.temp),
      heartRate: parseInt(vitals.hr),
      respiratoryRate: parseInt(vitals.rr),
      spO2: parseInt(vitals.spO2),
      isSupplementalOxygen: vitals.isOxygen,
      consciousness: vitals.cvpu as any,
      systolicBP
    }, 1); // Default to Scale 1

    setScore(computed);
    setRisk(getRiskLevel(computed));
  }, [vitals]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Vitals & Observation</Text>
          <Text style={styles.subtitle}>{patient.name} • {patient.mrn}</Text>
        </View>

        {/* Real-time Triage Score (Clinical Decision Support) */}
        <View style={[styles.scoreCard, { 
          backgroundColor: score >= 5 ? '#dc2626' : score >= 3 ? '#ea580c' : '#16a34a' 
        }]}>
          <View>
            <Text style={styles.scoreLabel}>NEWS2 SCORE</Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </div>
          <View style={styles.riskWrap}>
            <Text style={styles.riskLabel}>{risk} RISK</Text>
            <Text style={styles.riskDesc}>
              {score >= 5 ? 'URGENT MEDICAL ASSESSMENT' : 'Routine monitoring'}
            </Text>
          </View>
        </View>

        {/* Input Fields */}
        <View style={styles.grid}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>TEMP (°C)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              placeholder="36.5" 
              placeholderTextColor="#475569"
              onChangeText={(val) => setVitals({...vitals, temp: val})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>BP (mmHg)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="120/80" 
              placeholderTextColor="#475569"
              onChangeText={(val) => setVitals({...vitals, bp: val})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>HEART RATE</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              placeholder="72" 
              placeholderTextColor="#475569"
              onChangeText={(val) => setVitals({...vitals, hr: val})}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SPO2 (%)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              placeholder="98" 
              placeholderTextColor="#475569"
              onChangeText={(val) => setVitals({...vitals, spO2: val})}
            />
          </View>
        </View>

        {/* Consciousness (ACVPU) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CONSCIOUSNESS (ACVPU)</Text>
          <View style={styles.acvpuRow}>
            {['A', 'C', 'V', 'P', 'U'].map((level) => (
              <TouchableOpacity 
                key={level}
                onPress={() => setVitals({...vitals, cvpu: level})}
                style={[styles.acvpuBtn, vitals.cvpu === level && styles.acvpuActive]}
              >
                <Text style={[styles.acvpuText, vitals.cvpu === level && styles.acvpuActiveText]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Action Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={() => onSave({...vitals, news2Score: score})}>
          <ShieldCheck color="white" size={18} />
          <Text style={styles.saveBtnText}>VALIDATE & SIGN ROUND</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '900', color: 'white', letterSpacing: -1 },
  subtitle: { color: '#64748b', fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  scoreCard: {
    padding: 24,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  scoreLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  scoreValue: { color: 'white', fontSize: 48, fontWeight: '900', marginTop: -5 },
  riskWrap: { alignItems: 'flex-end', flex: 1 },
  riskLabel: { color: 'white', fontSize: 18, fontWeight: '900' },
  riskDesc: { color: 'rgba(255,255,255,0.8)', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', textAlign: 'right' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  inputGroup: { width: '47%', marginBottom: 20 },
  inputLabel: { color: '#475569', fontSize: 10, fontWeight: '900', marginBottom: 8 },
  input: { 
    backgroundColor: '#0f172a', 
    borderWidth: 1, 
    borderColor: '#1e293b', 
    borderRadius: 12, 
    padding: 16, 
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  section: { marginTop: 12 },
  sectionTitle: { color: '#475569', fontSize: 10, fontWeight: '900', marginBottom: 12 },
  acvpuRow: { flexDirection: 'row', gap: 8 },
  acvpuBtn: { 
    flex: 1, 
    height: 50, 
    backgroundColor: '#0f172a', 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  acvpuActive: { backgroundColor: '#3b82f6', borderColor: '#60a5fa' },
  acvpuText: { color: '#64748b', fontWeight: 'bold' },
  acvpuActiveText: { color: 'white' },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    backgroundColor: '#020617', 
    padding: 24, 
    borderTopWidth: 1, 
    borderTopColor: '#1e293b' 
  },
  saveBtn: { 
    backgroundColor: '#16a34a', 
    height: 56, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 12 
  },
  saveBtnText: { color: 'white', fontSize: 14, fontWeight: '900' }
});
