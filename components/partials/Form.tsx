"use client"

import React from "react";

type FormProps = {
    action: string;
    method: string;
    redirect: string;
    children: React.ReactNode;
}

export default function Form({ action, method = "POST", redirect, children } : FormProps) {
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${action}`, {
                method: method,
                body: formData
            })

            const data= await response.json();

            if (data.redirect) {
                window.location.href = redirect;
            }
        } catch (err) {
            if (err instanceof Error) {
                console.error("Error submitting form:", err.message);
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} method={method} className="flex flex-col gap-4">
            {children}

            <button type="submit" className="text-foreground bg-green-500 font-medium rounded-md px-4 py-2">{method === "PATCH" || 'PUT' ? 'Mettre à jour' : 'Ajouter'}</button>
        </form>
    )
}