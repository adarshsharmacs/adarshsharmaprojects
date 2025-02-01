self.onmessage = (event) => {
    const file = event.data;
    const reader = new FileReader();
    const decoder = new TextDecoder();
    let offset = 0;
    const CHUNK_SIZE = 1024 * 1024 * 2; // 2MB chunks

    reader.onload = (e) => {
        const text = decoder.decode(e.target.result, { stream: true });
        const lines = text.split("\n");

        lines.forEach((line, index) => {
            self.postMessage({ line, index });
        });

        if (offset < file.size) {
            offset += CHUNK_SIZE;
            readNextChunk();
        } else {
            self.postMessage({ done: true });
        }
    };

    reader.onerror = () => {
        self.postMessage({ error: "Error reading file" });
    };

    const readNextChunk = () => {
        const blob = file.slice(offset, offset + CHUNK_SIZE);
        reader.readAsArrayBuffer(blob);
    };

    readNextChunk(); // Initial file reading
};
