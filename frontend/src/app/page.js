"use client";

import { useEffect, useState } from "react";
import ContactTable from "./contacts/ContactTable";
import EditContactModal from "./contacts/EditContactModal"; 
import AddContactForm from "./contacts/AddContactForm";

export default function HomePage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactToEdit, setContactToEdit] = useState(null);

  // Fetch al backend
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}`)
      .then(res => res.json())
      .then(data => {
        setContacts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching contacts:", err);
        setLoading(false);
      });
  }, []);

  const handleContactAdded = (newContact) => {
    setContacts(prevContacts => [...prevContacts, newContact]);
  };

  const handleContactDeleted = (contactDeletedId) => {
    setContacts(prevContacts => prevContacts.filter(c => c.id !== contactDeletedId));
  }

  const handleContactEdit = (contactEditId) => {
    setContactToEdit(contactEditId);
  };

  const handleEditClose = () => {
    setContactToEdit(null);
  };

  const handleContactUpdated = (updatedContact) => {
    // Reemplaza el contacto anterior con el actualizado en la lista
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === updatedContact.id ? updatedContact : contact
      )
    );
    handleEditClose(); // Cierra la modal
  };

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Listado de contactos</h1>
      <ContactTable contacts={contacts} onContactDeleted={handleContactDeleted} onContactEdited={handleContactEdit} />
      <AddContactForm onContactAdded={handleContactAdded} />

      {contactToEdit && (
        <EditContactModal 
          contactToEdit={contactToEdit}
          onClose={handleEditClose}
          onContactUpdated={handleContactUpdated}
        />
      )}
    </div>
  );
}
