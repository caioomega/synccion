document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    // Funcionalidade de Exibir/Ocultar Senha
    togglePasswordBtn.addEventListener('click', () => {
        const isPassword = passwordInput.getAttribute('type') === 'password';
        passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
        togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
    });

    // Pré-validação simples via JavaScript no envio do formulário
    loginForm.addEventListener('submit', (e) => {
        let valid = true;
        const emailInput = document.getElementById('email');
        const emailValue = emailInput.value.trim();
        const passwordValue = passwordInput.value.trim();

        // Reseta estados
        resetErrors();

        // Validação básica do email
        if (!emailValue || !validateEmail(emailValue)) {
            showError(emailInput, 'Por favor, insira um e-mail válido.');
            valid = false;
        }

        // Validação da senha
        if (!passwordValue) {
            showError(passwordInput, 'A senha é obrigatória.');
            valid = false;
        }

        // Se houver algum erro no Front, evita o submit do PHP
        if (!valid) {
            e.preventDefault();
        }
    });

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function showError(inputElement, message) {
        const inputGroup = inputElement.closest('.input-group');
        const errorMsg = inputGroup.querySelector('.error-msg');
        inputElement.style.borderColor = '#dc2626';
        if (errorMsg) {
            errorMsg.textContent = message;
            errorMsg.style.display = 'block';
        }
    }

    function resetErrors() {
        const inputs = document.querySelectorAll('.input-group input');
        const errorMsgs = document.querySelectorAll('.error-msg');
        
        inputs.forEach(input => input.style.borderColor = '#cbd5e1');
        errorMsgs.forEach(msg => {
            msg.style.display = 'none';
            msg.textContent = '';
        });
    }
});