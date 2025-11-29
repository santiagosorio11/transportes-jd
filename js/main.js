// Routes Data - From Montería
const routes = [
    {
        id: 1,
        name: "Montería - Cartagena",
        time: "2.5 horas",
        distance: "180 km",
        center: [9.5700, -75.6800], // Between Montería and Cartagena
        zoom: 8,
        points: [
            [8.7500, -75.8814], // Montería
            [10.3910, -75.4794]  // Cartagena
        ]
    },
    {
        id: 2,
        name: "Montería - Barranquilla",
        time: "2 horas",
        distance: "140 km",
        center: [9.5700, -75.3300], // Between Montería and Barranquilla
        zoom: 8,
        points: [
            [8.7500, -75.8814], // Montería
            [10.9685, -74.7813]  // Barranquilla
        ]
    },
    {
        id: 3,
        name: "Montería - Sincelejo",
        time: "1 hora",
        distance: "85 km",
        center: [9.2500, -75.4300], // Between Montería and Sincelejo
        zoom: 9,
        points: [
            [8.7500, -75.8814], // Montería
            [9.3000, -75.4000]  // Sincelejo
        ]
    },
    {
        id: 4,
        name: "Montería - Medellín",
        time: "6 - 7 horas",
        distance: "400 km",
        center: [7.5000, -75.7000], // Between Montería and Medellín
        zoom: 7,
        points: [
            [8.7500, -75.8814], // Montería
            [6.2476, -75.5658]  // Medellín
        ]
    },
    {
        id: 5,
        name: "Montería - Lorica",
        time: "45 min",
        distance: "35 km",
        center: [9.0500, -75.8300], // Between Montería and Lorica
        zoom: 10,
        points: [
            [8.7500, -75.8814], // Montería
            [9.2333, -75.8167]  // Lorica
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Map
    // Default view: Montería area
    // Fix: Disable scrollWheelZoom to prevent page scroll blocking
    const map = L.map('map', {
        scrollWheelZoom: false
    }).setView([8.7500, -75.8814], 9);

    // Enable scroll wheel zoom only after clicking on the map
    map.on('focus', () => { map.scrollWheelZoom.enable(); });
    map.on('blur', () => { map.scrollWheelZoom.disable(); });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Custom Icon
    const carIcon = L.icon({
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34]
    });

    let currentPolyline = null;
    let currentMarkers = [];
    let animatedSegments = [];

    // 2. Populate Dropdown
    const select = document.getElementById('routeSelect');
    routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = route.name;
        select.appendChild(option);
    });

    // 3. Handle Route Selection
    const routeInfo = document.getElementById('routeInfo');
    const routeName = document.getElementById('routeName');
    const routeTime = document.getElementById('routeTime');
    const routeDistance = document.getElementById('routeDistance');

    select.addEventListener('change', (e) => {
        const routeId = parseInt(e.target.value);
        const route = routes.find(r => r.id === routeId);

        // Clear previous map elements
        if (currentPolyline && map.hasLayer(currentPolyline)) {
            map.removeLayer(currentPolyline);
            currentPolyline = null;
        }
        currentMarkers.forEach(marker => {
            if (map.hasLayer(marker)) {
                map.removeLayer(marker);
            }
        });
        animatedSegments.forEach(seg => {
            if (map.hasLayer(seg)) {
                map.removeLayer(seg);
            }
        });
        currentMarkers = [];
        animatedSegments = [];

        if (route) {
            // Show Info Card
            routeInfo.classList.remove('hidden');
            routeName.textContent = route.name;
            routeTime.textContent = route.time;
            routeDistance.textContent = route.distance;

            // Update Map View - First complete zoom, then draw line
            const tempPolyline = L.polyline(route.points);
            const bounds = tempPolyline.getBounds();
            
            // Fit bounds first to center and zoom to route
            map.fitBounds(bounds, { 
                padding: [50, 50],
                maxZoom: route.zoom
            });
            
            // Wait for zoom animation to complete before drawing line
            // Use moveend event which fires after zoom and pan complete
            const drawRouteAfterZoom = () => {
                map.off('moveend', drawRouteAfterZoom);
                
                // Small delay to ensure map is completely settled
                setTimeout(() => {
                    // Start drawing animated route after zoom is complete
                    let segmentIndex = 0;

                    function animateRouteSegment() {
                        if (segmentIndex < route.points.length - 1) {
                            const startPoint = route.points[segmentIndex];
                            const endPoint = route.points[segmentIndex + 1];
                            
                            // Create segment polyline with dashed style
                            const segment = L.polyline([startPoint, endPoint], {
                                color: '#1e40af',
                                weight: 5,
                                opacity: 0.8,
                                lineCap: 'round',
                                lineJoin: 'round',
                                dashArray: '15, 10'
                            }).addTo(map);
                            
                            animatedSegments.push(segment);
                            segmentIndex++;
                            
                            // Continue animation
                            setTimeout(animateRouteSegment, 150);
                        } else {
                            // All segments drawn, create final complete dashed polyline
                            setTimeout(() => {
                                // Remove individual segments
                                animatedSegments.forEach(seg => {
                                    if (map.hasLayer(seg)) {
                                        map.removeLayer(seg);
                                    }
                                });
                                animatedSegments = [];
                                
                                // Add final complete dashed polyline
                                currentPolyline = L.polyline(route.points, {
                                    color: '#1e40af',
                                    weight: 5,
                                    opacity: 0.8,
                                    lineCap: 'round',
                                    lineJoin: 'round',
                                    dashArray: '15, 10'
                                }).addTo(map);
                            }, 250);
                        }
                    }

                    // Start route animation
                    animateRouteSegment();
                }, 400);
            };
            
            // Listen for move end (fires after zoom and pan complete)
            map.once('moveend', drawRouteAfterZoom);

            // Add Markers (Start and End)
            const startMarker = L.marker(route.points[0], { icon: carIcon }).addTo(map)
                .bindPopup(`<b>Inicio:</b> ${route.name.split(' - ')[0]}`);

            const endMarker = L.marker(route.points[route.points.length - 1], { icon: carIcon }).addTo(map)
                .bindPopup(`<b>Destino:</b> ${route.name.split(' - ')[1] || 'Fin'}`);

            currentMarkers.push(startMarker, endMarker);

            // Add waypoint markers if there are more than 2 points
            if (route.points.length > 2) {
                for (let i = 1; i < route.points.length - 1; i++) {
                    const waypointMarker = L.marker(route.points[i], { icon: carIcon }).addTo(map)
                        .bindPopup(`<b>Punto Intermedio ${i}</b>`);
                    currentMarkers.push(waypointMarker);
                }
            }

            // Open popup of end marker after animation completes
            setTimeout(() => endMarker.openPopup(), (route.points.length * drawSpeed) + 1000);

        } else {
            routeInfo.classList.add('hidden');
            map.flyTo([8.7500, -75.8814], 9); // Reset to default view (Montería)
        }
    });

    // 4. Mobile Menu Toggle
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');

    function toggleMenu() {
        const isActive = navLinks.classList.contains('active');
        navLinks.classList.toggle('active');
        menuBtn.innerHTML = !isActive
            ? '<i data-lucide="x"></i>'
            : '<i data-lucide="menu"></i>';
        lucide.createIcons();
        
        // Prevent body scroll when menu is open
        if (!isActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        menuBtn.innerHTML = '<i data-lucide="menu"></i>';
        lucide.createIcons();
        document.body.style.overflow = '';
    }

    menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            closeMenu();
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navLinks.classList.contains('active')) {
            if (!navLinks.contains(e.target) && !menuBtn.contains(e.target)) {
                closeMenu();
            }
        }
    });

    // Close menu on window resize if menu is open and screen is larger
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            closeMenu();
        }
    });

    // 5. Smooth Scroll for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });

    // 6. Scroll Reveal Animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
});
