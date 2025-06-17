import { useRouter } from 'next/router';
import { useEffect } from 'react';
const CursorDot = () => {
    const router = useRouter();
    useEffect(() => {
        const dot = document.createElement('div');
        dot.classList.add('cursor-dot');
        document.body.appendChild(dot);

        let mouse = { x: -100, y: -100 };
        let dotPos = { x: mouse.x, y: mouse.y };

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        document.addEventListener('mousemove', handleMouseMove);

        const handleMouseEnter = () => {
            dot.classList.add('cursor-dot-hover');
        };
        const handleMouseLeave = () => {
            dot.classList.remove('cursor-dot-hover');
        };

        setTimeout(() => {
            const clickableElements = document.querySelectorAll(
                'a, button, [role="button"], [onclick], [cursor="pointer"], [class*="hover"], [class*="group-hover"], [class*="cursor-pointer"]'
            );
            clickableElements.forEach((el) => {
                el.addEventListener('mouseenter', handleMouseEnter);
                el.addEventListener('mouseleave', handleMouseLeave);
            });
        }, 0);

        const updateDotPosition = () => {
            const damping = 0.5;
            dotPos.x += (mouse.x - dotPos.x) * damping;
            dotPos.y += (mouse.y - dotPos.y) * damping;

            dot.style.left = `${dotPos.x}px`;
            dot.style.top = `${dotPos.y}px`;

            requestAnimationFrame(updateDotPosition);
        };

        updateDotPosition();

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            const clickableElements = document.querySelectorAll(
                'a, button, [role="button"], [onclick], [cursor="pointer"], [class*="hover"], [class*="group-hover"], [class*="cursor-pointer"]'
            );
            clickableElements.forEach((el) => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
            });
            document.body.removeChild(dot);
        };
    }, [router]);

    return (
        <style jsx global>{`
            .cursor-dot {
                position: fixed;
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
                pointer-events: none;
                transform: translate(-50%, -50%);
                z-index: 9999;
                transition: transform 100ms ease-out, width 200ms ease, height 200ms ease, border 200ms ease;
                mix-blend-mode: difference;
            }

            .cursor-dot-hover {
                border: 1px solid rgba(167, 167, 167, 0.14);
                width: 60px;
                height: 60px;
                background: hsla(0, 0%, 100%, 0.04);
                -webkit-backdrop-filter: blur(2px);
                backdrop-filter: blur(2px);
                filter: invert(1);
            }

            .dark .cursor-dot-hover {
                border: 1px solid rgba(66, 66, 66, 0.66);
                filter: invert(1);
            }
        `}</style>
    );
};

export default CursorDot;
