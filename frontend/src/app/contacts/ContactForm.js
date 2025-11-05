"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { isValidPhoneNumber } from 'libphonenumber-js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

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

export default function ContactForm({ contactToEdit = null, onSuccess = () => {}, onCancel = () => {} }) {
    const [serverError, setServerError] = useState(null);

    const { 
        register, 
        handleSubmit, 
        formState: { errors, isValid, isSubmitting },
        reset,
        setValue, 
        clearErrors
    } = useForm({
        mode: "onChange", 
        defaultValues: { name: '', lastname: '', email: '', phone: '' } 
    });

    useEffect(() => {
        setServerError(null);
        clearErrors();
        if (contactToEdit) {
            // Cargar los datos del contacto a editar
            setValue('name', contactToEdit.name);
            setValue('lastname', contactToEdit.lastname || '');
            setValue('email', contactToEdit.email);
            setValue('phone', contactToEdit.phone || '');
        } else {
            // Limpiar para el modo de adición
            reset();
        }
    }, [contactToEdit, setValue, reset, clearErrors]);

    const onSubmit = async (data) => {
        setServerError(null);
        clearErrors();

        const isEditing = !!contactToEdit;
        const url = isEditing ? `${API_URL}/${contactToEdit.id}` : API_URL;
        const method = isEditing ? axios.put : axios.post;
        const successMessage = isEditing ? 'Contacto actualizado correctamente.' : 'Contacto guardado correctamente.';

        try {
            const finalData = {};
            for (const key in data) {
                finalData[key] = typeof data[key] === 'string' ? data[key].trim() : data[key];
            }
            const response = await method(url, finalData);
            onSuccess(response.data.contact);
            if (!isEditing) reset();
            await showToast('success', successMessage);
        } catch (err) {
            console.error("Error submitting contact:", err);

            const status = err.response?.status;
            const errorData = err.response?.data;
            const messagesToShow = [];
            
            // Lógica de manejo de errores (igual a la versión simple anterior)
            if (status === 409 && errorData?.errors?.message) {
                messagesToShow.push(errorData.errors.message[0]);
            } else if (status === 400 && errorData?.errors) {
                for (const property in errorData.errors) {
                    const messages = errorData.errors[property];
                    if (Array.isArray(messages))
                        messages.forEach(msg => messagesToShow.push(`${property}: ${msg}`));
                }
                if (errorData.errors.message) messagesToShow.push(errorData.errors.message[0]);
            } else {
                messagesToShow.push(err.message || 'Error desconocido del servidor.');
            }

            if (messagesToShow.length > 0) {
                const formattedMessage = (
                    <ul>
                        {messagesToShow.map((msg, index) => (<li key={index}>{msg}</li>))}
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
                    <label htmlFor="lastname" className="form-label">Apellido </label>
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
                    <label htmlFor="phone" className="form-label">Teléfono </label>
                    <input
                        type="text"
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        id="phone"
                        placeholder="+56912345678"
                        {...register("phone", {
                            validate: value => {
                                if (!value || value.trim() === '') {
                                    return true;
                                }
                                return isValidPhoneNumber(value) || "El número de teléfono no es válido. Debe estar en formato internacional (ejemplo: +56912345678).";
                            },
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
    );
}