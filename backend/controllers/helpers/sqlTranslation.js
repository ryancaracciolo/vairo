export function convertToSnowflakeSQL({postgresSQL}) {
    // Match unquoted table and column names and replace with quoted identifiers
    const regex = /(?<!["'`])\b[a-z_][a-z0-9_]*\b(?!["'`])/g;

    console.log(postgresSQL.replace(regex, (match) => `"${match}"`));

    // Replace with double-quoted identifiers for Snowflake
    return postgresSQL.replace(regex, (match) => `"${match}"`);
}

