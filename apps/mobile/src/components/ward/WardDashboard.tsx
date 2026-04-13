import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, Activity, AlertTriangle, ChevronRight, Droplets } from 'lucide-react-native';
import { useConnectivity } from '../../../trpc/ConnectivityProvider';

/**
 * Mobile Ward Dashboard
 * 
 * Optimized for high-velocity nursing rounds.
 * Uses NEWS2 scoring to color-code patient cards for urgent triage.
 */
export default function WardDashboard() {
  const { state: connState } = useConnectivity();

  const patients = [
    { id: '1', name: 'John Doe', mrn: 'PT-2024-001', bed: 'ICU-04', news2: 6, risk: 'HIGH', bp: '90/60', hr: 110 },
    { id: '2', name: 'Jane Smith', mrn: 'PT-2024-002', bed: 'GEN-12', news2: 2, risk: 'LOW', bp: '120/80', hr: 72 },
    { id: '3', name: 'Alice Brown', mrn: 'PT-2024-005', bed: 'GEN-15', news2: 4, risk: 'MEDIUM', bp: '135/95', hr: 88 },
  ];

  return (
    <View style={styles.container}>
      {/* Header & Connectivity Status */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Medical Ward A</Text>
          <Text style={styles.headerSubtitle}>{patients.length} Active Patients</Text>
        </div>
        <View style={[
          styles.connBadge, 
          { backgroundColor: connState === 'OFFLINE' ? '#450a0a' : '#065f46' }
        ]}>
          <Text style={styles.connText}>{connState.replace('_', ' ')}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {patients.map((p) => (
          <TouchableOpacity key={p.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.patientName}>{p.name}</Text>
                <Text style={styles.patientMrn}>{p.mrn} • Bed {p.bed}</Text>
              </View>
              <View style={[
                styles.newsBadge, 
                { backgroundColor: p.news2 >= 5 ? '#dc2626' : p.news2 >= 3 ? '#ea580c' : '#16a34a' }
              ]}>
                <Text style={styles.newsText}>{p.news2} NEWS2</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Activity size={12} color="#94a3b8" />
                <Text style={styles.statValue}>{p.bp}</Text>
                <Text style={styles.statLabel}>BP</Text>
              </View>
              <View style={styles.stat}>
                <Heart size={12} color="#94a3b8" />
                <Text style={styles.statValue}>{p.hr}</Text>
                <Text style={styles.statLabel}>HR</Text>
              </View>
              <View style={styles.stat}>
                <Droplets size={12} color="#94a3b8" />
                <Text style={styles.statValue}>98%</Text>
                <Text style={styles.statLabel}>SPO2</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn}>
                <Text style={styles.actionBtnText}>RECORD ROUNDS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, styles.marBtn]}>
                <Text style={[styles.actionBtnText, styles.marBtnText]}>VIEW MAR</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Quick Action Floating Button */}
      {connState === 'OFFLINE' && (
        <View style={styles.offlineAlert}>
          <AlertTriangle color="white" size={16} />
          <Text style={styles.offlineAlertText}>Working Offline • 2 Pending Syncs</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  headerSubtitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  connBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  connText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  patientName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  patientMrn: {
    color: '#94a3b8',
    fontSize: 12,
  },
  newsBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newsText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  stat: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 2,
  },
  statValue: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
  },
  statLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionBtnText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  marBtn: {
    backgroundColor: '#065f46',
  },
  marBtnText: {
    color: '#34d399',
  },
  offlineAlert: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#ef4444',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  offlineAlertText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  }
});
