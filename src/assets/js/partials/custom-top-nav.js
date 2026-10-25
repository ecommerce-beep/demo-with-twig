document.addEventListener('DOMContentLoaded', () => {
  const countdownEl = document.getElementById('countdown');
  if (!countdownEl) return;

  const targetDateStr = countdownEl.getAttribute('data-countdown-target');
  if (!targetDateStr) return;

  const targetDate = new Date(targetDateStr);

  function updateCountdown() {
    const now = new Date();
    let diff = targetDate - now;

    if (diff <= 0) {
      // expired
      document.getElementById('cd-days').textContent = '0';
      document.getElementById('cd-hours').textContent = '0';
      document.getElementById('cd-minutes').textContent = '0';
      document.getElementById('cd-seconds').textContent = '0';
      countdownEl.style.display = 'none';
      clearInterval(timer);
      return;
    }



    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    document.getElementById('cd-days').textContent = days;
    document.getElementById('cd-hours').textContent = hours;
    document.getElementById('cd-minutes').textContent = minutes;
    document.getElementById('cd-seconds').textContent = seconds;
  }

  updateCountdown();
  const timer = setInterval(updateCountdown, 1000);
});