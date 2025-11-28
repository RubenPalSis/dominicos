// Funcionalidad común para cabecera y footer
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    const body = document.body;
    
    if (mobileMenuBtn && navList) {
        mobileMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            navList.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
            body.classList.toggle('menu-open');
        });
    }
    
    // Cerrar menú móvil al hacer clic en un enlace
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navList.classList.contains('active')) {
                navList.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
                body.classList.remove('menu-open');
            }
        });
    });
    
    // Cerrar menú al hacer clic fuera
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.nav') && !e.target.closest('.mobile-menu-btn')) {
            navList.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            body.classList.remove('menu-open');
        }
    });
    
    // Marcar enlace activo basado en la página actual
    function setActiveNavLink() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const linkHref = link.getAttribute('href');
            if (linkHref === currentPage || 
                (currentPage === 'index.html' && linkHref === 'index.html') ||
                (currentPage === '' && linkHref === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }
    
    setActiveNavLink();
});