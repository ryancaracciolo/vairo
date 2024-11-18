import React from 'react';

function PostgresForm({ formData, setFormData }) {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="postgres-form">
            <div className="side left">
                <div className="form-group">
                    <label htmlFor="connectionName">Connection Name</label>
                    <input
                        type="text"
                        id="connectionName"
                        name="connectionName"
                        placeholder="Pick a name to help you identify this source in Vairo"
                        value={formData.connectionName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="host">Host</label>
                    <input
                        type="text"
                        id="host"
                        name="host"
                        placeholder="Hostname of the database"
                        value={formData.host}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="port">Port</label>
                    <input
                        type="text"
                        id="port"
                        name="port"
                        placeholder="Port the database is hosted on"
                        value={formData.port}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="databaseName">Database Name</label>
                    <input
                        type="text"
                        id="databaseName"
                        name="databaseName"
                        placeholder="Name of your database you’d like to use in Vairo"
                        value={formData.databaseName}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
            <div className="side right">
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Username of a ‘read-only’ user to access the database"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password associated with the 'read-only' user"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
            </div>
        </div>
    );
}

export default PostgresForm; 