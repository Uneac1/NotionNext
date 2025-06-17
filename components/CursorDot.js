import { useEffect, useState } from 'react';

const CursorDot = () => {
    const [isFullscreenMode, setIsFullscreenMode] = useState(false);
    
    useEffect(() => {
        const dot = document.createElement('div');
        dot.classList.add('cursor-dot');
        document.body.appendChild(dot);

        let mouse = { x: -100, y: -100 };
        let dotPos = { x: mouse.x, y: mouse.y };
        let isMouseDown = false;

        const handleMouseMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
        const handleMouseDown = () => { isMouseDown = true; dot.classList.add('cursor-dot-hover'); };
        const handleMouseUp = () => { isMouseDown = false; dot.classList.remove('cursor-dot-hover'); };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        const updateDotPosition = () => {
            const damping = 0.5;
            dotPos.x += (mouse.x - dotPos.x) * damping;
            dotPos.y += (mouse.y - dotPos.y) * damping;
            dot.style.left = `${dotPos.x}px`;
            dot.style.top = `${dotPos.y}px`;

            const pageSize = Math.max(window.innerWidth, window.innerHeight);
            const dotSize = Math.max(dot.offsetWidth, dot.offsetHeight);
            if (isMouseDown && dotSize >= pageSize && !isFullscreenMode) {
                setIsFullscreenMode(true);
            }

            requestAnimationFrame(updateDotPosition);
        };

        updateDotPosition();

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.removeChild(dot);
        };
    }, [isFullscreenMode]);

    useEffect(() => {
        if (isFullscreenMode) {
            const dot = document.querySelector('.cursor-dot');
            dot.classList.remove('cursor-dot-hover');
            dot.classList.add('cursor-dot-fullscreen');
            dot.style.backgroundColor = document.body.classList.contains('dark') ? 'black' : 'white';
        }
    }, [isFullscreenMode]);

    return (
        <style jsx global>{`
            .cursor-dot {
                position: fixed; width: 12px; height: 12px; background: white; border-radius: 50%;
                pointer-events: none; transform: translate(-50%, -50%); z-index: 9999;
                transition: transform 100ms, width 200ms, height 200ms, border 200ms;
                mix-blend-mode: difference;
            }
            .cursor-dot-hover {
                border: 1px solid rgba(167, 167, 167, 0.14); width: 9999px; height: 9999px;
                background: hsla(0, 0%, 100%, 0.04); backdrop-filter: blur(2px); filter: invert(1);
            }
            .cursor-dot-fullscreen {
                width: 30px; height: 30px; background: rgba(0, 0, 0, 0.8);
            }
        `}</style>
    );
};

export default CursorDot;
