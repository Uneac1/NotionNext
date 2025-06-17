import { useRouter } from 'next/router';
import { useEffect } from 'react';

/**
 * 白点鼠标跟随
 * @returns 
 */
const CursorDot = () => {
    const router = useRouter();
    useEffect(() => {
        // 创建小白点元素
        const dot = document.createElement('div');
        dot.classList.add('cursor-dot');
        document.body.appendChild(dot);

        // 鼠标坐标和缓动目标坐标
        let mouse = { x: -100, y: -100 }; // 初始位置在屏幕外
        let dotPos = { x: mouse.x, y: mouse.y };
        let isMouseDown = false; // 记录鼠标按下状态

        // 监听鼠标移动
        const handleMouseMove = (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        document.addEventListener('mousemove', handleMouseMove);

        // 监听鼠标按下和松开事件
        const handleMouseDown = () => {
            isMouseDown = true;
            dot.classList.add('cursor-dot-hover'); // 鼠标按下时放大
        };
        const handleMouseUp = () => {
            isMouseDown = false;
            dot.classList.remove('cursor-dot-hover'); // 鼠标松开时恢复
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        // 动画循环：延迟更新小白点位置
        const updateDotPosition = () => {
            const damping = 0.5; // 阻尼系数，值越小延迟越明显
            dotPos.x += (mouse.x - dotPos.x) * damping;
            dotPos.y += (mouse.y - dotPos.y) * damping;

            // 更新DOM
            dot.style.left = `${dotPos.x}px`;
            dot.style.top = `${dotPos.y}px`;

            // 判断是否放大到覆盖整个页面
            if (isMouseDown) {
                const pageWidth = window.innerWidth;
                const pageHeight = window.innerHeight;
                const dotSize = Math.max(dot.offsetWidth, dot.offsetHeight);
                if (dotSize >= Math.max(pageWidth, pageHeight)) {
                    // 如果小白点的大小大于或等于屏幕大小，切换模式
                    document.body.classList.add('cursor-mode-fullscreen');
                } else {
                    document.body.classList.remove('cursor-mode-fullscreen');
                }
            }

            requestAnimationFrame(updateDotPosition);
        };

        // 启动动画
        updateDotPosition();

        // 清理函数
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
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
                transition: transform 100ms ease-out, width 2000ms ease, height 2000ms ease, border 2000ms ease; /* 添加尺寸和边框平滑过渡 */
                mix-blend-mode: difference; /* 可选：增强对比度 */
            }

            .cursor-dot-hover {
                border: 1px solid rgba(167, 167, 167, 0.14); /* 鼠标悬停时的深灰色边框，厚度为1px */
                width: 900px; /* 放大 */
                height: 900px; /* 放大 */
                background: hsla(0, 0%, 100%, 0.04); /* 半透明背景 */
                -webkit-backdrop-filter: blur(2px); /* 毛玻璃效果 */
                backdrop-filter: blur(2px);
                filter: invert(1); /* 反转颜色 */
            }

            .dark .cursor-dot-hover {
                border: 1px solid rgba(66, 66, 66, 0.66); /* 鼠标悬停时的深灰色边框，厚度为1px */
                filter: invert(1); /* 在黑暗模式下保持颜色反转 */
            }

            .cursor-mode-fullscreen {
                /* 当小白点覆盖整个页面时，执行切换模式的操作 */
                transition: background-color 0.3s ease;
                background-color: rgba(0, 0, 0, 0.7); /* 示例：背景颜色变暗 */
            }
        `}</style>
    );
};

export default CursorDot;
