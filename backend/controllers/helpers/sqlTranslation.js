export function translatePostgresToSnowflake(query) {
    // Match unquoted table and column names and replace with quoted identifiers
    const regex = /(?<!["'`])\b[a-z_][a-z0-9_]*\b(?!["'`])/g;

    console.log(query.replace(regex, (match) => `"${match}"`));

    // Replace with double-quoted identifiers for Snowflake
    return query.replace(regex, (match) => `"${match}"`);
}

