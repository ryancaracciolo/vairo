import snowflake from 'snowflake-sdk';

// Helper function to connect to Snowflake
export async function connectToSnowflake_general() {
    console.log("Connecting to Snowflake...");
    return new Promise((resolve, reject) => {
        const connection = snowflake.createConnection({
            account: process.env.SNOWFLAKE_ACCOUNT,
            username: process.env.SNOWFLAKE_GENERAL_USERNAME,
            password: process.env.SNOWFLAKE_GENERAL_PASSWORD,
            region: process.env.SNOWFLAKE_REGION,
            warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        });

        connection.connect((err, conn) => {
            if (err) {
                console.error('Unable to connect to Snowflake:', err);
                reject(err);
            } else {
                console.log('Successfully connected to Snowflake.');
                console.log("Connection: ", conn);
                resolve(conn);
            }
        });
    });
}

export async function connectToSnowflake_customer({databaseName, schemaName}) {
    console.log("Connecting to Snowflake...");
    return new Promise((resolve, reject) => {
        const connection = snowflake.createConnection({
            account: process.env.SNOWFLAKE_ACCOUNT,
            username: process.env.SNOWFLAKE_CUSTOMER_USERNAME,
            password: process.env.SNOWFLAKE_CUSTOMER_PASSWORD,
            database: databaseName,
            schema: schemaName,
            region: process.env.SNOWFLAKE_REGION,
            warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        });

        connection.connect((err, conn) => {
            if (err) {
                console.error('Unable to connect to Snowflake:', err);
                reject(err);
            } else {
                console.log('Successfully connected to Snowflake.');
                console.log("Connection: ", conn);
                resolve(conn);
            }
        });
    });
}

// Helper function to query Snowflake
export async function executeQuery({connection, query}) {
    return new Promise((resolve, reject) => {
      connection.execute({
        sqlText: query,
        complete: (err, stmt, rows) => {
          if (err) {
            console.error('Failed to execute query:', err.message);
            reject(err);
          } else {
            console.log('Query executed successfully.');
            resolve(rows);
          }
        },
      });
    });
  }

// Helper function to create database if it doesn't exist
export async function createDatabaseIfNotExists({ connection, databaseName }) {
    return new Promise((resolve, reject) => {
        const checkDbQuery = `SHOW DATABASES LIKE '${databaseName}'`;

        connection.execute({
            sqlText: checkDbQuery,
            complete: function (err, stmt, rows) {
                if (err) {
                    console.error('Error checking database existence:', err);
                    return reject(err);
                }
                if (rows.length === 0) {
                    // Database doesn't exist, create it
                    const createDbQuery = `CREATE DATABASE "${databaseName}"`;
                    connection.execute({
                        sqlText: createDbQuery,
                        complete: function (err) {
                            if (err) {
                                console.error('Error creating database:', err);
                                return reject(err);
                            }
                            console.log(`Database ${databaseName} created.`);
                            resolve();
                        },
                    });
                } else {
                    console.log(`Database ${databaseName} already exists.`);
                    resolve();
                }
            },
        });
    });
}

// Helper function to create schema if it doesn't exist
export async function createSchemaIfNotExists({ connection, databaseName, schemaName }) {
    return new Promise((resolve, reject) => {
        const checkSchemaQuery = `SHOW SCHEMAS IN DATABASE "${databaseName}"`;

        connection.execute({
            sqlText: checkSchemaQuery,
            complete: function (err, stmt, rows) {
                if (err) {
                    console.error('Error checking schema existence:', err);
                    return reject(err);
                }
                const schemaExists = rows.some(row => row.name === schemaName);
                if (!schemaExists) {
                    // Schema doesn't exist, create it
                    const createSchemaQuery = `CREATE SCHEMA "${databaseName}"."${schemaName}"`;
                    connection.execute({
                        sqlText: createSchemaQuery,
                        complete: function (err) {
                            if (err) {
                                console.error('Error creating schema:', err);
                                return reject(err);
                            }
                            console.log(`Schema ${schemaName} created in database ${databaseName}.`);
                            resolve();
                        },
                    });
                } else {
                    console.log(`Schema ${schemaName} already exists in database ${databaseName}.`);
                    resolve();
                }
            },
        });
    });
}

// Helper function to add the CSV file to the Snowflake database
export async function addCSVToSnowflake({ connection, databaseName, schemaName, csvFilePath, csvHeaders, tableName }) {
    try {
        // Utility function to sanitize and quote column names
        function sanitizeColumnName(columnName) {
            // Replace any double quotes with two double quotes to escape them
            let sanitized = columnName.replace(/"/g, '""').trim();
            return `"${sanitized}"`;
        }

        // Step 1: Set the database and schema context
        await executeQuery({ connection, query: `USE DATABASE "${databaseName}"` });
        await executeQuery({ connection, query: `USE SCHEMA "${schemaName}"` });

        // Step 2: Create an internal Snowflake stage
        const stageName = 'temp_stage';
        await executeQuery({ connection, query: `CREATE OR REPLACE STAGE ${stageName}` });

        // Step 3: Upload the CSV file to the Snowflake stage
        const fileName = csvFilePath.split(/[/\\]/).pop(); // Handles both '/' and '\' as path separators
        const localFilePath = csvFilePath.replace(/\\/g, '/'); // Convert backslashes to forward slashes
        const putCommand = `PUT 'file://${localFilePath}' @${stageName} AUTO_COMPRESS=FALSE OVERWRITE=TRUE`;

        const putResult = await executeQuery({ connection, query: putCommand });

        // Verify the file was uploaded
        if (!putResult || !Array.isArray(putResult) || putResult.length === 0) {
            throw new Error(`Failed to upload file ${fileName} to stage ${stageName}`);
        }
        const putStatus = putResult[0].status;
        if (putStatus !== 'UPLOADED' && putStatus !== 'SKIPPED') {
            throw new Error(`File ${fileName} was not uploaded successfully: ${putStatus}`);
        }

        // Step 4: Create the target table
        const createTableCommand = `
            CREATE OR REPLACE TABLE "${tableName}" (
                ${csvHeaders.map((header) => `${sanitizeColumnName(header)} STRING`).join(',\n')}
            )
        `;
        await executeQuery({ connection, query: createTableCommand });

        // Step 5: Copy the data from the stage into the table
        const copyCommand = `
            COPY INTO "${tableName}"
            FROM @${stageName}/${fileName}
            FILE_FORMAT = (
                TYPE = 'CSV',
                FIELD_DELIMITER = ',',
                FIELD_OPTIONALLY_ENCLOSED_BY = '"',
                SKIP_HEADER = 1,
                NULL_IF = ('', 'NULL')
            )
            ON_ERROR = 'CONTINUE'
        `;
        const copyResult = await executeQuery({ connection, query: copyCommand });

        // Check if any rows were loaded
        const rowsLoaded = copyResult[0]?.rows_loaded || 0;
        if (rowsLoaded === '0' || rowsLoaded === 0) {
            console.warn('No rows were loaded into the table.');
        } else {
            console.log(`${rowsLoaded} rows were loaded into the table.`);
        }
    
        // Step 6: Cleanup - Remove the staged file
        const removeCommand = `REMOVE @${stageName}/${fileName}`;
        await executeQuery({ connection, query: removeCommand });
        console.log(`Staged file removed: ${fileName}`);
    } catch (error) {
        console.error('Error uploading CSV to Snowflake:', error.message);
    }
}