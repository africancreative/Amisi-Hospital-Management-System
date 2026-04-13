import { StyleSheet, Text, View, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { Colors } from '../../theme/Colors';
import { api } from '../../trpc/client';
import { Search, User, ChevronRight, Activity } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { ConnectivityStatus } from '../../components/ConnectivityStatus';

export default function RoundsList() {
  const router = useRouter();
  const { data: patients, isLoading } = api.patients.getInpatients.useQuery();

  const renderPatient = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.patientCard}
      onPress={() => router.push(`/rounds/${item.visitId}`)}
    >
      <View style={styles.avatar}>
        <User color={Colors.primary} size={24} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>Bed {item.bedNumber || 'N/A'} • MRN {item.mrn}</Text>
      </View>
      <View style={styles.newsBadge}>
        <Activity size={12} color={Colors.text} />
        <Text style={styles.newsVal}>NEWS2: {item.lastNews2 || '--'}</Text>
      </View>
      <ChevronRight color={Colors.textMuted} size={20} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ConnectivityStatus />
        <Text style={styles.title}>Ward Rounds</Text>
        <View style={styles.searchBar}>
          <Search size={18} color={Colors.textMuted} />
          <TextInput 
            placeholder="Search patient or bed..." 
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
          />
        </View>
      </View>

      <FlatList
        data={patients}
        renderItem={renderPatient}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No patients found in current ward.</Text>
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
  header: {
    padding: 20,
    paddingTop: 10,
    gap: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 16,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 15,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  meta: {
    color: Colors.textMuted,
    fontSize: 13,
  },
  newsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
    marginRight: 5,
  },
  newsVal: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: 'bold',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: Colors.textMuted,
  },
});
