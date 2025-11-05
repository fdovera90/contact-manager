"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ContactTable from "./contacts/ContactTable";
import EditContactModal from "./contacts/EditContactModal";
import AddContactForm from "./contacts/AddContactForm";
import SearchBar from "./contacts/SearchBar";
import { authService } from "./services/auth";

export default function HomePage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contactToEdit, setContactToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [canEdit, setCanEdit] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [canAdd, setCanAdd] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login");
      return;
    }

    // Cargar permisos basados en roles
    const updatePermissions = () => {
      const edit = authService.canEdit();
      const del = authService.canDelete();
      const add = authService.canAdd();
      setCanEdit(edit);
      setCanDelete(del);
      setCanAdd(add);
    };

    updatePermissions();

    const timer = setTimeout(updatePermissions, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Fetch al backend
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      return;
    }
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
    resetSearchTerm();
  };

  const handleContactDeleted = (contactDeletedId) => {
    setContacts(prevContacts => prevContacts.filter(c => c.id !== contactDeletedId));
    resetSearchTerm();
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
    resetSearchTerm();
  };

  const filteredContacts = contacts.filter(contact => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    // Concatena Nombre, Apellido y Email para buscar
    const searchableText = `${contact.name} ${contact.lastname} ${contact.email}`.toLowerCase();
    return searchableText.includes(lowerCaseSearchTerm);
  });

  // Manejador del cambio en la caja de texto
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  }

  const resetSearchTerm = () => {
    setSearchTerm('');
  };

  const handleLogout = () => {
    authService.logout();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3 text-muted">Cargando contactos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <i className="bi bi-person-lines-fill fs-4 text-white me-2"></i>
          </div>
          <div className="navbar-brand mx-auto mb-0">
            Listado de contactos
          </div>
          <div className="d-flex align-items-center">
            <i
              className="bi bi-box-arrow-right fs-4 text-white"
              style={{ cursor: 'pointer' }}
              onClick={handleLogout}
              title="Cerrar sesión"
            ></i>
          </div>
        </div>
      </nav>

      <div className="container mt-5">
        <SearchBar searchTerm={searchTerm} onSearchChange={handleSearchChange} />
        <ContactTable
          contacts={filteredContacts}
          onContactDeleted={handleContactDeleted}
          onContactEdited={handleContactEdit}
          canEdit={canEdit}
          canDelete={canDelete}
        />
        {canAdd && (
          <AddContactForm onContactAdded={handleContactAdded} />
        )}

        {contactToEdit && canEdit && (
          <EditContactModal
            contactToEdit={contactToEdit}
            onClose={handleEditClose}
            onContactUpdated={handleContactUpdated}
          />
        )}
      </div>
    </div>
  );
}
