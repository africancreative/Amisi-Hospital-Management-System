import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Colors } from '../theme/Colors';
import { Stethoscope, Activity, Database, Bell, Pill, Users } from 'lucide-react-native';
import { api } from '../trpc/client';
import { useRouter } from 'expo-router';
import { ConnectivityStatus } from '../components/ConnectivityStatus';

export default function DashboardIndex() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <ConnectivityStatus />
        <TouchableOpacity style={styles.iconBtn}>
          <Bell size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.brandTitle}>AmisiMedOS <Text style={{ color: Colors.secondary }}>Staff</Text></Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { borderLeftColor: Colors.primary, borderLeftWidth: 4 }]}>
          <Users size={20} color={Colors.primary} />
          <Text style={styles.statVal}>12</Text>
          <Text style={styles.statLabel}>My Patients</Text>
        </View>
        <View style={[styles.statCard, { borderLeftColor: Colors.error, borderLeftWidth: 4 }]}>
          <Activity size={20} color={Colors.error} />
          <Text style={styles.statVal}>3</Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Clinical Actions</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push('/rounds')}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
              <Stethoscope size={28} color={Colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Ward Rounds</Text>
            <Text style={styles.actionSub}>Vitals & NEWS2</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionBtn}
            onPress={() => router.push('/mar')}
          >
            <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
              <Pill size={28} color={Colors.secondary} />
            </View>
            <Text style={styles.actionLabel}>MAR</Text>
            <Text style={styles.actionSub}>Medication Admin</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Local Node Sync</Text>
        <TouchableOpacity style={styles.syncStatus}>
          <View style={styles.syncIndicator} />
          <View>
            <Text style={styles.statusTitle}>Storage Connected</Text>
            <Text style={styles.statusSubtitle}>0 pending offline changes</Text>
          </View>
          <Database size={20} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
    gap: 30,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    gap: 4,
  },
  greeting: {
    color: Colors.textMuted,
    fontSize: 16,
    fontWeight: '500',
  },
  brandTitle: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '900',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statVal: {
    color: Colors.text,
    fontSize: 32,
    fontWeight: '900',
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  section: {
    gap: 15,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.card,
    padding: 24,
    borderRadius: 24,
    gap: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  actionSub: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  recentActivity: {
    gap: 15,
  },
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 20,
    gap: 15,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  syncIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  statusTitle: {
    color: Colors.text,
    fontWeight: 'bold',
    fontSize: 15,
  },
  statusSubtitle: {
    color: Colors.textMuted,
    fontSize: 13,
  },
});

