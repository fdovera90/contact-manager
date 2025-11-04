"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';

const E164_REGEX = /^\+?[1-9]\d{1,14}$/; 
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const showToast = async (icon, title) => {
    const { default: Swal } = await import('sweetalert2');

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer);
            toast.addEventListener('mouseleave', Swal.resumeTimer);
        }
    });

    Toast.fire({
        icon: icon,
        title: title
    });
};

export default function AddContactForm({ onContactAdded }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [serverError, setServerError] = useState(null);

    const { 
        register, 
        handleSubmit, 
        formState: { errors, isValid, isSubmitting },
        reset
    } = useForm({
        mode: "onBlur", 
        defaultValues: { name: '', lastname: '', email: '', phone: '' }
    });

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    const onSubmit = async (data) => {
        setServerError(null);
        try {
            const response = await axios.post(API_URL, data);
            onContactAdded(response.data.contact);
            reset();
            await showToast('success', 'Contacto guardado correctamente.');
        } catch (err) {
            console.error("Error creating contact:", err);

            const status = err.response?.status;
            const errorData = err.response?.data;
            const messagesToShow = [];

            if (status === 409 && errorData?.errors?.message) {
                // Error 409 CONFLICT (Unicidad)
                messagesToShow.push(errorData.errors.message[0]);
            } else if (status === 400 && errorData?.errors) {
                // Error 400 BAD REQUEST (Validación o Extra Attributes)
                for (const property in errorData.errors) {
                    const messages = errorData.errors[property];
                    if (Array.isArray(messages))
                        messages.forEach(msg => messagesToShow.push(`${property}: ${msg}`));
                }
                
                if (errorData.errors.message) messagesToShow.push(errorData.errors.message[0]);
                
            } else {
                // Otros errores de red o servidor (ej: 500)
                messagesToShow.push(err.message || 'Error desconocido del servidor.');
            }

            if (messagesToShow.length > 0) {
                const formattedMessage = (
                    <ul>
                        {messagesToShow.map((msg, index) => (
                            <li key={index}>{msg}</li>
                        ))}
                    </ul>
                );
                
                setServerError(formattedMessage);
                await showToast('error', 'El formulario contiene errores. Revise la lista.');
            } else {
                 await showToast('error', 'Error al procesar la solicitud.');
            }
        }
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
                        className={`bi ${isCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'} fs-4`}
                    ></i>
                </div>

                <div className={`collapse ${!isCollapsed ? 'show' : ''}`} id="collapseFormContact">
                    <div className="card-body">

                        <form onSubmit={handleSubmit(onSubmit)}>
                            {serverError && (
                                <div className="alert alert-danger mb-4" role="alert">
                                    {serverError}
                                </div>
                            )}
                            <div className="row g-3">
                                {/* --------------------- 1. NAME (Nombre) --------------------- */}
                                <div className="col-md-6">
                                    <label htmlFor="name" className="form-label">Nombre *</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        id="name"
                                        {...register("name", {
                                            required: "El Nombre es obligatorio.",
                                            minLength: { value: 2, message: "El Nombre debe tener al menos 2 caracteres." },
                                            maxLength: { value: 255, message: "El Nombre no puede exceder los 255 caracteres." }
                                        })}
                                    />
                                    {errors.name && (
                                        <div className="invalid-feedback">
                                            {errors.name.message}
                                        </div>
                                    )}
                                </div>

                                {/* --------------------- 2. LASTNAME (Apellido) --------------------- */}
                                <div className="col-md-6">
                                    <label htmlFor="lastname" className="form-label">Apellido (Opcional)</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="lastname"
                                        {...register("lastname", {
                                            maxLength: { value: 255, message: "El apellido no puede exceder los 255 caracteres." } 
                                        })}
                                    />
                                </div>

                                {/* --------------------- 3. EMAIL (Correo) --------------------- */}
                                <div className="col-md-6">
                                    <label htmlFor="email" className="form-label">Correo *</label>
                                    <input
                                        type="email"
                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                        id="email"
                                        placeholder="ejemplo@dominio.com"
                                        {...register("email", {
                                            required: "El Correo es obligatorio.",
                                            pattern: {
                                                value: EMAIL_REGEX,
                                                message: "El formato del Correo no es válido.",
                                            },
                                            maxLength: { value: 255, message: "El correo no puede exceder los 255 caracteres." }
                                        })}
                                    />
                                    {errors.email && (
                                        <div className="invalid-feedback">
                                            {errors.email.message}
                                        </div>
                                    )}
                                </div>

                                {/* --------------------- 4. PHONE (Teléfono) --------------------- */}
                                <div className="col-md-6">
                                    <label htmlFor="phone" className="form-label">Teléfono (E.164)</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                        id="phone"
                                        placeholder="+56912345678"
                                        {...register("phone", {
                                            validate: value => !value || E164_REGEX.test(value) || "El Teléfono debe ser formato internacional E.164.",
                                            maxLength: { value: 255, message: "El teléfono no puede exceder los 255 caracteres." }
                                        })}
                                    />
                                    {errors.phone && (
                                        <div className="invalid-feedback">
                                            {errors.phone.message}
                                        </div>
                                    )}
                                </div>

                                {/* --------------------- Botón Guardar --------------------- */}
                                <div className="col-12 mt-4">
                                    <button type="submit" className="btn btn-success" disabled={!isValid || isSubmitting}>
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Cargando...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-save2 me-2"></i>
                                                Guardar
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}