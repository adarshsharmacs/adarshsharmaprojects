import React, { useState, useEffect } from "react";
import axios from "axios";

const FileUpload = () => {
    const [file1, setFile1] = useState(null);
    const [file2, setFile2] = useState(null);
    const [fileData1, setFileData1] = useState("");
    const [fileData2, setFileData2] = useState("");
    const [differences, setDifferences] = useState([]); // Always an array
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debugging useEffect - Logs differences only when it changes
    useEffect(() => {
        console.log("differences changed:", differences);
    }, [differences]);

    const handleFileChange = (event, fileNumber) => {
        const selectedFile = event.target.files[0];
        if (fileNumber === 1) setFile1(selectedFile);
        else setFile2(selectedFile);
    };

    const handleUpload = async () => {
        if (!file1 || !file2) {
            setError("Please select both files.");
            return;
        }

        setLoading(true);
        setError(null);
        setDifferences([]); // Reset before new comparison

        const formData = new FormData();
        formData.append("file1", file1);
        formData.append("file2", file2);

        try {
            const response = await axios.post("http://localhost:5016/api/file/compare", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            console.log("API Response:", response.data); // Debugging

            // Check the actual response type
        if (typeof response.data === "string") {
            console.error("Response is a string:", response.data);
        } else if (typeof response.data === "object") {
            console.log("Response is an object:", response.data);
        }

            // Ensure differences is always an array and only update if valid
            if (Array.isArray(response.data?.differences)) {
                console.log("final response:" , response.data.differences);
                setDifferences(prev => {
                    console.log("Setting differences:", response.data.differences);
                    return response.data.differences;
                });
            } else {
                console.error("Unexpected response format:", response.data);
                setDifferences(prev => prev); // Keep the previous state
            }
        } catch (err) {
            console.error("Error comparing files:", err);
            setError("Error comparing files. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h2>File Comparison Tool</h2>

            <input type="file" onChange={(e) => handleFileChange(e, 1)} />
            <input type="file" onChange={(e) => handleFileChange(e, 2)} />

            <button onClick={() => !loading && handleUpload()} disabled={loading}>
                {loading ? "Comparing..." : "Compare Files"}
            </button>

            {loading && <p>Comparing files...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* 🔽 Safe check: Ensure differences is always an array before using .length */}
            {Array.isArray(differences) && differences.length > 0 ? (
                <div>
                    <h3>Differences Found:</h3>
                    <ul>
                        {differences.map((diff, index) => (
                            <li key={index}>{diff}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No differences found or no comparison done yet.</p>
            )}
        </div>
    );
};

export default FileUpload;
