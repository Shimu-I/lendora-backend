// SIGN UP
document.querySelector('.auth-form form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const full_name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    const res = await fetch('https://yourdomain.com/api/auth/signup.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name, email, password })
    });

    const data = await res.json();
    
    if (data.success) {
        alert('Account created! Please wait for admin verification.');
        window.location.href = 'login.html';
    } else {
        alert(data.error);
    }
});