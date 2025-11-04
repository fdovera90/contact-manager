import ContactRow from "./ContactRow";

export default function ContactTable({ contacts, onContactEdited, onContactDeleted }) {
    return (
        <table className="table table-striped table-bordered">
            <thead className="table-dark">
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {contacts.length === 0 ? (
                    <tr>
                        <td colSpan="6" className="text-center">
                            No se encontraron contactos
                        </td>
                    </tr>
                ) : (
                    contacts.map(contact => (
                        <ContactRow key={contact.id} contact={contact} onContactEdited={onContactEdited} onContactDeleted={onContactDeleted} />
                    ))
                )}
            </tbody>
        </table>
    );
}