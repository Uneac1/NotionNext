import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const CursorDot = () => {
    const router = useRouter();
    const [isDark, setIsDark] = useState(false);
    const [isPressed, setIsPressed] = useState(false);
    const [scale, setScale] = useState(1);

    useEffect(() => {
        const dot = document.createElement('div');
        dot.classList.add('cursor-dot');
        document.body.appendChild(dot);

        let mouse = { x: -100, y: -100 };
        let dotPos = { x: mouse.x, y: mouse.y };
        let pressStartTime = 0;
        let animationFrame = null;
        let scaleAnimationFrame = null;

        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };

        const handleMouseEnter = () => {
            dot.classList.add('cursor-dot-hover');
        };

        const handleMouseLeave = () => {
            dot.classList.remove('cursor-dot-hover');
        };

        const handleMouseDown = () => {
            setIsPressed(true);
            pressStartTime = Date.now();
            startScaleAnimation();
        };

        const handleMouseUp = () => {
            setIsPressed(false);
            if (scale >= 30) { // 如果放大到一定程度，切换主题
                setIsDark(!isDark);
                document.documentElement.classList.toggle('dark');
            }
            stopScaleAnimation();
        };

        const startScaleAnimation = () => {
            let startScale = scale;
            const animate = () => {
                if (!isPressed) {
                    if (scale > 1) {
                        setScale(prev => Math.max(1, prev - 0.5)); // 缓慢缩小
                        scaleAnimationFrame = requestAnimationFrame(animate);
                    }
                    return;
                }
                const elapsed = Date.now() - pressStartTime;
                const newScale = Math.min(40, startScale + (elapsed / 1000) * 5); // 5秒内放大到最大
                setScale(newScale);
                scaleAnimationFrame = requestAnimationFrame(animate);
            };
            scaleAnimationFrame = requestAnimationFrame(animate);
        };

        const stopScaleAnimation = () => {
            if (scaleAnimationFrame) {
                cancelAnimationFrame(scaleAnimationFrame);
            }
        };

        const updateDotPosition = () => {
            const damping = 0.5;
            dotPos.x += (mouse.x - dotPos.x) * damping;
            dotPos.y += (mouse.y - dotPos.y) * damping;
            dot.style.left = `${dotPos.x}px`;
            dot.style.top = `${dotPos.y}px`;
            dot.style.transform = `translate(-50%, -50%) scale(${scale})`;
            animationFrame = requestAnimationFrame(updateDotPosition);
        };

        setTimeout(() => {
            const clickableElements = document.querySelectorAll(
                'a, button, [role="button"], [onclick], [cursor="pointer"], [class*="hover"], [class*="group-hover"], [class*="cursor-pointer"]'
            );
            clickableElements.forEach((el) => {
                el.addEventListener('mouseenter', handleMouseEnter);
                el.addEventListener('mouseleave', handleMouseLeave);
                el.addEventListener('mousedown', handleMouseDown);
                el.addEventListener('mouseup', handleMouseUp);
            });

            // 添加全局鼠标事件监听
            document.addEventListener('mousedown', handleMouseDown);
            document.addEventListener('mouseup', handleMouseUp);
        }, 0);

        document.addEventListener('mousemove', handleMouseMove);
        updateDotPosition();

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
            if (scaleAnimationFrame) {
                cancelAnimationFrame(scaleAnimationFrame);
            }
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
            const clickableElements = document.querySelectorAll(
                'a, button, [role="button"], [onclick], [cursor="pointer"], [class*="hover"], [class*="group-hover"], [class*="cursor-pointer"]'
            );
            clickableElements.forEach((el) => {
                el.removeEventListener('mouseenter', handleMouseEnter);
                el.removeEventListener('mouseleave', handleMouseLeave);
                el.removeEventListener('mousedown', handleMouseDown);
                el.removeEventListener('mouseup', handleMouseUp);
            });
            document.body.removeChild(dot);
        };
    }, [router, isPressed, isDark, scale]);

    return (
        <style jsx global>{`
            .cursor-dot {
                position: fixed;
                width: 12px;
                height: 12px;
                background: white;
                border-radius: 50%;
                pointer-events: none;
                transform: translate(-50%, -50%) scale(1);
                z-index: 9999;
                transition: width 200ms ease, height 200ms ease, background-color 300ms ease;
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

            .cursor-dot-pressed {
                background: ${isDark ? 'white' : 'black'};
                mix-blend-mode: ${scale >= 30 ? 'normal' : 'difference'};
                transition: background-color 300ms ease, mix-blend-mode 300ms ease;
            }
        `}</style>
    );
};

export default CursorDot;
