import { useEffect, useRef } from 'react';

const CursorDot = () => {
  const dotRef = useRef(null);
  const mousePos = useRef({ x: -100, y: -100 });
  const isMouseDown = useRef(false);
  const isShrinking = useRef(false);
  const maxDotSize = useRef(0);

  useEffect(() => {
    const dot = dotRef.current;
    const updateDot = () => {
      const { x, y } = mousePos.current;
      const pageMaxSize = Math.min(window.innerWidth, window.innerHeight);
      maxDotSize.current = pageMaxSize * 5; // 5倍页面大小

      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;

      if (isMouseDown.current && !isShrinking.current) {
        dot.style.width = `${maxDotSize.current}px`;
        dot.style.height = `${maxDotSize.current}px`;
      } else if (!isMouseDown.current) {
        dot.style.width = '12px';
        dot.style.height = '12px';
      }

      if (dot.offsetWidth >= maxDotSize.current && !isShrinking.current) {
        isShrinking.current = true;
        dot.classList.replace('cursor-dot-hover', 'cursor-dot-shrink');
      }

      requestAnimationFrame(updateDot);
    };

    const handleMouseMove = (e) => { mousePos.current = { x: e.clientX, y: e.clientY }; };
    const handleMouseDown = () => { isMouseDown.current = true; dot.classList.add('cursor-dot-hover'); };
    const handleMouseUp = () => { isMouseDown.current = false; dot.classList.replace('cursor-dot-hover', 'cursor-dot-shrink'); };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

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
          transition: transform 100ms ease, width 2000ms ease, height 2000ms ease;
          mix-blend-mode: difference;
          left: -100px;
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
