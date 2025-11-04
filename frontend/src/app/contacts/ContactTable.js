import ContactRow from "./ContactRow";

export default function ContactTable({ contacts, onContactDeleted }) {
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
                            No contacts found
                        </td>
                    </tr>
                ) : (
                    contacts.map(contact => (
                        <ContactRow key={contact.id} contact={contact} onContactDeleted={onContactDeleted} />
                    ))
                )}
            </tbody>
        </table>
    );
}