   // Page fade-in animation
        window.addEventListener('load', function() {
            document.body.classList.add('fade-in');
        });

        // Sidebar navigation
        const sidebarItems = document.querySelectorAll('.sidebar-item');
        sidebarItems.forEach(item => {
            item.addEventListener('click', function() {
                sidebarItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
            });
        });