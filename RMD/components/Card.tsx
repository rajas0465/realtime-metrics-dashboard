import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

// Sample data (you'd replace this with data fetched from your API)
const data = {
    cpu: {
        usage: 0.7657912316075016,
        details: [
            {
                timestamp: "2024-11-01T17:17:00.000Z",
                usage: 0.7657912316075016
            },
            {
                timestamp: "2024-11-02T12:17:00.000Z",
                usage: 0.22152628407372194
            },
            {
                timestamp: "2024-11-02T11:17:00.000Z",
                usage: 0.26470269680214503
            },
            {
                timestamp: "2024-11-01T19:17:00.000Z",
                usage: 0.2583363647025038
            },
            {
                timestamp: "2024-11-02T09:17:00.000Z",
                usage: 0.24389103952131455
            },
            {
                timestamp: "2024-11-02T08:17:00.000Z",
                usage: 0.25910079139138587
            },
            {
                timestamp: "2024-11-02T10:17:00.000Z",
                usage: 0.24751410420499026
            },
            {
                timestamp: "2024-11-01T18:17:00.000Z",
                usage: 0.5083071340390137
            }
        ]
    },
    network: {
        in: 88189,
        out: 115907,
        details: [
            {
                timestamp: "2024-11-02T11:17:00.000Z",
                in_kbps: 88189,
                out_kbps: 115907
            },
            {
                timestamp: "2024-11-01T17:17:00.000Z",
                in_kbps: 9190,
                out_kbps: 10131
            },
            {
                timestamp: "2024-11-01T19:17:00.000Z",
                in_kbps: 6623,
                out_kbps: 5164
            },
            {
                timestamp: "2024-11-02T09:17:00.000Z",
                in_kbps: 8835,
                out_kbps: 10543
            },
            {
                timestamp: "2024-11-02T10:17:00.000Z",
                in_kbps: 17057,
                out_kbps: 20283
            },
            {
                timestamp: "2024-11-02T12:17:00.000Z",
                in_kbps: 6460,
                out_kbps: 14104
            },
            {
                timestamp: "2024-11-02T08:17:00.000Z",
                in_kbps: 41138,
                out_kbps: 57975
            },
            {
                timestamp: "2024-11-01T18:17:00.000Z",
                in_kbps: 84742606,
                out_kbps: 451919
            }
        ]
    },
    networkPackets: {
        total_packets_in: 56778,
        total_packets_out: 4676,
        details: [
            {
                timestamp: "2024-11-01T18:17:00.000Z",
                packets_in: 56778,
                packets_out: 4676
            },
            {
                timestamp: "2024-11-02T08:17:00.000Z",
                packets_in: 95,
                packets_out: 164
            },
            {
                timestamp: "2024-11-02T10:17:00.000Z",
                packets_in: 108,
                packets_out: 172
            },
            {
                timestamp: "2024-11-02T12:17:00.000Z",
                packets_in: 71,
                packets_out: 167
            },
            {
                timestamp: "2024-11-01T17:17:00.000Z",
                packets_in: 20,
                packets_out: 27
            },
            {
                timestamp: "2024-11-02T09:17:00.000Z",
                packets_in: 48,
                packets_out: 98
            },
            {
                timestamp: "2024-11-01T19:17:00.000Z",
                packets_in: 17,
                packets_out: 25
            },
            {
                timestamp: "2024-11-02T11:17:00.000Z",
                packets_in: 557,
                packets_out: 634
            }
        ]
    }
};


const MetricsOverview = () => {
    return (
        <ScrollView style={styles.container}>
            {/* CPU Details */}
            <View style={styles.card}>
                <Text style={styles.title}>CPU Usage</Text>
                <Text>Current Usage: {(data.cpu.usage * 100).toFixed(2)}%</Text>
                {data.cpu.details.map((detail, index) => (
                    <Text key={index}>Time: {new Date(detail.timestamp).toLocaleString()} - Usage: {(detail.usage * 100).toFixed(2)}%</Text>
                ))}
            </View>

            {/* Network Details */}
            <View style={styles.card}>
                <Text style={styles.title}>Network</Text>
                <Text>Current In: {data.network.in} kbps</Text>
                <Text>Current Out: {data.network.out} kbps</Text>
                {data.network.details.map((detail, index) => (
                    <Text key={index}>Time: {new Date(detail.timestamp).toLocaleString()} - In: {detail.in_kbps} kbps, Out: {detail.out_kbps} kbps</Text>
                ))}
            </View>

            {/* Network Packets Details */}
            <View style={styles.card}>
                <Text style={styles.title}>Network Packets</Text>
                <Text>Total Packets In: {data.networkPackets.total_packets_in}</Text>
                <Text>Total Packets Out: {data.networkPackets.total_packets_out}</Text>
                {data.networkPackets.details.map((detail, index) => (
                    <Text key={index}>Time: {new Date(detail.timestamp).toLocaleString()} - Packets In: {detail.packets_in}, Packets Out: {detail.packets_out}</Text>
                ))}
            </View>
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
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});

export default MetricsOverview;
