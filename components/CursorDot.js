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
      const pageMaxSize = Math.max(window.innerWidth, window.innerHeight);
      maxDotSize.current = pageMaxSize * 5; // 改为5倍页面尺寸

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
    <div ref={dotRef} className="cursor-dot" />
  );
};

export default CursorDot;
