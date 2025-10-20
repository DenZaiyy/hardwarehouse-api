import {NextRequest, NextResponse} from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
    try {
        const { htmlContent } = await req.json()

        // Launch Puppeteer in headless mode
        const browser = await puppeteer.launch({ headless: true } )
        const page = await browser.newPage();

        // Set HTML Content
        await page.setContent(htmlContent, { waitUntil: "domcontentloaded" })

        // Generate PDF
        const pdfBuffer = await page.pdf({ format: "A4", printBackground: true })

        await browser.close()

        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=generated.pdf"
            }
        })
    } catch(error) {
        if (error instanceof Error) {
            return NextResponse.json({ error: `PDF generation failed : ${error.message}` }, { status: 500 })
        }
    }
}