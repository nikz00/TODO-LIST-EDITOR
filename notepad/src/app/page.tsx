// /d:/work/Project/notepad/src/app/page.tsx
'use client'
import { useState, useEffect, useRef } from "react";

const Notepad = () => {
    const [notes, setNotes] = useState<string>('');

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNotes(event.target.value);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>Notepad</h1>
            <textarea
                value={notes}
                onChange={handleChange}
                rows={20}
                cols={80}
                style={{ width: '100%', height: '400px' }}
            />
        </div>
    );
};

export default Notepad;