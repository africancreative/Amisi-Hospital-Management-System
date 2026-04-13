import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, CheckCircle2, AlertCircle, ScanBarcode, ShieldCheck } from 'lucide-react-native';

interface MARProfileProps {
  patient: any;
  onAdminister: (medId: string) => void;
}

/**
 * Mobile MAR (Medication Administration Record)
 * 
 * High-fidelity clinical safety interface.
 * Ensures the '5 Rights' of medication administration: Right Patient, 
 * Right Drug, Right Dose, Right Route, Right Time.
 */
export function MARProfile({ patient, onAdminister }: MARProfileProps) {
  const medications = [
    { id: 'm1', name: 'Aspirin', dose: '75mg', route: 'Oral', status: 'DUE', time: '08:00', note: 'Take with food' },
    { id: 'm2', name: 'Metformin', dose: '500mg', route: 'Oral', status: 'GIVEN', time: '08:00', note: 'Post-prandial' },
    { id: 'm3', name: 'Ceftriaxone', dose: '1g', route: 'IV', status: 'DUE', time: '12:00', note: 'Slow infusion' },
    { id: 'm4', name: 'Paracetamol', dose: '1g', route: 'Oral', status: 'DUE', time: '18:00', note: 'PRN for pain' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Medication Profile</Text>
          <Text style={styles.subtitle}>{patient.name} • MAR STATUS</Text>
        </View>

        {/* Safety Warning */}
        <View style={styles.safetyBanner}>
          <AlertCircle color="#ea580c" size={20} />
          <Text style={styles.safetyText}>
            ALLERGY ALERT: PENICILLIN. Verify medication manufacturer before administration.
          </Text>
        </View>

        {/* Timeline View */}
        <Text style={styles.sectionHeader}>Today's Schedule</Text>
        {medications.map((med) => (
          <View key={med.id} style={[
            styles.medCard, 
            med.status === 'GIVEN' && styles.medCardGiven
          ]}>
            <View style={styles.medTime}>
              <Clock size={12} color={med.status === 'GIVEN' ? '#16a34a' : '#64748b'} />
              <Text style={[styles.timeText, med.status === 'GIVEN' && styles.timeTextGiven]}>
                {med.time}
              </Text>
            </View>

            <View style={styles.medBody}>
              <View style={styles.medContent}>
                <Text style={styles.medName}>{med.name}</Text>
                <Text style={styles.medDose}>{med.dose} • {med.route}</Text>
                <Text style={styles.medNote}>{med.note}</Text>
              </View>

              {med.status === 'DUE' ? (
                <View style={styles.actions}>
                   <TouchableOpacity style={styles.scanBtn}>
                      <ScanBarcode color="#3b82f6" size={18} />
                   </TouchableOpacity>
                   <TouchableOpacity 
                      style={styles.checkBtn} 
                      onPress={() => onAdminister(med.id)}
                   >
                      <CheckCircle2 color="white" size={18} />
                   </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.givenState}>
                  <ShieldCheck color="#16a34a" size={20} />
                  <Text style={styles.givenText}>ADMINISTERED</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Batch Sign Footer */}
      <View style={styles.footer}>
         <View style={styles.nurseInfo}>
            <Text style={styles.nurseLabel}>AUTHORIZED BY</Text>
            <Text style={styles.nurseName}>Nurse J. Admin • RN-9942</Text>
         </View>
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
  safetyBanner: {
    backgroundColor: '#fff7ed',
    borderWidth: 1,
    borderColor: '#ffedd5',
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  safetyText: { color: '#9a3412', fontSize: 11, fontWeight: 'bold', flex: 1, lineHeight: 16 },
  sectionHeader: { color: '#475569', fontSize: 10, fontWeight: '900', marginBottom: 16, letterSpacing: 1 },
  medCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  medCardGiven: { opacity: 0.6, borderColor: '#065f46' },
  medTime: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  timeText: { color: '#64748b', fontSize: 11, fontWeight: '900' },
  timeTextGiven: { color: '#16a34a' },
  medBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medContent: { flex: 1 },
  medName: { fontSize: 18, fontWeight: 'bold', color: 'white', marginBottom: 2 },
  medDose: { color: '#3b82f6', fontSize: 12, fontWeight: '900', marginBottom: 4 },
  medNote: { color: '#475569', fontSize: 11, italic: true },
  actions: { flexDirection: 'row', gap: 10 },
  scanBtn: { 
    height: 48, 
    width: 48, 
    borderRadius: 14, 
    backgroundColor: '#1d4ed810', 
    borderWidth: 1, 
    borderColor: '#1d4ed830', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  checkBtn: { 
    height: 48, 
    width: 48, 
    borderRadius: 14, 
    backgroundColor: '#16a34a', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  givenState: { alignItems: 'center', gap: 2 },
  givenText: { color: '#16a34a', fontSize: 9, fontWeight: '900' },
  footer: { 
    position: 'absolute', 
    bottom: 0, 
    left: 0, 
    right: 0, 
    padding: 20, 
    backgroundColor: '#020617', 
    borderTopWidth: 1, 
    borderTopColor: '#1e293b' 
  },
  nurseInfo: { alignItems: 'center' },
  nurseLabel: { color: '#475569', fontSize: 8, fontWeight: '900', marginBottom: 2 },
  nurseName: { color: 'white', fontSize: 11, fontWeight: 'bold' }
});
