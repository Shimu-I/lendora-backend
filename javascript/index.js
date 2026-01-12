// 1. Force page to start at the top (ignores #about in URL)
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.addEventListener('load', () => {
    window.scrollTo(0, 0);
  });

  // 2. Enable smooth scrolling ONLY after the user clicks anywhere
  const enableSmoothScroll = () => {
    document.documentElement.classList.add('scroll-smooth');
    // Remove listeners so it doesn't run again
    document.removeEventListener('click', enableSmoothScroll);
    document.removeEventListener('keydown', enableSmoothScroll);
    document.removeEventListener('touchstart', enableSmoothScroll);
  };

  document.addEventListener('click', enableSmoothScroll);
  document.addEventListener('keydown', enableSmoothScroll);
  document.addEventListener('touchstart', enableSmoothScroll); // for mobile