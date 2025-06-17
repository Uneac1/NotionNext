import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
/**
 * 白点鼠标跟随
 * @returns 
 */
const CursorDot = () => {
    const router = useRouter();
    const [isDark, setIsDark] = useState(false);
    const [scale, setScale] = useState(1);
    const [isPressed, setIsPressed] = useState(false);

    useEffect(() => {
        // 创建小白点元素
        const dot = document.createElement('div');
        dot.classList.add('cursor-dot');
        document.body.appendChild(dot);

        // 鼠标坐标和缓动目标坐标
        let mouse = { x: -100, y: -100 }; // 初始位置在屏幕外
        let dotPos = { x: mouse.x, y: mouse.y };
        let pressStartTime = 0;
        let scaleAnimationFrame = null;

        // 监听鼠标移动
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        document.addEventListener('mousemove', handleMouseMove);

        // 监听鼠标按下和松开事件
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

        // 动画循环：延迟更新小白点位置
        const updateDotPosition = () => {
            const damping = 0.5; // 阻尼系数，值越小延迟越明显
            dotPos.x += (mouse.x - dotPos.x) * damping;
            dotPos.y += (mouse.y - dotPos.y) * damping;

            // 更新DOM
            dot.style.left = `${dotPos.x}px`;
            dot.style.top = `${dotPos.y}px`;
            dot.style.transform = `translate(-50%, -50%) scale(${scale})`;

            requestAnimationFrame(updateDotPosition);
        };

        // 启动动画
        updateDotPosition();

        // 添加全局鼠标事件监听
        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        // 清理函数
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
            if (scaleAnimationFrame) {
                cancelAnimationFrame(scaleAnimationFrame);
            }
            document.body.removeChild(dot);
        };
    }, [router, isPressed, isDark, scale]);

    return (
        <style jsx global>{`
            .cursor-dot {
                position: fixed;
                width: 12px;
                height: 12px;
                background: ${isDark ? 'black' : 'white'};
                border-radius: 50%;
                pointer-events: none;
                transform: translate(-50%, -50%) scale(1);
                z-index: 9999;
                transition: background-color 300ms ease;
                mix-blend-mode: ${scale >= 30 ? 'normal' : 'difference'};
            }

            .dark .cursor-dot {
                background: ${isDark ? 'white' : 'black'};
            }
        `}</style>
    );
};

export default CursorDot;
