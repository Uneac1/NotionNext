import { useEffect, useRef } from 'react';

const CursorDot = () => {
  const dotRef = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const isMouseDown = useRef(false);
  const maxDotSize = useRef(0); // 用于存储最大圆点尺寸

  useEffect(() => {
    const dot = dotRef.current;

    // 更新圆点位置并处理大小和动画
    const updateDot = () => {
      const { x, y } = mousePos.current;
      const pageMaxSize = Math.max(window.innerWidth, window.innerHeight); // 页面最大尺寸
      maxDotSize.current = pageMaxSize * 5; // 设置最大圆点尺寸为页面大小的5倍

      // 根据鼠标位置更新圆点位置
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;

      // 如果按下鼠标，放大圆点，否则恢复原始尺寸
      if (isMouseDown.current) {
        // 按下鼠标时，圆点放大到最大尺寸
        dot.style.width = `${maxDotSize.current}px`;
        dot.style.height = `${maxDotSize.current}px`;
      } else {
        // 松开鼠标时，恢复圆点原始尺寸
        dot.style.width = '12px';
        dot.style.height = '12px';
      }

      requestAnimationFrame(updateDot); // 不断更新圆点位置和尺寸
    };

    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY }; // 记录鼠标位置
    };

    const handleMouseDown = () => {
      isMouseDown.current = true; // 设置鼠标按下状态
    };

    const handleMouseUp = () => {
      isMouseDown.current = false; // 设置鼠标松开状态
    };

    // 绑定事件监听
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // 启动更新循环
    updateDot();

    // 清理事件监听
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
          transition: width 0.2s ease, height 0.2s ease; /* 平滑过渡 */
          mix-blend-mode: difference;
          left: -100px;
          top: -100px;
        }
      `}</style>
    </>
  );
};

export default CursorDot;
