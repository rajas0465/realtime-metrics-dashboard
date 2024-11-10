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
  const [serverInfo, setServerInfo] = useState<any>(null); // Holds server/db info and instance state

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetching metrics data
        const response = await axios.get('http://65.0.178.77:3000/db/overview', {
            baseURL: '',
            validateStatus: function (status) {
            return status >= 200 && status < 300; // Accept only HTTP 2xx responses
        },
        httpsAgent: false,
    });
        setData(response.data);

        // Fetching basic server/database information
        const infoResponse = await axios.get('http://65.0.178.77:3000/db/infoCloudwatch',{ 
            baseURL: '',
            validateStatus: function (status) {
            return status >= 200 && status < 300; // Accept only HTTP 2xx responses
        },
        httpsAgent: false,
    });
        setServerInfo(infoResponse.data);

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

  const renderChart = (title: string, details: any[], dataKey: string, yAxisSuffix: string, lineColors: string[], labels: string[]) => (
    <ScrollView horizontal>
      {details && details.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <LineChart
            data={{
              labels,
              datasets: lineColors.map((color, index) => ({
                data: details.map((detail: any) => detail[dataKey] ?? 0),
                color: (opacity = 1) => color,
                strokeWidth: 2
              }))
            }}
            width={Math.max(screenWidth, 1000)}
            height={220}
            yAxisSuffix={yAxisSuffix}
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
  );

  return (
    <ScrollView style={styles.container}>
        {/* Enhanced Basic Information Section */}
        <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Database Information</Text>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Instance ID:</Text>
            <Text style={styles.infoValue}>{serverInfo.instanceId || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>DB Identifier:</Text>
            <Text style={styles.infoValue}>{serverInfo.dbInstanceIdentifier || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Engine:</Text>
            <Text style={styles.infoValue}>{serverInfo.engine || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Engine Version:</Text>
            <Text style={styles.infoValue}>{serverInfo.engineVersion || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={[styles.infoValue, styles.stateHighlight, 
            serverInfo.status === 'available' ? styles.stateAvailable : styles.stateNotAvailable]}>
            {serverInfo.status || 'N/A'}
            </Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Endpoint:</Text>
            <Text style={styles.infoValue}>{serverInfo.endpoint || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Region:</Text>
            <Text style={styles.infoValue}>{serverInfo.region || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Allocated Storage:</Text>
            <Text style={styles.infoValue}>{serverInfo.allocatedStorage || 'N/A'} GB</Text>
        </View>
        <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Instance Create Time:</Text>
            <Text style={styles.infoValue}>
            {serverInfo.instanceCreateTime ? new Date(serverInfo.instanceCreateTime).toLocaleString() : 'N/A'}
            </Text>
        </View>
        </View>


      {/* Render CPU Chart */}
      {renderChart(
        'CPU Usage',
        data.cpu.details,
        'usage',
        '%',
        ['rgba(134, 65, 244, 1)'],
        getReducedLabels(data.cpu.details)
      )}
      
      {/* Render NetworkReceiveThroughput Chart */}
      {renderChart(
        'Network Receive Throughput',
        data.networkReceiveThroughput.details,
        'usage',
        'kbps',
        ['rgba(0, 128, 0, 1)'],
        getReducedLabels(data.networkReceiveThroughput.details)
      )}
      
      {/* Render FreeableMemory Chart */}
      {renderChart(
        'Freeable Memory',
        data.freeableMemory.details,
        'usage',
        'MB',
        ['rgba(255, 0, 0, 1)'],
        getReducedLabels(data.freeableMemory.details)
      )}
      
      {/* Render DBLoad Chart */}
      {renderChart(
        'DB Load',
        data.dbLoad.details,
        'usage',
        '',
        ['rgba(0, 0, 255, 1)'],
        getReducedLabels(data.dbLoad.details)
      )}
      
      {/* Render DBLoadCPU Chart */}
      {renderChart(
        'DB Load CPU',
        data.dbLoadCPU.details,
        'usage',
        '',
        ['rgba(255, 165, 0, 1)'],
        getReducedLabels(data.dbLoadCPU.details)
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
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
  stateAvailable: {
    color: 'green',
  },
  stateNotAvailable: {
    color: 'red',
  },
  infoText: {
    fontSize: 16,
    marginBottom: 5,
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
