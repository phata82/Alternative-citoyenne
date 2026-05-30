document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });
  }

  // Scroll Reveal Animation
  const reveals = document.querySelectorAll('.reveal');

  const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const elementVisible = 150;

    reveals.forEach((reveal) => {
      const elementTop = reveal.getBoundingClientRect().top;
      if (elementTop < windowHeight - elementVisible) {
        reveal.classList.add('active');
      }
    });
  };

  window.addEventListener('scroll', revealOnScroll);
  // Trigger once on load
  revealOnScroll();

  // Highlight Active Link
  const currentLocation = location.pathname.split('/').pop();
  const navItems = document.querySelectorAll('.nav-links a');
  
  navItems.forEach(item => {
    const itemHref = item.getAttribute('href');
    if (itemHref === currentLocation || (currentLocation === '' && itemHref === 'index.html')) {
      item.classList.add('active');
    }
  });

  // Header Scroll Effect
  const header = document.querySelector('header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      header.style.padding = '0';
    } else {
      header.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
    }
  });
});
