import React, { useState, useRef } from 'react';
import { diffWords } from "diff";

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

const FileUpload3 = () => {
    const [text1, setText1] = useState('');
    const [text2, setText2] = useState('');
    const [loading1, setLoading1] = useState(false);
    const [loading2, setLoading2] = useState(false);
    const [progress1, setProgress1] = useState(0);
    const [progress2, setProgress2] = useState(0);
    const [highlightedText1, setHighlightedText1] = useState("");
    const [highlightedText2, setHighlightedText2] = useState("");
    const abortController = useRef(null);

    const readFileInChunks = async (file, setText, setLoading, setProgress) => {
        setLoading(true);
        setProgress(0);
        
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
        let content = '';
        
        for (let chunk = 0; chunk < totalChunks; chunk++) {
            const start = chunk * CHUNK_SIZE;
            const end = Math.min(start + CHUNK_SIZE, file.size);
            const blob = file.slice(start, end);
            
            const text = await readChunk(blob);
            content += text;
            
            const progress = Math.round((chunk + 1) / totalChunks * 100);
            setProgress(progress);
        }
        
        setText(content);
        setLoading(false);
    };

    const readChunk = (blob) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsText(blob);
        });
    };

    const handleFileUpload = async (e, setText, setLoading, setProgress) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            await readFileInChunks(file, setText, setLoading, setProgress);
        } catch (error) {
            console.error('Error reading file:', error);
            setLoading(false);
        }
    };

    const compareText = () => {
        if (!text1 || !text2) return;

        const diff1 = diffWords(text1, text2);
        const diff2 = diffWords(text2, text1);

        const formatDiff = (diffArray) =>
            diffArray
                .map((part) => {
                    if (part.added) return `<span style="background-color:#ffb3b3">${part.value}</span>`;
                    if (part.removed) return `<span style="background-color:#b3e6ff">${part.value}</span>`;
                    return `<span>${part.value}</span>`;
                })
                .join("");

        setHighlightedText1(formatDiff(diff1));
        setHighlightedText2(formatDiff(diff2));
    };

    return (
        <div>
            <h2>File Comparison Tool</h2>

            <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                <div>
                    <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, setText1, setLoading1, setProgress1)} 
                    />
                    {loading1 && <progress value={progress1} max="100" />}
                </div>
                <div>
                    <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, setText2, setLoading2, setProgress2)} 
                    />
                    {loading2 && <progress value={progress2} max="100" />}
                </div>
            </div>

            <div style={{ display: "flex", gap: "20px" }}>
                <div style={{ position: "relative", width: "50%" }}>
                    <h3>File 1 / Text 1 {loading1 && `(${progress1}%)`}</h3>
                    <textarea
                        rows="10"
                        cols="50"
                        value={text1}
                        onChange={(e) => setText1(e.target.value)}
                        placeholder="Paste or upload text"
                        style={{ width: "100%", height: "200px" }}
                    />
                    <div
                        dangerouslySetInnerHTML={{ __html: highlightedText1 }}
                        style={{ whiteSpace: "pre-wrap", marginTop: "10px", fontFamily: "monospace" }}
                    />
                </div>
                <div style={{ position: "relative", width: "50%" }}>
                    <h3>File 2 / Text 2 {loading2 && `(${progress2}%)`}</h3>
                    <textarea
                        rows="10"
                        cols="50"
                        value={text2}
                        onChange={(e) => setText2(e.target.value)}
                        placeholder="Paste or upload text"
                        style={{ width: "100%", height: "200px" }}
                    />
                    <div
                        dangerouslySetInnerHTML={{ __html: highlightedText2 }}
                        style={{ whiteSpace: "pre-wrap", marginTop: "10px", fontFamily: "monospace" }}
                    />
                </div>
            </div>

            <button onClick={compareText} style={{ marginTop: "20px" }}>Compare Files</button>
        </div>
    );
};

export default FileUpload3;
