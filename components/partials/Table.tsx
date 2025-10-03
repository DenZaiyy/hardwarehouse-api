import Image from "next/image";
import {formatDate} from "@/lib/utils";

type TableProps<T> = {
    data: T[];
}

export default function Table<T extends object>({data}: TableProps<T>) {
    if (data.length === 0) return <p>No data available.</p>

    const headers = Object.keys(data[0]) as (keyof T)[];

    return (
        <table>
            <thead>
            <tr>
                {headers && headers.map((header) => (
                    <th key={String(header)}>{String(header.toString().toUpperCase())}</th>
                ))}
            </tr>
            </thead>
            <tbody>
            {data && data.map((row, i) => (
                <tr key={i}>
                    {headers.map((header) => (
                        <td key={String(header)}>
                            {header === 'image' || header === 'logo' && typeof row[header] === 'string' ? (
                                <Image src={row[header] as unknown as string} alt="Image" width={50} height={50}/>
                            ) : header.toString().toLowerCase().includes('created') || header.toString().toLowerCase().includes('updated') && row[header] ? (
                                formatDate(row[header] as unknown as string)
                            ) : (
                                String(row[header])
                            )}
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
    )
}