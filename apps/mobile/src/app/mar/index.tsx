import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/Colors';
import { api } from '../../trpc/client';
import { Pill, Clock, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { ConnectivityStatus } from '../../components/ConnectivityStatus';
import { useState } from 'react';

export default function MedicationRecord() {
  const { data: schedule, isLoading } = api.clinical.getMedicationSchedule.useQuery();

  const renderMedication = ({ item }: { item: any }) => (
    <View style={styles.medCard}>
      <View style={styles.timeSection}>
        <Clock size={16} color={Colors.textMuted} />
        <Text style={styles.time}>{item.scheduledTime}</Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.patientName}>{item.patientName}</Text>
          <Text style={styles.bed}>Bed {item.bedNumber}</Text>
        </View>
        
        <View style={styles.medicationInfo}>
          <Pill size={20} color={Colors.primary} />
          <View>
            <Text style={styles.medName}>{item.medicationName}</Text>
            <Text style={styles.dosage}>{item.dosage} • {item.route}</Text>
          </View>
        </View>

        {item.status === 'DUE' ? (
          <TouchableOpacity style={styles.adminBtn}>
            <Text style={styles.adminBtnText}>Document Administration</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.statusBadge}>
            <CheckCircle2 size={16} color={Colors.success} />
            <Text style={styles.statusText}>Administered at {item.administeredAt}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerArea}>
        <ConnectivityStatus />
        <Text style={styles.title}>MAR Timeline</Text>
        <Text style={styles.subtitle}>Medication Administration Record</Text>
      </View>

      <FlatList
        data={schedule}
        renderItem={renderMedication}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No medications scheduled for this period.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerArea: {
    padding: 20,
    gap: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    gap: 20,
  },
  medCard: {
    flexDirection: 'row',
    gap: 15,
  },
  timeSection: {
    width: 60,
    alignItems: 'center',
    gap: 5,
  },
  time: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  content: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientName: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 16,
  },
  bed: {
    color: Colors.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  medicationInfo: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  medName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  dosage: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  adminBtn: {
    backgroundColor: Colors.primary,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  adminBtnText: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.glass,
    padding: 10,
    borderRadius: 10,
  },
  statusText: {
    color: Colors.success,
    fontSize: 13,
    fontWeight: '500',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
  },
});
