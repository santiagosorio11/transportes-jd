// Routes Data - Focused on Colombia and the Coast
const routes = [
    {
        id: 1,
        name: "Cartagena - Barranquilla",
        time: "2 horas",
        distance: "120 km",
        center: [10.680, -75.170], // Between both cities
        zoom: 9,
        points: [
            [10.3910, -75.4794], // Cartagena
            [10.9685, -74.7813]  // Barranquilla
        ]
    },
    {
        id: 2,
        name: "Cartagena - Santa Marta",
        time: "4 horas",
        distance: "226 km",
        center: [10.800, -74.800],
        zoom: 8,
        points: [
            [10.3910, -75.4794], // Cartagena
            [10.9685, -74.7813], // Barranquilla (Way point)
            [11.2408, -74.1990]  // Santa Marta
        ]
    },
    {
        id: 3,
        name: "Barranquilla - Santa Marta",
        time: "2 horas",
        distance: "105 km",
        center: [11.100, -74.500],
        zoom: 9,
        points: [
            [10.9685, -74.7813], // Barranquilla
            [11.2408, -74.1990]  // Santa Marta
        ]
    },
    {
        id: 4,
        name: "Tour Tayrona (Desde Santa Marta)",
        time: "45 min",
        distance: "15 km",
        center: [11.280, -74.150],
        zoom: 11,
        points: [
            [11.2408, -74.1990], // Santa Marta
            [11.3156, -74.0717]  // Tayrona
        ]
    },
    {
        id: 5,
        name: "Medellín - Costa Atlántica",
        time: "12 - 14 horas",
        distance: "700 km",
        center: [8.500, -75.000],
        zoom: 6,
        points: [
            [6.2476, -75.5658], // Medellin
            [10.3910, -75.4794] // Cartagena
        ]
    }
];

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Map
    // Default view: Colombian Coast
    // Fix: Disable scrollWheelZoom to prevent page scroll blocking
    const map = L.map('map', {
        scrollWheelZoom: false
    }).setView([10.800, -74.800], 8);

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
            map.flyTo([10.800, -74.800], 8); // Reset to default view
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
