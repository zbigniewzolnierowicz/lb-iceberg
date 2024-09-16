'use client'

import { toJpeg } from "html-to-image";
import { useRef } from "react"

export default function ResultBox({ result }: { result: [string, number, string][] }) {
    const resultsMapped = Object.groupBy(result ?? [], r => r[1])
    const resultRef = useRef<HTMLUListElement>(null)

    function downloadResults() {
        const el = resultRef.current;

        if (el === null) {
            return;
        }

        toJpeg(el, { quality: 0.95 })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = 'iceberg.jpeg';
                link.href = dataUrl;
                link.click();
            });
    }

    return (
        <>
            <ul id="results" className="font-bold" ref={resultRef}>
                {[0,1,2,3,4,5,6,7,8].map(i => (
                    <li key={i} className="result">
                        {resultsMapped[i]?.map(a => (
                            <a key={a[0]} href={a[2]}>{a[0]}</a>
                        ))}
                    </li>
                ))}
            </ul>
            <button className="bg-green-400" type="button" onClick={downloadResults}>Download</button>
        </>
    )
}
