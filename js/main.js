// Build routes from provided JSON (real coordinates & times)
const rawData = [
    {
        "type": "origin",
        "name": "Aeropuerto Los Garzones",
        "price": 0,
        "time": "N/A",
        "origin": "Punto de Partida",
        "coords": [8.8256, -75.8273],
        "description": "Aeropuerto Internacional Los Garzones"
    },
    {
        "type": "origin",
        "name": "Montería (Centro)",
        "price": 0,
        "time": "N/A",
        "origin": "Punto de Partida",
        "coords": [8.7510, -75.8785],
        "description": "Centro de la ciudad"
    },
    {
        "type": "destination",
        "name": "Santa Cruz de Lorica",
        "price": 140000,
        "time": "50 min - 1 h",
        "origin": "Aeropuerto Los Garzones",
        "coords": [9.2394, -75.8139],
        "description": "Pueblo patrimonio"
    },
    {
        "type": "destination",
        "name": "San Antero",
        "price": 200000,
        "time": "1 h 15 min",
        "origin": "Aeropuerto Los Garzones",
        "coords": [9.3736, -75.7594],
        "description": "Destino turístico"
    },
    {
        "type": "destination",
        "name": "Coveñas (Centro)",
        "price": 200000,
        "time": "1 h 30 min",
        "origin": "Aeropuerto Los Garzones",
        "coords": [9.4042, -75.6826],
        "description": "Playas principales"
    },
    {
        "type": "destination",
        "name": "Coveñas - La Caimanera",
        "price": 220000,
        "time": "1 h 35 min",
        "origin": "Aeropuerto Los Garzones",
        "coords": [9.4265, -75.6610],
        "description": "Primera Ensenada"
    },
    {
        "type": "destination",
        "name": "Coveñas - Puerto Viejo",
        "price": 220000,
        "time": "1 h 40 min",
        "origin": "Aeropuerto Los Garzones",
        "coords": [9.4450, -75.6420],
        "description": "Sector turístico"
    },
    {
        "type": "destination",
        "name": "Santiago de Tolú",
        "price": 240000,
        "time": "1 h 50 min",
        "origin": "Aeropuerto Los Garzones",
        "coords": [9.5245, -75.5823],
        "description": "Playas y malecón"
    },
    {
        "type": "destination",
        "name": "Playas del Francés",
        "price": 320000,
        "time": "2 h 10 min",
        "origin": "Aeropuerto Los Garzones",
        "coords": [9.5605, -75.5502],
        "description": "Sector La Guacamaya / Camino Verde"
    },
    {
        "type": "destination",
        "name": "Paso Nuevo",
        "price": 210000,
        "time": "2 h",
        "origin": "Montería (Ciudad)",
        "coords": [9.3280, -75.9550],
        "description": "Playas tranquilas"
    },
    {
        "type": "destination",
        "name": "San Bernardo del Viento",
        "price": 210000,
        "time": "1 h 50 min",
        "origin": "Montería (Ciudad)",
        "coords": [9.3533, -75.9536],
        "description": "Desembocadura del río Sinú"
    },
    {
        "type": "destination",
        "name": "Arboletes",
        "price": 220000,
        "time": "1 h 20 min",
        "origin": "Montería (Ciudad)",
        "coords": [8.8505, -76.4286],
        "description": "Volcán de lodo y playa"
    },
    {
        "type": "destination",
        "name": "Moñitos",
        "price": 220000,
        "time": "1 h 40 min",
        "origin": "Montería (Ciudad)",
        "coords": [9.2458, -76.1283],
        "description": "Playa y gastronomía"
    },
    {
        "type": "destination",
        "name": "Sincelejo",
        "price": 220000,
        "time": "1 h 50 min",
        "origin": "Montería (Ciudad)",
        "coords": [9.3047, -75.3978],
        "description": "Capital de Sucre"
    },
    {
        "type": "destination",
        "name": "Necoclí",
        "price": 450000,
        "time": "2 h 45 min",
        "origin": "Montería (Ciudad)",
        "coords": [8.4256, -76.7867],
        "description": "Golfo de Urabá"
    }
];

// Normalize origin: treat any 'Aeropuerto' or 'Montería' as a single origin named 'Montería'
const MONTERIA_ORIGIN_NAME = 'Montería';
const MONTERIA_COORDS = [8.7510, -75.8785];

