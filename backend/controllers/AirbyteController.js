import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

export const linkSourceToSnowflake = async (req, res) => {
    const {sourceName, datasetName} = req.body;
    try {
        const source = await createSource_S3({sourceName, datasetName});
        const connection = await createConnection({sourceId: source.sourceId, destinationId: process.env.AIRBYTE_DEST_ID_SNOWFLAKE});
        const sync = await triggerSync({connectionId: connection.connectionId});
        res.status(200).json({source, connection, sync});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
}

export async function triggerSync({connectionId}) {
    const accessToken = await getAccessToken({client_id: process.env.AIRBYTE_CLIENT_ID_VAIRO, client_secret: process.env.AIRBYTE_CLIENT_SECRET_VAIRO});
    const options = {
        method: 'POST',
        url: 'https://api.airbyte.com/v1/jobs',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Bearer ${accessToken}`
        },
        data: {jobType: 'sync', connectionId: connectionId}
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error('Error triggering sync:', error.message);
        throw error;
    }
}


export async function createConnection({connectionName, sourceId, destinationId, schemaName}) {
    const accessToken = await getAccessToken({client_id: process.env.AIRBYTE_CLIENT_ID_VAIRO, client_secret: process.env.AIRBYTE_CLIENT_SECRET_VAIRO});
    const options = {
        method: 'POST',
        url: 'https://api.airbyte.com/v1/connections',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Bearer ${accessToken}`
        },
        data: {
            dataResidency: 'us',
            sourceId: sourceId,
            destinationId: destinationId
        },
        name: connectionName
    };

    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error('Error creating connection:', error.message);
        throw error;
    }
}

export async function createDest_snowflake({destName, databaseName, schemaName}) {
    const accessToken = await getAccessToken({client_id: process.env.AIRBYTE_CLIENT_ID_VAIRO, client_secret: process.env.AIRBYTE_CLIENT_SECRET_VAIRO});
    const options = {
        method: 'POST',
        url: 'https://api.airbyte.com/v1/destinations',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            authorization: `Bearer ${accessToken}`
        },
        data: {
            configuration: {
                credentials: {password: process.env.SNOWFLAKE_AIRBYTE_PASSWORD, auth_type: 'Username and Password'},
                destinationType: 'snowflake',
                host: process.env.SNOWFLAKE_HOST,
                role: process.env.SNOWFLAKE_AIRBYTE_ROLE,
                warehouse: process.env.SNOWFLAKE_WAREHOUSE,
                database: databaseName,
                schema: schemaName,
                username: process.env.SNOWFLAKE_AIRBYTE_USERNAME
            },
            name: destName,
            workspaceId: process.env.AIRBYTE_WORKSPACE_ID
        }
    };

    try {
        const response = await axios.request(options);
        console.log("Destination Created: ", response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating destination:', error.message);
        return error;
    }
}


// Function to add an AWS S3 source to a workspace
export async function createSource_S3({sourceName, datasetName}) {
    const accessToken = await getAccessToken({client_id: process.env.AIRBYTE_CLIENT_ID_VAIRO, client_secret: process.env.AIRBYTE_CLIENT_SECRET_VAIRO});
    const options = {
      method: 'POST',
      url: 'https://api.airbyte.com/v1/sources',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${accessToken}`
      },
      data: {
        configuration: {
          sourceType: 'file',
          dataset_name: datasetName,
          provider: {
            storage: 'S3',
            aws_access_key_id: process.env.AWS_S3_ACCESS_KEY_ID,
            aws_secret_access_key: process.env.AWS_S3_SECRET_ACCESS_KEY
          },
          url: `s3://${process.env.S3_BUCKET}/${datasetName}`,
          format: 'csv'
        },
        workspaceId: process.env.AIRBYTE_WORKSPACE_ID,
        name: sourceName
      }
    };
    
    try {
        const response = await axios.request(options);
        console.log("Source Created: ", response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating source:', error.message);
        return error;
    }
}


// Function to get an access token
async function getAccessToken({client_id, client_secret}) {
    const options = {
        method: 'POST',
        url: `https://api.airbyte.com/v1/applications/token`,
        headers: {accept: 'application/json', 'content-type': 'application/json'},
        data: {
            client_id: client_id,
            client_secret: client_secret,
            'grant-type': 'client_credentials'
        }
    };
    try {
        const response = await axios.request(options);
        return response.data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error.message);
        throw error;
    }
}

async function getConnection_byId({connectionId}) {
    const accessToken = await getAccessToken({client_id: process.env.AIRBYTE_CLIENT_ID_VAIRO, client_secret: process.env.AIRBYTE_CLIENT_SECRET_VAIRO});
    const options = {
      method: 'GET',
      url: `https://api.airbyte.com/v1/connections/${connectionId}`,
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${accessToken}`
      }
    };
    
    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error('Error listing connections:', error.message);
        throw error;
    }  
}


export async function getSource_byId({sourceId}) {
    const accessToken = await getAccessToken({client_id: process.env.AIRBYTE_CLIENT_ID_VAIRO, client_secret: process.env.AIRBYTE_CLIENT_SECRET_VAIRO});
    const options = {
      method: 'GET',
      url: `https://api.airbyte.com/v1/sources/${sourceId}`,
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${accessToken}`
      }
    };
    
    try {
        const response = await axios.request(options);
        return response.data;
    } catch (error) {
        console.error('Error listing sources:', error.message);
        throw error;
    }  
}



