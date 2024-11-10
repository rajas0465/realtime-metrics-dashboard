import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Colors from '@/constants/Colors';
import axios from 'axios';

const screenWidth = Dimensions.get('window').width;
const baseFontSize = screenWidth < 360 ? 8 : screenWidth < 480 ? 10 : 12; // Adjust font size for mobile

const ServerMetricsScreen: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [serverInfo, setServerInfo] = useState<any>(null); // Holds server/db info

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://65.0.178.77:3000/metrics/overview2');
        const infoResponse = await axios.get('http://65.0.178.77:3000/webserver2/info'); // Fetching server info

        const sortedData = {
          ...response.data,
          cpu: {
            ...response.data.cpu,
            details: response.data.cpu.details.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
          },
          network: {
            ...response.data.network,
            details: response.data.network.details.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
          },
          networkPackets: {
            ...response.data.networkPackets,
            details: response.data.networkPackets.details.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
          }
        };
        setData(sortedData);
        setServerInfo(infoResponse.data); // Set server info
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getReducedLabels = (details: any[], maxLabels = 6) => {
    const step = Math.ceil(details.length / maxLabels);
    return details
      .filter((_: any, index: number) => index % step === 0)
      .map((detail: { timestamp: string | number | Date; }) => new Date(detail.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  if (loading) {
    return <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  if (!data || !serverInfo) {
    return <Text style={styles.errorText}>No data available</Text>;
  }

  return (
    <ScrollView style={styles.container}>
            {/* Enhanced Basic Information Section */}
            <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>EC2 Instance Information</Text>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Instance ID:</Text>
                <Text style={styles.infoValue}>{serverInfo.instanceId || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Instance Type:</Text>
                <Text style={styles.infoValue}>{serverInfo.instanceType || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>State:</Text>
                <Text style={[styles.infoValue, styles.stateHighlight, 
                serverInfo.state === 'running' ? styles.stateRunning : styles.stateStopped]}>
                {serverInfo.state || 'N/A'}
                </Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Public DNS Name:</Text>
                <Text style={styles.infoValue}>{serverInfo.publicDnsName || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Public IP Address:</Text>
                <Text style={styles.infoValue}>{serverInfo.publicIpAddress || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Private IP Address:</Text>
                <Text style={styles.infoValue}>{serverInfo.privateIpAddress || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Availability Zone:</Text>
                <Text style={styles.infoValue}>{serverInfo.availabilityZone || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Region:</Text>
                <Text style={styles.infoValue}>{serverInfo.region || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Launch Time:</Text>
                <Text style={styles.infoValue}>
                {serverInfo.launchTime ? new Date(serverInfo.launchTime).toLocaleString() : 'N/A'}
                </Text>
            </View>
             </View>



      <ScrollView horizontal>
        {/* CPU Usage Chart */}
        {data.cpu && data.cpu.details.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.title}>CPU Usage</Text>
            <LineChart
              data={{
                labels: getReducedLabels(data.cpu.details, 10),
                datasets: [
                  {
                    data: data.cpu.details.map((detail: { usage: any; }) => (detail.usage ?? 0) * 100),
                    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                    strokeWidth: 2
                  }
                ]
              }}
              width={Math.max(screenWidth, 1000)}
              height={220}
              yAxisSuffix="%"
              chartConfig={{
                backgroundColor: Colors.grey,
                backgroundGradientFrom: Colors.white,
                backgroundGradientTo: Colors.grey,
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForLabels: {
                  fontSize: baseFontSize,
                  rotation: 45
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: Colors.primary
                }
              }}
              bezier
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </View>
        )}
      </ScrollView>

      <ScrollView horizontal>
        {/* Network Traffic Chart */}
        {data.network && data.network.details.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.title}>Network Traffic (In/Out)</Text>
            <LineChart
              data={{
                labels: getReducedLabels(data.network.details, 10),
                datasets: [
                  {
                    data: data.network.details.map((detail: { in_kbps: any; }) => detail.in_kbps ?? 0),
                    color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
                    strokeWidth: 2
                  },
                  {
                    data: data.network.details.map((detail: { out_kbps: any; }) => detail.out_kbps ?? 0),
                    color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`,
                    strokeWidth: 2
                  }
                ]
              }}
              width={Math.max(screenWidth, 1000)}
              height={220}
              yAxisSuffix="kbps"
              chartConfig={{
                backgroundColor: Colors.grey,
                backgroundGradientFrom: Colors.white,
                backgroundGradientTo: Colors.grey,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForLabels: {
                  fontSize: baseFontSize,
                  rotation: 45
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: Colors.primary
                }
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </View>
        )}
      </ScrollView>

      <ScrollView horizontal>
        {/* Network Packets Chart */}
        {data.networkPackets && data.networkPackets.details.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.title}>Network Packets (In/Out)</Text>
            <LineChart
              data={{
                labels: getReducedLabels(data.networkPackets.details, 10),
                datasets: [
                  {
                    data: data.networkPackets.details.map((detail: { packets_in: any; }) => detail.packets_in ?? 0),
                    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
                    strokeWidth: 2
                  },
                  {
                    data: data.networkPackets.details.map((detail: { packets_out: any; }) => detail.packets_out ?? 0),
                    color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
                    strokeWidth: 2
                  }
                ]
              }}
              width={Math.max(screenWidth, 1000)}
              height={220}
              yAxisSuffix="pkts"
              chartConfig={{
                backgroundColor: Colors.grey,
                backgroundGradientFrom: Colors.white,
                backgroundGradientTo: Colors.grey,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                style: {
                  borderRadius: 16
                },
                propsForLabels: {
                  fontSize: baseFontSize,
                  rotation: 45
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: Colors.primary
                }
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16
              }}
            />
          </View>
        )}
      </ScrollView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      padding: 10,
    },
    card: {
        backgroundColor: '#fff',
        padding: 15,
        marginVertical: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
      },
      title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
      },
    infoCard: {
      backgroundColor: '#f5f5f5',
      padding: 20,
      marginBottom: 20,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 5,
      elevation: 3,
    },
    infoTitle: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    infoLabel: {
      fontSize: 16,
      fontWeight: '600',
    },
    infoValue: {
      fontSize: 16,
    },
    stateHighlight: {
      fontWeight: 'bold',
    },
    stateRunning: {
      color: 'green',
    },
    stateStopped: {
      color: 'red',
    },
    loader: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 50,
    },
    errorText: {
      fontSize: 16,
      color: 'red',
      textAlign: 'center',
      marginTop: 20,
    }
  });
  

export default ServerMetricsScreen;
