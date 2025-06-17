import { useEffect, useRef } from 'react';

const CursorDot = () => {
  const dotRef = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const isMouseDown = useRef(false);
  const isShrinking = useRef(false);
  const damping = useRef(0.2); // 可调节的平滑度参数

  // 设置圆点尺寸变化的最大值
  const maxDotSize = useRef(0);
  const modeChanged = useRef(false); // 用于检测是否已经切换模式

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
        isShrinking.current = false;
        dot.classList.add('cursor-dot-hover');
        dot.classList.remove('cursor-dot-shrink');
      }
    };

    // 鼠标松开，恢复圆点初始状态
    const handleMouseUp = () => {
      if (isMouseDown.current) {
        isMouseDown.current = false;
        dot.classList.remove('cursor-dot-hover');
        dot.classList.add('cursor-dot-shrink');
        isShrinking.current = true;
      }
    };

    // 切换模式（例如鼠标进入不同元素时）
    const handleModeChange = () => {
      if (!isMouseDown.current) {
        dot.classList.remove('cursor-dot-hover');
        dot.classList.add('cursor-dot-shrink');
        isShrinking.current = true;
        modeChanged.current = true; // 标记模式已切换
      }
    };

    // 添加事件监听
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseenter', handleModeChange); // 模式切换时触发

    // 动画循环更新圆点的位置
    const updateDot = () => {
      if (!dot) return;

      // 平滑移动 - 根据 damping 调整
      const currentLeft = dot.offsetLeft || 0;
      const currentTop = dot.offsetTop || 0;

      const nextLeft = currentLeft + (mousePos.current.x - currentLeft) * damping.current;
      const nextTop = currentTop + (mousePos.current.y - currentTop) * damping.current;

      dot.style.left = `${nextLeft}px`;
      dot.style.top = `${nextTop}px`;

      // 获取页面最大尺寸
      const pageMaxSize = Math.max(window.innerWidth, window.innerHeight);
      maxDotSize.current = pageMaxSize * 2; // 设置最大放大尺寸为2倍页面大小

      // 放大至2倍页面大小
      if (isMouseDown.current && !isShrinking.current) {
        dot.style.width = `${maxDotSize.current}px`;
        dot.style.height = `${maxDotSize.current}px`;
      }

      // 判断是否触发收缩动画
      const dotSize = Math.max(dot.offsetWidth, dot.offsetHeight);
      if (dotSize >= maxDotSize.current && !isShrinking.current) {
        isShrinking.current = true;
        dot.classList.add('cursor-dot-shrink');
        dot.classList.remove('cursor-dot-hover');
      }

      // 如果圆点达到2倍页面大小，切换模式
      if (dotSize >= maxDotSize.current && !modeChanged.current) {
        handleModeChange(); // 自动切换模式
      }

      // 请求动画帧，确保平滑过渡
      requestAnimationFrame(updateDot);
    };

    updateDot();

    // 清理事件监听
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseenter', handleModeChange);
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
