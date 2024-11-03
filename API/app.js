const express = require('express');
const AWS = require('aws-sdk');
const oracledb = require('oracledb');
const cors = require('cors');

const app = express();
// Enable CORS for all routes
app.use(cors());
const PORT = process.env.PORT || 3000;

// Configure AWS SDK
AWS.config.update({ region: 'ap-south-1' });
const cloudwatch = new AWS.CloudWatch();

oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_23_5' }); // Optional if using Oracle Instant Client

// Database connection configuration
const dbConfig = {
    user: 'admin',
    password: '12345678',
    connectString: 'oracleawsrdsdb.cpc2ge26i8a4.ap-south-1.rds.amazonaws.com:1521/ORCL'
};


app.use(express.json());

async function getCPUUtilization(dbInstanceId) {
    const cloudwatch = new AWS.CloudWatch();
    const params = {
        MetricName: 'CPUUtilization',
        Namespace: 'AWS/RDS',
        StartTime: new Date(new Date() - 12 * 60 * 60 * 1000), // Past 12 hours
        EndTime: new Date(),
        Period: 600, // 10-minute intervals (600 seconds)
        Statistics: ['Average'], // You can use 'Maximum', 'Minimum', etc.
        Dimensions: [
            {
                Name: 'DBInstanceIdentifier',
                Value: dbInstanceId // Replace with your DB instance ID
            }
        ]
    };

    try {
        const data = await cloudwatch.getMetricStatistics(params).promise();
        if (data.Datapoints.length > 0) {
            // Sort datapoints by timestamp to get the latest data
            const latestDatapoint = data.Datapoints.sort((a, b) => b.Timestamp - a.Timestamp)[0];
            return latestDatapoint.Average; // Return the average CPU utilization
        } else {
            return 'No data available';
        }
    } catch (error) {
        console.error('Error fetching CPU utilization:', error);
        throw new Error('Failed to fetch CPU utilization data');
    }
}

