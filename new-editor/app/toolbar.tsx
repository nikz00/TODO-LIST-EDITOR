'use client';
import { useState, useEffect, useRef } from 'react';

interface toolBarProps {
    toolBarRef: React.RefObject<HTMLDivElement | null>;
}

const HoverToolBar: React.FC<toolBarProps> = ({ toolBarRef }) => {
    const [position, setPosition] = useState<{ top: number, left: number } | null>(null);
    const [isBold, setIsBold] = useState(false);
    const [isItalic, setIsItalic] = useState(false);
    const [isUnderline, setIsUnderline] = useState(false);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const updatePosition = () => {
            const selection = window.getSelection();
            if (!selection || selection.rangeCount === 0) {
                setPosition(null);
                return;
            }

            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            if(rect.top === 0 && rect.left === 0) {
                return; //Prevents incorrect positioning when Enter is pressed
            }
            setPosition({
                // Position the toolbar below the cursor
                top: rect.bottom + window.scrollY + 10,
                left: rect.left + window.scrollX + rect.width / 2
            });

            //Check if the selected text is bold, italic or underlined
            setIsBold(document.queryCommandState('bold'));
            setIsItalic(document.queryCommandState('italic'));
            setIsUnderline(document.queryCommandState('underline'));
        };

        useEffect(() => {
            const handleMouseUp = () => {
                const selection = window.getSelection();
                if(selection && selection.toString().length > 0) {
                    updatePosition();
                }
            };
        
            const handleKeyDown = (e: KeyboardEvent) => {
                if(e.key === "Enter") {
                    updatePosition();
                }
            };
            document.addEventListener('mouseup', handleMouseUp);
            document.addEventListener('keyup', updatePosition);
            document.addEventListener('keydown', handleKeyDown);

            return () => {
                document.removeEventListener('mouseup', handleMouseUp);
                document.removeEventListener('keyup', updatePosition);
                document.removeEventListener('keydown', handleKeyDown);
            };
        }, []);

    const applyStyle = (style: string) => {
        document.execCommand(style, false);
        setIsBold(document.queryCommandState('bold'));
        setIsItalic(document.queryCommandState('italic'));
        setIsUnderline(document.queryCommandState('underline'));
    };

    if (!position) return null;

    return (
        <div
            ref={toolbarRef}
            style={{ top: position.top, left: position.left }}
            className="absolute bg-black p-2 rounded shadow-lg">
            <button onClick={() => applyStyle('bold')} 
                className={`px-2 py-1 hover:bg-gray-600 rounded ${isBold ? "bg-gray-600" : ""}`}>B</button>
            <button onClick={() => applyStyle('italic')} 
                className={`px-2 py-1 hover:bg-gray-600 rounded ${isItalic ? "bg-gray-600" : ""}`}>I</button>
            <button onClick={() => applyStyle('underline')} 
                className={`px-2 py-1 hover:bg-gray-600 rounded ${isUnderline ? "bg-gray-600" : ""}`}>U</button>
        </div>
    );
};

export default HoverToolBar;