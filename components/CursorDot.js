import { useEffect, useRef } from 'react';

const CursorDot = () => {
  const dotRef = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const isMouseDown = useRef(false);
  const isShrinking = useRef(false);
  const damping = useRef(0.2);  // 可调节的平滑度参数

  useEffect(() => {
    const dot = dotRef.current;
    if (!dot) return;

    // 鼠标移动更新位置
    const handleMouseMove = (e) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    // 鼠标按下，放大圆点
    const handleMouseDown = () => {
      if (!isMouseDown.current) {
        isMouseDown.current = true;
        isShrinking.current = false;  // 重置收缩状态，允许重复触发
        dot.classList.add('cursor-dot-hover');
        dot.classList.remove('cursor-dot-shrink');
      }
    };

    // 鼠标松开，恢复圆点初始状态
    const handleMouseUp = () => {
      if (isMouseDown.current) {
        isMouseDown.current = false;
        dot.classList.remove('cursor-dot-hover');
        dot.classList.remove('cursor-dot-shrink');
        isShrinking.current = false;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // 更新圆点位置及动画状态
    const updateDot = () => {
      if (!dot) return;

      // 平滑移动 - 根据 damping 调整
      const currentLeft = dot.offsetLeft || 0;
      const currentTop = dot.offsetTop || 0;

      const nextLeft = currentLeft + (mousePos.current.x - currentLeft) * damping.current;
      const nextTop = currentTop + (mousePos.current.y - currentTop) * damping.current;

      dot.style.left = `${nextLeft}px`;
      dot.style.top = `${nextTop}px`;

      // 判断是否需要触发收缩动画
      const pageMaxSize = Math.max(window.innerWidth, window.innerHeight);
      const dotSize = Math.max(dot.offsetWidth, dot.offsetHeight);

      if (isMouseDown.current && dot.classList.contains('cursor-dot-hover')) {
        if (dotSize >= pageMaxSize && !isShrinking.current) {
          isShrinking.current = true;
          dot.classList.add('cursor-dot-shrink');
          dot.classList.remove('cursor-dot-hover');
        }
      }

      requestAnimationFrame(updateDot);
    };

    updateDot();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="cursor-dot" />
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
          transition:
            transform 100ms ease,
            width 2000ms ease,
            height 2000ms ease,
            border 2000ms ease,
            background-color 1500ms ease;
          mix-blend-mode: difference;
          left: -100px; /* 初始隐藏 */
          top: -100px;
        }

        .cursor-dot-hover {
          width: 100vw !important;
          height: 100vh !important;
          background: hsla(0, 0%, 100%, 0.04) !important;
          backdrop-filter: blur(2px) !important;
          filter: invert(1) !important;
          border: 1px solid rgba(167, 167, 167, 0.14) !important;
        }

        .cursor-dot-shrink {
          width: 12px !important;
          height: 12px !important;
          background-color: white !important;
          border: none !important;
        }
      `}</style>
    </>
  );
};

export default CursorDot;
