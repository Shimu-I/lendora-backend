   document.addEventListener("DOMContentLoaded", function () {
      const items = document.querySelectorAll(".timeline-item");

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.style.opacity = "1";
              entry.target.style.transform = "translateY(0)";
            }
          });
        },
        { threshold: 0.3 }
      );

      items.forEach((item, index) => {
        item.style.transition = `all 0.6s ease ${index * 0.2}s`;
        observer.observe(item);
      });
    });