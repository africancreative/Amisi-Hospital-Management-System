import React from 'react';
import { StyleSheet, Text, View, Animated } from 'react-native';
import { useConnectivity } from '../trpc/ConnectivityProvider';
import { Colors } from '../theme/Colors';
import { Wifi, Cloud, WifiOff, Database } from 'lucide-react-native';

export function ConnectivityStatus() {
  const { state } = useConnectivity();
  const opacity = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [state]);

  const getStatusConfig = () => {
    switch (state) {
      case 'EDGE_ONLINE':
        return {
          label: 'Hospital Node (LAN)',
          color: Colors.success,
          Icon: Database,
        };
      case 'CLOUD_ONLINE':
        return {
          label: 'Cloud Sync Active',
          color: Colors.primary,
          Icon: Cloud,
        };
      case 'OFFLINE':
        return {
          label: 'Offline Mode',
          color: Colors.error,
          Icon: WifiOff,
        };
      default:
        return {
          label: 'Checking...',
          color: Colors.textMuted,
          Icon: Wifi,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Animated.View style={[styles.container, { opacity, borderColor: config.color }]}>
      <config.Icon size={14} color={config.color} />
      <Text style={[styles.text, { color: config.color }]}>{config.label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.glass,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
