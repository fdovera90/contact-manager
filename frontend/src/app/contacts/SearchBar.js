import React from 'react';

export default function SearchBar({ searchTerm, onSearchChange }) {
    return (
        <div className="mb-4">
            <label htmlFor="contactSearch" className="form-label visually-hidden">
                Buscar contactos por nombre, apellido o email
            </label>
            <div className="input-group">
                <span className="input-group-text">
                    <i className="bi bi-search"></i>
                </span>
                <input
                    type="text"
                    className="form-control"
                    id="contactSearch"
                    placeholder="Buscar por nombre, apellido o email..."
                    value={searchTerm}
                    onChange={onSearchChange}
                />
            </div>
        </div>
    );
}