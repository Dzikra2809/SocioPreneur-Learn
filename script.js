// Main JavaScript file
document.addEventListener('DOMContentLoaded', function() {
    console.log('Document ready!');
}); 


const stats = document.querySelectorAll('.stat');
    const counters = document.querySelectorAll('.stat__number');

    // fungsi animasi angka
    function animateCounter(el, target) {
      const duration = 2000;
      const interval = 10;
      let current = 0;
      const step = target / (duration / interval);

      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = target >= 1000
          ? Math.floor(current).toLocaleString() + "+"
          : Math.floor(current) + "+";
      }, interval);
    }

    // tampilkan animasi fade + counter
    window.addEventListener('load', () => {
      stats.forEach(stat => {
        stat.classList.add('show');
      });

      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        animateCounter(counter, target);
      });
    });