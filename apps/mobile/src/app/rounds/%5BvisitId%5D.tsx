import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '../../theme/Colors';
import { api } from '../../trpc/client';
import { useState, useMemo } from 'react';
import { useClinicalMutation } from '../../lib/useClinicalMutation';
import { ChevronLeft, Info, Activity, Save } from 'lucide-react-native';

export default function VitalsEntry() {
  const { visitId } = useLocalSearchParams();
  const router = useRouter();
  const utils = api.useUtils();

  const [vitals, setVitals] = useState({
    temp: '',
    hr: '',
    rr: '',
    sysBp: '',
    diaBp: '',
    spo2: '',
    avpu: 'A', // Alert, Voice, Pain, Unresponsive
  });

  const recordVitals = api.clinical.recordVitals.useMutation();
  const clinicalMutation = useClinicalMutation('RECORD_VITALS', recordVitals);

  // Simple NEWS2 calculation logic (simplified for demo)
  const news2Score = useMemo(() => {
    let score = 0;
    const t = parseFloat(vitals.temp);
    const h = parseInt(vitals.hr);
    const r = parseInt(vitals.rr);
    const s = parseInt(vitals.spo2);

    if (t < 35.1 || t > 39) score += 3;
    if (h < 40 || h > 130) score += 3;
    if (r < 8 || r > 25) score += 3;
    if (s < 92) score += 3;
    if (vitals.avpu !== 'A') score += 3;

    return score;
  }, [vitals]);

  const handleSave = async () => {
    const result = await clinicalMutation.mutate({
      visitId,
      ...vitals,
      news2: news2Score,
      timestamp: new Date().toISOString(),
    }, visitId as string);

    if (result.status === 'QUEUED') {
      Alert.alert('Offline Mode', 'Connectivity lost. Data saved locally and will sync when online.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } else {
      Alert.alert('Success', 'Vitals recorded successfully.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ChevronLeft color={Colors.text} size={28} />
        </TouchableOpacity>
        <Text style={styles.title}>Bedside Documentation</Text>
      </View>

      <View style={styles.newsCard}>
        <View style={styles.newsMeta}>
          <Activity color={Colors.primary} size={24} />
          <Text style={styles.newsLabel}>Calculated NEWS2</Text>
        </View>
        <Text style={[styles.newsVal, { color: news2Score >= 5 ? Colors.error : Colors.primary }]}>
          {news2Score}
        </Text>
        <Text style={styles.newsHelp}>
          {news2Score >= 5 ? 'High Risk: Inform Senior Staff' : 'Low Risk: Routine Monitoring'}
        </Text>
      </View>

      <View style={styles.form}>
        <VitalsInput 
          label="Temperature (°C)" 
          value={vitals.temp} 
          onChange={(v) => setVitals({...vitals, temp: v})} 
          placeholder="36.5"
        />
        <VitalsInput 
          label="Heart Rate (BPM)" 
          value={vitals.hr} 
          onChange={(v) => setVitals({...vitals, hr: v})} 
          placeholder="72"
        />
        <VitalsInput 
          label="Respiration Rate" 
          value={vitals.rr} 
          onChange={(v) => setVitals({...vitals, rr: v})} 
          placeholder="16"
        />
        <View style={{ flexDirection: 'row', gap: 15 }}>
          <View style={{ flex: 1 }}>
            <VitalsInput 
              label="Sys BP" 
              value={vitals.sysBp} 
              onChange={(v) => setVitals({...vitals, sysBp: v})} 
              placeholder="120"
            />
          </View>
          <View style={{ flex: 1 }}>
            <VitalsInput 
              label="Dia BP" 
              value={vitals.diaBp} 
              onChange={(v) => setVitals({...vitals, diaBp: v})} 
              placeholder="80"
            />
          </View>
        </View>
        <VitalsInput 
          label="SpO2 (%)" 
          value={vitals.spo2} 
          onChange={(v) => setVitals({...vitals, spo2: v})} 
          placeholder="98"
        />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Save color={Colors.text} size={20} />
        <Text style={styles.saveBtnText}>Save Documentation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function VitalsInput({ label, value, onChange, placeholder }: any) {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput 
        style={styles.input}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType="numeric"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  newsCard: {
    margin: 20,
    marginTop: 0,
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 25,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  newsMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  newsLabel: {
    color: Colors.textMuted,
    fontWeight: '600',
    fontSize: 16,
  },
  newsVal: {
    fontSize: 64,
    fontWeight: '900',
  },
  newsHelp: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 5,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    color: Colors.text,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 15,
    color: Colors.text,
    fontSize: 18,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  saveBtn: {
    margin: 20,
    backgroundColor: Colors.primary,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 50,
  },
  saveBtnText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
