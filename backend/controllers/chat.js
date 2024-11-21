import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const linkSourceToSnowflake = async (req, res) => {
  const { sourceName, datasetName } = req.body;
  try {
    // Create the source
    const source = await createSource_S3({ sourceName, datasetName });

    // Define the namespace format to dynamically choose the schema based on the source name
    const namespaceFormat = `schema_${sourceName}`; // You can adjust this format as needed

    // Create the connection with namespace settings
    const connection = await createConnection({
      sourceId: source.sourceId,
      destinationId: process.env.AIRBYTE_DEST_ID_SNOWFLAKE,
      namespaceFormat: namespaceFormat, // Pass the namespace format
    });

    // Trigger the sync
    const sync = await triggerSync({ connectionId: connection.connectionId });
    res.status(200).json({ source, connection, sync });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Function to trigger a sync
async function triggerSync({ connectionId }) {
  const accessToken = await getAccessToken({client_id: process.env.AIRBYTE_CLIENT_ID_VAIRO, client_secret: process.env.AIRBYTE_CLIENT_SECRET_VAIRO});
  const options = {
    method: 'POST',
    url: 'https://api.airbyte.com/v1/jobs',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    data: { jobType: 'sync', connectionId: connectionId },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error triggering sync:', error.message);
    throw error;
  }
}

// Updated function to create a connection with namespace settings
async function createConnection({ sourceId, destinationId, namespaceFormat }) {
  const accessToken = await getAccessToken({client_id: process.env.AIRBYTE_CLIENT_ID_VAIRO, client_secret: process.env.AIRBYTE_CLIENT_SECRET_VAIRO});

  // Fetch the source's catalog
  const catalog = await getSourceCatalog({ sourceId });

  // Configure the syncCatalog
  const syncCatalog = {
    streams: catalog.streams.map((stream) => ({
      stream: stream.stream,
      config: {
        selected: true,
        syncMode: stream.supportedSyncModes.includes('full_refresh') ? 'full_refresh' : stream.supportedSyncModes[0],
        destinationSyncMode: 'overwrite', // Adjust as needed (e.g., 'append', 'append_dedup')
      },
    })),
  };

  const options = {
    method: 'POST',
    url: 'https://api.airbyte.com/v1/connections',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    data: {
      sourceId: sourceId,
      destinationId: destinationId,
      syncCatalog: syncCatalog,
      scheduleType: 'manual', // Set to 'manual' or 'basic' depending on your needs
      namespaceDefinition: 'customformat', // Use custom namespace definition
      namespaceFormat: namespaceFormat, // The format passed from the main function
      // You can add other fields like 'scheduleData' if 'scheduleType' is 'basic'
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error creating connection:', error.response.data);
    throw error;
  }
}

// Function to fetch the source's catalog
async function getSourceCatalog({ sourceId }) {
  const accessToken = await getAccessToken({client_id: process.env.AIRBYTE_CLIENT_ID_VAIRO, client_secret: process.env.AIRBYTE_CLIENT_SECRET_VAIRO});
  const options = {
    method: 'POST',
    url: 'https://api.airbyte.com/v1/sources/discover_schema',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    data: {
      sourceId: sourceId,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data.catalog;
  } catch (error) {
    console.error('Error fetching source catalog:', error.response.data);
    throw error;
  }
}

// Function to create an AWS S3 source
async function createSource_S3({ sourceName, datasetName }) {
  const accessToken = await getAccessToken({client_id: process.env.AIRBYTE_CLIENT_ID_VAIRO, client_secret: process.env.AIRBYTE_CLIENT_SECRET_VAIRO});
  const options = {
    method: 'POST',
    url: 'https://api.airbyte.com/v1/sources',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      authorization: `Bearer ${accessToken}`,
    },
    data: {
      sourceType: 'file', // Adjust if needed
      configuration: {
        dataset_name: datasetName,
        provider: {
          storage: 'S3',
          aws_access_key_id: process.env.AWS_S3_ACCESS_KEY_ID,
          aws_secret_access_key: process.env.AWS_S3_SECRET_ACCESS_KEY,
          path_prefix: '', // Adjust if needed
          endpoint: null, // Adjust if needed
        },
        url: `s3://${process.env.S3_BUCKET}/${datasetName}`,
        format: {
          format_type: 'CSV', // Adjust if needed (e.g., 'JSON')
          // Add format-specific options if required
        },
        // Add other configuration fields as needed
      },
      workspaceId: process.env.AIRBYTE_WORKSPACE_ID,
      name: sourceName,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    console.error('Error creating source:', error.response.data);
    throw error;
  }
}

// Function to get an access token
async function getAccessToken({ client_id, client_secret }) {
  const options = {
    method: 'POST',
    url: `https://api.airbyte.com/v1/applications/token`,
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    data: {
      client_id: client_id,
      client_secret: client_secret,
      'grant-type': 'client_credentials',
    },
  };
  try {
    const response = await axios.request(options);
    return response.data.access_token; // Ensure you're returning the access token
  } catch (error) {
    console.error('Error getting access token:', error.response.data);
    throw error;
  }
}