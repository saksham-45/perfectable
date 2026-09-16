document.addEventListener('DOMContentLoaded', () => {
  const fileInput = document.getElementById('hiddenFileInput');

  document.querySelector('.cta-button').addEventListener('click', () => {
    fileInput.click();
  });

  const activityBtns = document.querySelectorAll('.activity-btn');
  activityBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      btn.style.opacity = '1';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.opacity = '0.6';
    });
  });
});