import axios from 'axios';
import Swal from 'sweetalert2';

const showToast = async (icon, title) => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
    Toast.fire({ icon, title });
};

export default function ContactRow({ contact, onContactEdited, onContactDeleted }) {

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const handleEdit = () => {
        onContactEdited(contact);
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: "Eliminar",
            text: `¿Estás seguro de eliminar a ${contact.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        });
        if (result.isConfirmed) {
            try {
                await axios.delete(`${API_URL}/${contact.id}`);
                onContactDeleted(contact.id);
                await showToast('success', 'Contacto eliminado correctamente.');
            } catch (err) {
                console.error("Error deleting contact:", err);
                const errorMsg = err.response?.data?.errors?.message?.[0] || 'Error al eliminar el contacto.';
                await showToast('error', errorMsg);
            }
        }
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
                    onClick={handleEdit}
                ></i>
                <i
                    className="bi bi-trash-fill text-danger"
                    style={{ cursor: "pointer" }}
                    onClick={handleDelete}
                ></i>
            </td>
        </tr>
    );
}