app.get('/db/details', async (req, res) => {
    let connection;
    try {
        // Establish a connection to the Oracle database
        connection = await oracledb.getConnection(dbConfig);

        // Query to get the number of tables in the user's schema
        const tablesResult = await connection.execute(
            `SELECT COUNT(*) AS table_count FROM user_tables`
        );

        // Simulate fetching CPU utilization (or adapt with actual CPU data)
        const cpuUtilization = await getCPUUtilization("oracleawsrdsdb"); // Implement your method for fetching CPU utilization

        // Construct the response
        const response = {
            tableCount: tablesResult.rows[0][0],
            cpuUtilization: cpuUtilization
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error performing database operation:', error);
        res.status(500).json({ error: 'Database operation failed', details: error.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeError) {
                console.error('Error closing the connection:', closeError);
            }
        }
    }
});

app.get('/db/overview', async (req, res) => {
    const dbInstanceId = 'oracleawsrdsdb'; // Replace with your actual DB instance ID

    try {
        const cpuUtilization = await getMetricData(dbInstanceId, 'CPUUtilization', 'AWS/RDS');
        const networkReceive = await getMetricData(dbInstanceId, 'NetworkReceiveThroughput', 'AWS/RDS');
        const freeableMemory = await getMetricData(dbInstanceId, 'FreeableMemory', 'AWS/RDS');
        const dbLoad = await getMetricData(dbInstanceId, 'DBLoad', 'AWS/RDS');
        const dbLoadCPU = await getMetricData(dbInstanceId, 'DBLoadCPU', 'AWS/RDS');

        const response = {
            cpu: {
                usage: cpuUtilization[cpuUtilization.length - 1]?.usage || 'No data',
                details: cpuUtilization
            },
            networkReceiveThroughput: {
                usage: networkReceive[networkReceive.length - 1]?.usage || 'No data',
                details: networkReceive
            },
            freeableMemory: {
                usage: freeableMemory[freeableMemory.length - 1]?.usage || 'No data',
                details: freeableMemory
            },
            dbLoad: {
                usage: dbLoad[dbLoad.length - 1]?.usage || 'No data',
                details: dbLoad
            },
            dbLoadCPU: {
                usage: dbLoadCPU[dbLoadCPU.length - 1]?.usage || 'No data',
                details: dbLoadCPU
            }
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error generating database overview:', error);
        res.status(500).json({ error: 'Failed to generate database overview', details: error.message });
    }
});


app.get('/db/info-table', async (req, res) => {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        // Query to fetch instance information (example query; modify based on your database schema)
        const instanceInfoQuery = `
            SELECT
                'Instance ID' AS instance_id,
                sys_context('USERENV', 'SERVER_HOST') AS server_host,
                sys_context('USERENV', 'DB_NAME') AS db_name,
                sys_context('USERENV', 'INSTANCE_NAME') AS instance_name,
                sys_context('USERENV', 'SERVICE_NAME') AS service_name,
                sys_context('USERENV', 'REGION') AS region
            FROM DUAL
        `;
        
        const result = await connection.execute(instanceInfoQuery);

        // Constructing the response from the query result
        const basicInfo = result.rows[0] ? {
            instanceId: result.rows[0][0],
            serverHost: result.rows[0][1],
            dbName: result.rows[0][2],
            instanceName: result.rows[0][3],
            serviceName: result.rows[0][4],
            region: result.rows[0][5] || 'N/A'
        } : null;

        res.status(200).json(basicInfo || { message: 'No instance information available' });
    } catch (error) {
        console.error('Error fetching instance information:', error);
        res.status(500).json({ error: 'Failed to fetch basic information', details: error.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (closeError) {
                console.error('Error closing the connection:', closeError);
            }
        }
    }
});
const rds = new AWS.RDS();
app.get('/db/info', async (req, res) => {
    try {
        // Replace 'your-db-instance-identifier' with your actual RDS DB instance identifier
        const dbInstanceIdentifier = 'oracleawsrdsdb';

        // Fetch RDS DB instance details
        const dbInfo = await rds.describeDBInstances({ DBInstanceIdentifier: dbInstanceIdentifier }).promise();

        if (dbInfo.DBInstances && dbInfo.DBInstances.length > 0) {
            const instance = dbInfo.DBInstances[0];
            const basicInfo = {
                instanceId: instance.DbiResourceId,
                dbInstanceIdentifier: instance.DBInstanceIdentifier,
                instanceClass: instance.DBInstanceClass,
                engine: instance.Engine,
                engineVersion: instance.EngineVersion,
                status: instance.DBInstanceStatus,
                endpoint: instance.Endpoint ? instance.Endpoint.Address : 'N/A',
                availabilityZone: instance.AvailabilityZone,
                region: AWS.config.region,
                allocatedStorage: instance.AllocatedStorage,
                instanceCreateTime: instance.InstanceCreateTime
            };

            res.status(200).json(basicInfo);
        } else {
            res.status(404).json({ message: 'No database instance found' });
        }
    } catch (error) {
        console.error('Error fetching database information:', error);
        res.status(500).json({ error: 'Failed to fetch database information', details: error.message });
    }
});

// Create an EC2 service object
const ec2 = new AWS.EC2();

app.get('/webserver1/info', async (req, res) => {
    try {
        // Replace 'your-instance-id' with your actual EC2 instance ID
        const instanceId = 'i-0929e935d767da4fd'; // Replace with your actual EC2 instance ID
        const params = {
            InstanceIds: [instanceId]
        };

        // Get EC2 instance details
        const data = await ec2.describeInstances(params).promise();

        if (data.Reservations.length > 0 && data.Reservations[0].Instances.length > 0) {
            const instance = data.Reservations[0].Instances[0];
            const basicInfo = {
                instanceId: instance.InstanceId,
                instanceType: instance.InstanceType,
                state: instance.State.Name,
                publicDnsName: instance.PublicDnsName || 'N/A',
                publicIpAddress: instance.PublicIpAddress || 'N/A',
                privateIpAddress: instance.PrivateIpAddress,
                availabilityZone: instance.Placement.AvailabilityZone,
                region: AWS.config.region,
                launchTime: instance.LaunchTime
            };

            res.status(200).json(basicInfo);
        } else {
            res.status(404).json({ message: 'No instance information found' });
        }
    } catch (error) {
        console.error('Error fetching EC2 information:', error);
        res.status(500).json({ error: 'Failed to fetch EC2 information', details: error.message });
    }
});

app.get('/webserver2/info', async (req, res) => {
    try {
        // Replace 'your-instance-id' with your actual EC2 instance ID
        const instanceId = 'i-07c47d7d67e71a95c'; // Replace with your actual EC2 instance ID
        const params = {
            InstanceIds: [instanceId]
        };

        // Get EC2 instance details
        const data = await ec2.describeInstances(params).promise();

        if (data.Reservations.length > 0 && data.Reservations[0].Instances.length > 0) {
            const instance = data.Reservations[0].Instances[0];
            const basicInfo = {
                instanceId: instance.InstanceId,
                instanceType: instance.InstanceType,
                state: instance.State.Name,
                publicDnsName: instance.PublicDnsName || 'N/A',
                publicIpAddress: instance.PublicIpAddress || 'N/A',
                privateIpAddress: instance.PrivateIpAddress,
                availabilityZone: instance.Placement.AvailabilityZone,
                region: AWS.config.region,
                launchTime: instance.LaunchTime
            };

            res.status(200).json(basicInfo);
        } else {
            res.status(404).json({ message: 'No instance information found' });
        }
    } catch (error) {
        console.error('Error fetching EC2 information:', error);
        res.status(500).json({ error: 'Failed to fetch EC2 information', details: error.message });
    }
});

app.get('/metrics/overview1', async (req, res) => {
    try {

        var instanceID = 'i-0929e935d767da4fd';
        // Simulate data fetching from AWS CloudWatch or DynamoDB
        const cpuData = await fetchMetricData('CPUUtilization', instanceID);

        //const diskData = await fetchDiskData(instanceID);
        // const iopsData = await fetchIOPSData('your-instance-id');
        const networkData = await fetchNetworkData(instanceID);        
        const networkPacketsData = await fetchNetworkPacketsData(instanceID);
        // const responseTimeData = await fetchResponseTimeData('your-instance-id');

        // Construct the response
        const response = {
            cpu: cpuData,
            //memory: memoryData,
            //disk: diskData
            // iops: iopsData,
            network: networkData,
            networkPackets: networkPacketsData
            // response_time: responseTimeData
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ error: 'Error fetching metrics' });
    }
});
app.get('/metrics/overview2', async (req, res) => {
    try {

        var instanceID = 'i-07c47d7d67e71a95c';
        // Simulate data fetching from AWS CloudWatch or DynamoDB
        const cpuData = await fetchMetricData('CPUUtilization', instanceID);

        //const diskData = await fetchDiskData(instanceID);
        // const iopsData = await fetchIOPSData('your-instance-id');
        const networkData = await fetchNetworkData(instanceID);        
        const networkPacketsData = await fetchNetworkPacketsData(instanceID);
        // const responseTimeData = await fetchResponseTimeData('your-instance-id');

        // Construct the response
        const response = {
            cpu: cpuData,
            //memory: memoryData,
            //disk: diskData
            // iops: iopsData,
            network: networkData,
            networkPackets: networkPacketsData
            // response_time: responseTimeData
        };

        res.status(200).json(response);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        res.status(500).json({ error: 'Error fetching metrics' });
    }
});

async function getMetricData(dbInstanceId, metricName, namespace, statistics = ['Average']) {
    const cloudwatch = new AWS.CloudWatch();
    const params = {
        MetricName: metricName,
        Namespace: namespace,
        Period: 300, // 5-minute interval
        StartTime: new Date(new Date() - 60 * 60 * 1000), // Last 1 hour
        EndTime: new Date(), // Current time
        Statistics: statistics,
        Dimensions: [
            {
                Name: 'DBInstanceIdentifier',
                Value: dbInstanceId
            }
        ]
    };

    try {
        const data = await cloudwatch.getMetricStatistics(params).promise();
        return data.Datapoints.map(dp => ({
            timestamp: dp.Timestamp,
            usage: dp.Average
        })).sort((a, b) => a.timestamp - b.timestamp); // Sort by timestamp for clarity
    } catch (error) {
        console.error(`Error fetching ${metricName}:`, error);
        throw new Error(`Failed to fetch ${metricName} data`);
    }
}
// Function to fetch metric data (example for CPU)
async function fetchMetricData(metricName, instanceId) {
    const params = {
        Namespace: 'AWS/EC2',
        MetricName: metricName,
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: new Date(new Date() - 12 * 60 * 60 * 1000), // Past 12 hours
        EndTime: new Date(),
        Period: 600, // 10-minute intervals (600 seconds)
        Statistics: ['Average']
    };

    const data = await cloudwatch.getMetricStatistics(params).promise();
    // console.log(data)
    const details = data.Datapoints.map(dp => ({
        timestamp: dp.Timestamp,
        usage: dp.Average
    }));

    return {
        usage: details.length > 0 ? details[0].usage : 0, // Simplified logic for demonstration
        details
    };
}

/**
 * Fetches network data from AWS CloudWatch.
 * @param {string} instanceId - The ID of the instance.
 * @returns {object} - Network data with in/out rates and retransmissions.
 */
async function fetchNetworkData(instanceId) {
    const paramsIn = {
        Namespace: 'AWS/EC2',
        MetricName: 'NetworkIn',
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: new Date(new Date() - 12 * 60 * 60 * 1000), // Past 12 hours
        EndTime: new Date(),
        Period: 600, // 10-minute intervals (600 seconds)
        Statistics: ['Sum']
    };

    const paramsOut = {
        Namespace: 'AWS/EC2',
        MetricName: 'NetworkOut',
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: new Date(new Date() - 12 * 60 * 60 * 1000), // Past 12 hours
        EndTime: new Date(),
        Period: 600, // 10-minute intervals (600 seconds)
        Statistics: ['Sum']
    };

    try {
        const dataIn = await cloudwatch.getMetricStatistics(paramsIn).promise();
        const dataOut = await cloudwatch.getMetricStatistics(paramsOut).promise();

        const details = dataIn.Datapoints.map((dp, index) => ({
            timestamp: dp.Timestamp,
            in_kbps: dp.Sum,
            out_kbps: dataOut.Datapoints[index] ? dataOut.Datapoints[index].Sum : 0
        }));

        return {
            in: details.length > 0 ? details[0].in_kbps : 0,
            out: details.length > 0 ? details[0].out_kbps : 0,
            details
        };
    } catch (error) {
        console.error(`Error fetching network data:`, error);
        throw error;
    }
}

/**
 * Fetches NetworkPacketsIn and NetworkPacketsOut data from AWS CloudWatch.
 * @param {string} instanceId - The ID of the EC2 instance.
 * @returns {object} - Network packet data with detailed in/out packet counts.
 */
async function fetchNetworkPacketsData(instanceId) {
    const paramsPacketsIn = {
        Namespace: 'AWS/EC2',
        MetricName: 'NetworkPacketsIn',
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: new Date(new Date() - 12 * 60 * 60 * 1000), // Past 12 hours
        EndTime: new Date(),
        Period: 600, // 10-minute intervals (600 seconds)
        Statistics: ['Sum']
    };

    const paramsPacketsOut = {
        Namespace: 'AWS/EC2',
        MetricName: 'NetworkPacketsOut',
        Dimensions: [{ Name: 'InstanceId', Value: instanceId }],
        StartTime: new Date(new Date() - 12 * 60 * 60 * 1000), // Past 12 hours
        EndTime: new Date(),
        Period: 600, // 10-minute intervals (600 seconds)
        Statistics: ['Sum']
    };

    try {
        const dataPacketsIn = await cloudwatch.getMetricStatistics(paramsPacketsIn).promise();
        const dataPacketsOut = await cloudwatch.getMetricStatistics(paramsPacketsOut).promise();

        const details = dataPacketsIn.Datapoints.map((dp, index) => ({
            timestamp: dp.Timestamp,
            packets_in: dp.Sum,
            packets_out: dataPacketsOut.Datapoints[index] ? dataPacketsOut.Datapoints[index].Sum : 0
        }));

        return {
            total_packets_in: details.length > 0 ? details[0].packets_in : 0,
            total_packets_out: details.length > 0 ? details[0].packets_out : 0,
            details
        };
    } catch (error) {
        console.error(`Error fetching network packets data:`, error);
        throw error;
    }
}


// Similar functions for memory, disk, iops, network, and response time would be implemented here...

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
