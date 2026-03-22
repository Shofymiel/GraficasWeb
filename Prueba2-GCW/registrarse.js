// ==================== 1. VARIABLES GLOBALES ====================
const container = document.getElementById('container');
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');

// ==================== 2. ANIMACIONES DEL OVERLAY ====================
// Estos son los botones del panel azul que mueven la ventana
if (signUpButton && signInButton && container) {
    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });
}

// ==================== 3. REGISTRO DE USUARIOS ====================
const formRegistro = document.getElementById('form-registro');

if (formRegistro) {
    formRegistro.addEventListener('submit', function(e) {
        e.preventDefault(); // ¡Crucial! Evita que la página se recargue

        // Obtener los datos de los inputs
        const username = document.querySelector('.sign-up-container input[type="text"]').value.trim();
        const email = document.querySelector('.sign-up-container input[type="email"]').value.trim();
        const password = document.querySelector('.sign-up-container input[type="password"]').value.trim();

        // Validar si existe en localStorage
        let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const usuarioExistente = usuarios.find(u => u.email === email || u.username === username);
        
        if (usuarioExistente) {
            alert('❌ El usuario o correo ya existe. Por favor usa otro.');
        } else {
            // Crear nuevo usuario
            const nuevoUsuario = {
                id: Date.now(),
                username: username,
                email: email,
                password: password,
                stats: { races: 0, wins: 0, podiums: 0, bestPosition: 0, totalLaps: 0, distance: 0, crashes: 0 },
                unlockedCars: ['FERRARI 458'],
                records: {}
            };
            
            // Guardar
            usuarios.push(nuevoUsuario);
            localStorage.setItem('usuarios', JSON.stringify(usuarios));
            
            alert('✅ ¡Cuenta creada exitosamente! Ahora inicia sesión.');
            
            // 1. Limpiar el formulario
            formRegistro.reset(); 
            
            // 2. Mover el panel azul de regreso a "Inicio de sesión"
            container.classList.remove("right-panel-active");
            
            // 3. Auto-llenar el email para mayor comodidad
            const loginEmailInput = document.querySelector('.sign-in-container input[type="email"]');
            if(loginEmailInput) loginEmailInput.value = email;
        }
    });
}

// ==================== 4. INICIO DE SESIÓN ====================
const formLogin = document.getElementById('form-login');

if (formLogin) {
    formLogin.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = document.querySelector('.sign-in-container input[type="email"]').value.trim();
        const password = document.querySelector('.sign-in-container input[type="password"]').value.trim();

        const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
        const usuario = usuarios.find(u => u.email === email && u.password === password);
        
        if (usuario) {
            // Guardar sesión activa
            localStorage.setItem('usuario_actual', JSON.stringify({
                id: usuario.id,
                username: usuario.username,
                email: usuario.email,
                stats: usuario.stats,
                unlockedCars: usuario.unlockedCars
            }));
            
            alert(`✅ ¡Bienvenido a Revolut Racing, ${usuario.username}!`);
            window.location.href = 'MenuPrincipal.html';
        } else {
            const usuarioExiste = usuarios.find(u => u.email === email);
            if (usuarioExiste) {
                alert('❌ Contraseña incorrecta. Intenta de nuevo.');
            } else {
                alert('❌ Usuario no encontrado. Por favor regístrate.');
            }
        }
    });
}