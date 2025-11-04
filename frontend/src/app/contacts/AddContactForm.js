import React, { useState } from 'react';
import ContactForm from './ContactForm';

export default function AddContactForm({ onContactAdded }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    // En el modo de guardar un contacto, onSuccess es la función onContactAdded
    const handleSuccess = (newContact) => {
        onContactAdded(newContact);
    };

    return (
        <div className="mt-4">
            <div className="card">
                <div 
                    className="card-header d-flex justify-content-between align-items-center"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{ cursor: 'pointer' }}
                    aria-expanded={!isCollapsed}
                    aria-controls="collapseFormContact"
                >
                    <h3 className="mb-0">
                        Agregar Contacto
                    </h3>
                    
                    <i
                        className={`bi ${!isCollapsed ? 'bi-chevron-up' : 'bi-chevron-down'} fs-4`}
                    ></i>
                </div>

                <div className={`collapse ${!isCollapsed ? 'show' : ''}`} id="collapseFormContact">
                    <div className="card-body">
                        <ContactForm 
                            onSuccess={handleSuccess} 
                            contactToEdit={null}
                            onCancel={() => {}}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}