// Build routes array: one route per destination (use MONTERIA as origin for all)
// Keep a single Coveñas entry (ignore sectorized Coveñas items)
const seenDestBase = new Set();
const routes = rawData
    .filter(item => item.type === 'destination')
    .reduce((acc, item) => {
    // Determine base name for dedup (collapse Coveñas sectors)
    let baseName = item.name.toLowerCase();
    if (baseName.includes('coveñ')) baseName = 'coveñas';
    if (seenDestBase.has(baseName)) return acc; // skip duplicates
    seenDestBase.add(baseName);

    const originCoords = MONTERIA_COORDS;
    acc.push({
        id: acc.length + 1,
        name: `${MONTERIA_ORIGIN_NAME} - ${item.name.replace(/\s*\(.+\)$/,'')}`,
        time: item.time || '',
        distance: `$${item.price?.toString() || ''}`,
        center: [ (originCoords[0] + item.coords[0]) / 2, (originCoords[1] + item.coords[1]) / 2 ],
        zoom: 9,
        points: [ originCoords, item.coords ],
        description: item.description || ''
    });

    return acc;
    }, []);

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Map
    // Default view: Montería area
    // Disable all user interactions so the map only moves programmatically
    const map = L.map('map', {
        dragging: false,
        touchZoom: false,
        doubleClickZoom: false,
        scrollWheelZoom: false,
        boxZoom: false,
        keyboard: false,
        tap: false,
        zoomControl: false
    }).setView([8.7510, -75.8785], 9);

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
    const drawSpeed = 150; // ms per segment during animated drawing

    // Layer group to manage all route layers (polyline segments + markers)
    const routeLayer = L.layerGroup().addTo(map);

    // 2. Populate Dropdown
    const select = document.getElementById('routeSelect');
    routes.forEach(route => {
        const option = document.createElement('option');
        option.value = route.id;
        option.textContent = route.name;
        select.appendChild(option);
    });

    // Set default selected route to the star route (Montería - Coveñas) if present
    const starRoute = routes.find(r => /coveñ|covenas/i.test(r.name));
    if (starRoute) {
        select.value = String(starRoute.id);
    }

    // 3. Handle Route Selection
    const routeInfo = document.getElementById('routeInfo');
    const routeName = document.getElementById('routeName');
    const routeTime = document.getElementById('routeTime');
    const routeDistance = document.getElementById('routeDistance');

    select.addEventListener('change', (e) => {
        const routeId = parseInt(e.target.value);
        const route = routes.find(r => r.id === routeId);

        // Clear previous map elements in a single operation (fixes lingering lines)
        routeLayer.clearLayers();
        currentPolyline = null;
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

                                // Create segment polyline with dashed style and add to routeLayer
                                const segment = L.polyline([startPoint, endPoint], {
                                    color: '#1e40af',
                                    weight: 5,
                                    opacity: 0.8,
                                    lineCap: 'round',
                                    lineJoin: 'round',
                                    dashArray: '15, 10'
                                }).addTo(routeLayer);

                                animatedSegments.push(segment);
                                segmentIndex++;

                                // Continue animation
                                setTimeout(animateRouteSegment, drawSpeed);
                            } else {
                                // All segments drawn, create final complete dashed polyline
                                setTimeout(() => {
                                    // Remove individual segments (they're in routeLayer; clear them)
                                    animatedSegments.forEach(seg => {
                                        if (routeLayer.hasLayer(seg)) {
                                            routeLayer.removeLayer(seg);
                                        }
                                    });
                                    animatedSegments = [];

                                    // Add final complete dashed polyline to routeLayer
                                    currentPolyline = L.polyline(route.points, {
                                        color: '#1e40af',
                                        weight: 5,
                                        opacity: 0.8,
                                        lineCap: 'round',
                                        lineJoin: 'round',
                                        dashArray: '15, 10'
                                    }).addTo(routeLayer);
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
            const startMarker = L.marker(route.points[0], { icon: carIcon }).addTo(routeLayer)
                .bindPopup(`<b>Inicio:</b> ${route.name.split(' - ')[0]}`);

            const endMarker = L.marker(route.points[route.points.length - 1], { icon: carIcon }).addTo(routeLayer)
                .bindPopup(`<b>Destino:</b> ${route.name.split(' - ')[1] || 'Fin'}`);

            currentMarkers.push(startMarker, endMarker);

            // Add waypoint markers if there are more than 2 points
            if (route.points.length > 2) {
                for (let i = 1; i < route.points.length - 1; i++) {
                    const waypointMarker = L.marker(route.points[i], { icon: carIcon }).addTo(routeLayer)
                        .bindPopup(`<b>Punto Intermedio ${i}</b>`);
                    currentMarkers.push(waypointMarker);
                }
            }

            // Open popup of end marker after animation completes
            setTimeout(() => endMarker.openPopup(), (route.points.length * drawSpeed) + 800);

        } else {
            routeInfo.classList.add('hidden');
            map.flyTo([8.7500, -75.8814], 9); // Reset to default view (Montería)
        }
    });

    // Trigger change on the selector to draw the default star route on load
    if (select.value) {
        // small timeout to ensure map/tiles are ready
        setTimeout(() => {
            const event = new Event('change');
            select.dispatchEvent(event);
        }, 300);
    }

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

    // Side-dots scrollspy and smooth navigation
    (function initSideDots() {
        const dots = Array.from(document.querySelectorAll('.side-dots .dot'));
        if (!dots.length) return;

        // Click behavior - smooth scroll to target
        dots.forEach(a => {
            a.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                const el = document.getElementById(targetId);
                if (!el) return;
                const headerOffset = 80;
                const rect = el.getBoundingClientRect();
                const top = rect.top + window.pageYOffset - headerOffset;
                window.scrollTo({ top, behavior: 'smooth' });
            });
        });

        // IntersectionObserver to update active dot
        const sections = dots.map(d => document.getElementById(d.getAttribute('data-target'))).filter(Boolean);
        const obsOptions = { root: null, rootMargin: '0px', threshold: 0.55 };
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    document.querySelectorAll('.side-dots .dot').forEach(el => el.classList.toggle('active', el.getAttribute('data-target') === id));
                }
            });
        }, obsOptions);

        sections.forEach(s => observer.observe(s));
    })();

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

    // 7. Destinations Carousel (automatic every 5 seconds) - REMOVED (replaced by auto-scroll grid)
    // Keeping old destinations carousel JS commented out for reference
    /* 
    (function initDestinationsCarousel() {
        const track = document.querySelector('.dest-track');
        if (!track) return;
        const slides = Array.from(track.children);
        const prevBtn = document.querySelector('.dest-prev');
        const nextBtn = document.querySelector('.dest-next');
        let index = 0;
        const total = slides.length;
        const intervalMs = 5000; // 5 seconds
        let timer = null;

        function goTo(i) {
            index = (i + total) % total;
            track.style.transform = `translateX(-${index * 100}%)`;
        }

        function next() { goTo(index + 1); }
        function prev() { goTo(index - 1); }

        function startAuto() {
            stopAuto();
            timer = setInterval(next, intervalMs);
        }

        function stopAuto() {
            if (timer) clearInterval(timer);
            timer = null;
        }

        // Attach events
        if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAuto(); });
        if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAuto(); });

        // Pause on hover (desktop) for accessibility
        const carousel = document.querySelector('.dest-carousel');
        if (carousel) {
            carousel.addEventListener('mouseenter', stopAuto);
            carousel.addEventListener('mouseleave', startAuto);
        }

        // Start
        goTo(0);
        startAuto();
    })();
    */

    // 8. Hero slideshow for Taxi Seguro Aeropuerto Monteria (5s cycle)
    (function initHeroSlideshow() {
        const slides = Array.from(document.querySelectorAll('.hero-slide'));
        if (!slides.length) return;
        let idx = 0;
        const interval = 7000; // 7 seconds (2s added)

        function show(i) {
            slides.forEach((s, k) => s.classList.toggle('active', k === i));
        }

        function next() { idx = (idx + 1) % slides.length; show(idx); }

        // Start
        show(0);
        setInterval(next, interval);
    })();

    // 9. Destinations auto-scroll carousel (infinite loop with cloning + draggable)
    (function initDestCarousel() {
        const container = document.querySelector('.dest-carousel-auto');
        const grid = document.querySelector('.dest-grid');
        if (!grid || !container) return;

        // Clone all cards for infinite effect
        const cards = Array.from(grid.children);
        cards.forEach(card => grid.appendChild(card.cloneNode(true)));

        // Prepare animation state
        let rafId = null;
        let pos = 0;
        // pixels per frame approx (increase to move faster)
        const speed = 0.8; // adjust to taste (higher = faster)
        let isDragging = false;
        let startX = 0;
        let startPos = 0;

        // Ensure transform will be used
        grid.style.willChange = 'transform';
        grid.style.display = 'flex';

        const totalWidth = grid.scrollWidth / 2; // because we cloned

        function step() {
            if (!isDragging) {
                pos += speed;
            }
            if (pos >= totalWidth) pos -= totalWidth;
            grid.style.transform = `translateX(-${pos}px)`;
            rafId = requestAnimationFrame(step);
        }

        // Start animation
        rafId = requestAnimationFrame(step);

        // Pointer (mouse/touch) drag handlers
        container.style.cursor = 'grab';

        function pointerDown(e) {
            isDragging = true;
            container.style.cursor = 'grabbing';
            startX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            startPos = pos;
            // stop the automatic increment during drag
        }

        function pointerMove(e) {
            if (!isDragging) return;
            const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
            const dx = x - startX;
            pos = startPos - dx;
            // wrap
            if (pos < 0) pos += totalWidth;
            if (pos >= totalWidth) pos -= totalWidth;
            grid.style.transform = `translateX(-${pos}px)`;
        }

        function pointerUp() {
            isDragging = false;
            container.style.cursor = 'grab';
        }

        // Mouse events: only start drag on left-button mousedown
        container.addEventListener('mousedown', (e) => { if (e.button !== 0) return; e.preventDefault(); pointerDown(e); });
        window.addEventListener('mousemove', pointerMove);
        window.addEventListener('mouseup', pointerUp);

        // Touch events
        container.addEventListener('touchstart', (e) => { pointerDown(e.touches[0]); }, { passive: true });
        container.addEventListener('touchmove', (e) => { pointerMove(e.touches[0]); }, { passive: true });
        container.addEventListener('touchend', pointerUp);

        // Note: do not activate drag on hover. Drag starts on mousedown and ends on mouseup.
    })();
});
