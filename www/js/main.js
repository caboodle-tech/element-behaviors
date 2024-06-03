document.addEventListener('DOMContentLoaded', () => {

    const getOSColorMode = () => {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    };

    const setActiveMenuItem = () => {
        const menuItems = document.querySelectorAll('aside ul li a');
        
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            
            // Find the section closest to the scroll position
            let closestSection = null;
            let closestDistance = Infinity;
            
            menuItems.forEach((menuItem) => {
                const sectionId = menuItem.getAttribute('href').substring(1);
                const section = document.getElementById(sectionId);
                
                const distance = Math.abs(section.offsetTop - scrollPosition);
                
                if (distance < closestDistance) {
                    closestSection = section;
                    closestDistance = distance;
                }
            });
            
            // Add a class to the closest section's menu item
            if (closestSection) {
                menuItems.forEach((menuItem) => {
                    menuItem.parentElement.classList.remove('active');
                });

                const closestMenuItem = document.querySelector(`aside ul li a[href="#${closestSection.id}"]`);
                closestMenuItem.parentElement.classList.add('active');
            }
        };
        
        const throttledHandleScroll = throttle(handleScroll, 100);
        document.addEventListener('scroll', throttledHandleScroll);
    };

    const setMobileButton = () => {
        const mobileSidebarButton = document.getElementById('open-sidebar-button');
        const aside = document.querySelector('#container aside');

        mobileSidebarButton.addEventListener('click', () => {
            mobileSidebarButton.classList.toggle('open');
            aside.classList.toggle('open');
        });
    };

    const setMobileMode = () => {
        const container = document.getElementById('container');
        const mobileSidebarButton = document.getElementById('open-sidebar-button');
        const aside = document.querySelector('#container aside');

        const handleResize = () => {
            if (window.innerWidth <= 990) {
                container.classList.add('mobile');
            } else {
                container.classList.remove('mobile');
                mobileSidebarButton.classList.remove('open');
                aside.classList.remove('open');
            }
        };
        // Call once to set the initial state.
        handleResize();

        const throttledHandleResize = throttle(handleResize, 100);
        window.addEventListener('resize', throttledHandleResize);
    }

    const setupSidebarScroll = () => {
        const toc = document.getElementById('table-of-contents');
        const container = document.getElementById('container');
        const originalMarginTop = parseFloat(window.getComputedStyle(toc).marginTop);
        let containerHeight = container.clientHeight;

        const updateSidebar = () => {
            if (container.classList.contains('mobile')) {
                toc.style.marginTop = `${originalMarginTop}px`;
                return;
            }

            const scrollPosition = window.scrollY;

            if (scrollPosition > (originalMarginTop / 2)) {
                let newMargin = scrollPosition + originalMarginTop;
                if (newMargin + 450 > containerHeight) {
                    newMargin = containerHeight - 450;
                }
                toc.style.marginTop = `${Math.floor(newMargin)}px`;
            } else {
                toc.style.marginTop = `${originalMarginTop}px`;
            }
        };

        const throttledUpdateSidebar = throttle(updateSidebar, 10);
        document.addEventListener('scroll', throttledUpdateSidebar);

        let resizeTimeout;
        const handleResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                document.removeEventListener('scroll', throttledUpdateSidebar);
                containerHeight = container.clientHeight;
                document.addEventListener('scroll', throttledUpdateSidebar);
            }, 200);
        };

        window.addEventListener('resize', handleResize);
    };

    const setupThemeButtons = () => {
        const themeOptions = document.getElementById('theme-options');

        const themeSelector = document.getElementById('theme-selector-button');
        themeSelector.addEventListener('click', () => {
            themeOptions.classList.toggle('open');
        });

        const defaultButton = document.getElementById('default-theme-button');
        defaultButton.addEventListener('click', () => {
            localStorage.removeItem('theme');
            themeOptions.classList.remove('open');
            setWebsiteColorMode();
        });

        const lightButton = document.getElementById('light-theme-button');
        lightButton.addEventListener('click', () => {
            localStorage.setItem('theme', 'light');
            themeOptions.classList.remove('open');
            setWebsiteColorMode();
        });

        const darkButton = document.getElementById('dark-theme-button');
        darkButton.addEventListener('click', () => {
            localStorage.setItem('theme', 'dark');
            themeOptions.classList.remove('open');
            setWebsiteColorMode();
        });
    };

    const setWebsiteColorMode = () => {
        const savedTheme = localStorage.getItem('theme');
        const theme = savedTheme ? savedTheme : `${getOSColorMode()} default`;
        document.body.setAttribute('class', theme);
    };

    const throttle = (func, limit) => {
        let lastFunc;
        let lastRan;
        return (...args) => {
            const context = this;
            if (!lastRan) {
                func.apply(context, args);
                lastRan = Date.now();
            } else {
                clearTimeout(lastFunc);
                lastFunc = setTimeout(() => {
                    if ((Date.now() - lastRan) >= limit) {
                        func.apply(context, args);
                        lastRan = Date.now();
                    }
                }, limit - (Date.now() - lastRan));
            }
        };
    };
    
    setWebsiteColorMode();
    setMobileMode();
    setMobileButton();
    setActiveMenuItem();
    setupSidebarScroll();
    setupThemeButtons();
});
