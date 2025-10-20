"use client"

import {useState} from "react";
import {Button} from "@/components/ui/button";

export default function GeneratePDF() {
    const [loading, setLoading] = useState(false)

    const generatePDF = async () => {
        setLoading(true)
        const htmlContent = `<h1>Hello, test !</h1><p>This is a PDF generated from HTML</p>`

        const response = await fetch('/api/generate-pdf', {
            method: "POST",
            body: JSON.stringify(htmlContent),
            headers: {
                "Content-Type": "application/json"
            }
        })

        if (response.ok) {
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = "generated.pdf"
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } else {
            alert("Failed to generate PDF")
        }
        setLoading(true)
    }

    return (
        <div className="p-4">
            <Button
                onClick={generatePDF}
                disabled={loading}
            >
                {loading ? "Generating..." : "Download PDF"}
            </Button>
        </div>
    )
}