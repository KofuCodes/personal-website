import React, { useCallback, useState } from 'react';

/**
 * An <img> that fades in once it has decoded instead of painting in line by
 * line, so its placeholder (whatever background sits behind it) gives way
 * softly. Already-cached images show straight away.
 */
const FadeImg: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = ({ className = '', onLoad, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const ref = useCallback((img: HTMLImageElement | null) => {
    if (img?.complete && img.naturalWidth) setLoaded(true);
  }, []);

  return (
    <img
      ref={ref}
      decoding="async"
      {...props}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      className={`${className} transition-opacity duration-500 ease-out ${loaded ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};

export default FadeImg;
