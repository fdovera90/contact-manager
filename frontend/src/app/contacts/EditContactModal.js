import React from 'react';
import ContactForm from './ContactForm';

export default function EditContactModal({ contactToEdit, onClose, onContactUpdated }) {
    if (!contactToEdit) return null;
    return (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-lg">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">Editar Contacto: {contactToEdit.name}</h5>
                        <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
                    </div>

                    <div className="modal-body">
                        <ContactForm
                            contactToEdit={contactToEdit}
                            onSuccess={onContactUpdated}
                            onCancel={onClose}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}