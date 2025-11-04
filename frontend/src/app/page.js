"use client";

import { useEffect, useState } from "react";
import ContactTable from "./contacts/ContactTable";
import AddContactForm from "./contacts/ContactForm";

export default function HomePage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setContacts([...contacts, newContact]);
  };

  const handleContactDeleted = (contactDeletedId) => {
    setContacts(prevContacts => prevContacts.filter(c => c.id !== contactDeletedId));
  }

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Listado de contactos</h1>
      <ContactTable contacts={contacts} onContactDeleted={handleContactDeleted} />
      <AddContactForm onContactAdded={handleContactAdded} />
    </div>
  );
}
