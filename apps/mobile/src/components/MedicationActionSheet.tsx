import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../theme/Colors';
import { Pill, Check, X, AlertCircle } from 'lucide-react-native';
import { useClinicalMutation } from '../lib/useClinicalMutation';
import { api } from '../trpc/client';

interface MedicationActionSheetProps {
  medication: any;
  onClose: () => void;
}

export function MedicationActionSheet({ medication, onClose }: MedicationActionSheetProps) {
  const administerMedication = api.clinical.administerMedication.useMutation();
  const clinicalMutation = useClinicalMutation('ADMINISTER_MED', administerMedication);

  const handleAction = async (status: 'ADMINISTERED' | 'REFUSED' | 'HELD') => {
    const result = await clinicalMutation.mutate({
      scheduleId: medication.id,
      status,
      timestamp: new Date().toISOString(),
    }, medication.visitId);

    if (result.status === 'QUEUED') {
      Alert.alert('Saved Offline', 'Action queued and will sync when connectivity returns.');
    }
    
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.indicator} />
      
      <View style={styles.header}>
        <Pill color={Colors.primary} size={32} />
        <View>
          <Text style={styles.medName}>{medication.medicationName}</Text>
          <Text style={styles.dosage}>{medication.dosage} • {medication.route}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: Colors.success }]}
          onPress={() => handleAction('ADMINISTERED')}
        >
          <Check color={Colors.text} size={20} />
          <Text style={styles.btnText}>Confirm Administration</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: Colors.error }]}
          onPress={() => handleAction('REFUSED')}
        >
          <X color={Colors.text} size={20} />
          <Text style={styles.btnText}>Patient Refused</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, { backgroundColor: Colors.warning }]}
          onPress={() => handleAction('HELD')}
        >
          <AlertCircle color={Colors.text} size={20} />
          <Text style={styles.btnText}>Hold Medication</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 25,
    paddingBottom: 40,
    gap: 25,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  indicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  medName: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
  },
  dosage: {
    color: Colors.textMuted,
    fontSize: 16,
  },
  actions: {
    gap: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 12,
  },
  btnText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    alignItems: 'center',
    padding: 10,
  },
  cancelText: {
    color: Colors.textMuted,
    fontSize: 16,
  },
});
