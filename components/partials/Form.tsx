"use client"

import React, {useState} from "react";
import toast from "react-hot-toast";

type FormProps = {
    action: string;
    method: string;
    fileUpload: boolean;
    children: React.ReactNode;
}

export default function Form({ action, method = "POST", fileUpload = false, children } : FormProps) {

    const [selectedFile, setSelectedFile] = useState<File | null>()

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files) return;
        setSelectedFile(e.target.files[0]);
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        formData.append('image', selectedFile);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${action}`, {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(Object.fromEntries(formData), (key, value) => key === 'price' ? parseFloat(value) : value)
            })

            const data = await response.json();

            toast.success("Form submitted successfully");

            if (data.redirect) {
                setTimeout(() => {
                    window.location.href = data.redirect;
                }, 2000)
            }
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Error submitting form");
                console.error("Error submitting form:", err.message);
            }
        }
    }

    return (
        <form onSubmit={handleSubmit} method={method} className="flex flex-col gap-4">
            {children}

            {fileUpload && (
                <div className="flex flex-col">
                    <label htmlFor="image" className="mb-1 font-medium">Image</label>
                    <input type="file" name="image" id="image" onChange={handleFileChange}/>
                </div>
            )}

            <button type="submit" className="text-foreground bg-green-500 font-medium rounded-md px-4 py-2">{method === "POST" ? 'Ajouter' : 'Mettre à jour' }</button>
        </form>
    )
}