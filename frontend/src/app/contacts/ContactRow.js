export default function ContactRow({ contact }) {

    const handleEdit = () => {
      console.log("Edit contact:", contact);
      alert(`Edit contact ${contact.name} - ${contact.email}`);
    };
  
    const handleDelete = () => {
      console.log("Delete contact:", contact);
      alert(`Delete contact ${contact.name} - ${contact.email}`);
    };
  
    return (
      <tr>
        <td>{contact.id}</td>
        <td>{contact.name}</td>
        <td>{contact.lastname}</td>
        <td>{contact.email}</td>
        <td>{contact.phone}</td>
        <td>
            <i
                className="bi bi-pencil-fill text-primary me-2"
                style={{ cursor: "pointer" }}
                onClick={() => handleEdit(contact.id)}
            ></i>
            <i
                className="bi bi-trash-fill text-danger"
                style={{ cursor: "pointer" }}
                onClick={() => handleDelete(contact.id)}
            ></i>
        </td>
      </tr>
    );
  }