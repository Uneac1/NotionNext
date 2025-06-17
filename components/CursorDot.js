import { useEffect, useState } from 'react';

const CursorDot = () => {
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [isShrinking, setIsShrinking] = useState(false);

  useEffect(() => {
    const dot = document.createElement('div');
    dot.classList.add('cursor-dot');
    document.body.appendChild(dot);

    let mouse = { x: -100, y: -100 };
    let dotPos = { x: mouse.x, y: mouse.y };
    let isMouseDown = false;

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const handleMouseDown = () => {
      isMouseDown = true;
      dot.classList.add('cursor-dot-hover'); // 放大白点（全屏状态触发前的视觉效果）
    };
    const handleMouseUp = () => {
      isMouseDown = false;
      dot.classList.remove('cursor-dot-hover');
    };

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

      // 当鼠标按下且点尺寸覆盖屏幕，进入全屏模式
      if (isMouseDown && dotSize >= pageSize && !isFullscreenMode) {
        setIsFullscreenMode(true);
      }

      // 如果处于全屏模式且还没开始收缩，启动收缩动画
      if (isFullscreenMode && !isShrinking) {
        setIsShrinking(true);
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
  }, [isFullscreenMode, isShrinking]);

  // 全屏模式时更新样式
  useEffect(() => {
    if (isFullscreenMode) {
      const dot = document.querySelector('.cursor-dot');
      if (!dot) return;
      dot.classList.remove('cursor-dot-hover');
      dot.classList.add('cursor-dot-fullscreen');
      dot.style.backgroundColor = document.body.classList.contains('dark') ? 'black' : 'white';
    }
  }, [isFullscreenMode]);

  // 收缩动画启动后执行恢复初始状态
  useEffect(() => {
    if (isShrinking) {
      const dot = document.querySelector('.cursor-dot');
      if (!dot) return;

      // 设置收缩动画样式
      dot.style.transition = 'width 2000ms, height 2000ms, border 2000ms';
      dot.style.width = '12px';
      dot.style.height = '12px';
      dot.style.backgroundColor = document.body.classList.contains('dark') ? 'black' : 'white';

      // 收缩结束后重置状态
      const timer = setTimeout(() => {
        setIsFullscreenMode(false);
        setIsShrinking(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isShrinking]);

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
        transition: transform 100ms, width 2000ms, height 2000ms, border 2000ms;
        mix-blend-mode: difference;
      }
      .cursor-dot-hover {
        border: 1px solid rgba(167, 167, 167, 0.14);
        width: 9999px;
        height: 9999px;
        background: hsla(0, 0%, 100%, 0.04);
        backdrop-filter: blur(2px);
        filter: invert(1);
      }
      .cursor-dot-fullscreen {
        width: 30px;
        height: 30px;
        background: rgba(0, 0, 0, 0.8);
      }
    `}</style>
  );
};

export default CursorDot;
