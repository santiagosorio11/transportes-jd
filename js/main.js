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
    const map = L.map('map').setView([10.800, -74.800], 8);

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
    const quoteBtn = document.getElementById('quoteBtn');

    select.addEventListener('change', (e) => {
        const routeId = parseInt(e.target.value);
        const route = routes.find(r => r.id === routeId);

        // Clear previous map elements
        if (currentPolyline) map.removeLayer(currentPolyline);
        currentMarkers.forEach(marker => map.removeLayer(marker));
        currentMarkers = [];

        if (route) {
            // Show Info Card
            routeInfo.classList.remove('hidden');
            routeName.textContent = route.name;
            routeTime.textContent = route.time;
            routeDistance.textContent = route.distance;
            quoteBtn.href = `https://wa.me/573000000000?text=Hola, me interesa cotizar la ruta: ${route.name}`;

            // Update Map View
            map.flyTo(route.center, route.zoom, { duration: 1.5 });

            // Draw Route
            currentPolyline = L.polyline(route.points, {
                color: '#0066cc',
                weight: 5,
                opacity: 0.8,
                dashArray: '10, 10'
            }).addTo(map);

            // Add Markers (Start and End)
            const startMarker = L.marker(route.points[0], { icon: carIcon }).addTo(map)
                .bindPopup(`<b>Inicio:</b> ${route.name.split(' - ')[0]}`);

            const endMarker = L.marker(route.points[route.points.length - 1], { icon: carIcon }).addTo(map)
                .bindPopup(`<b>Destino:</b> ${route.name.split(' - ')[1] || 'Fin'}`);

            currentMarkers.push(startMarker, endMarker);

            // Open popup of end marker after animation
            setTimeout(() => endMarker.openPopup(), 1600);

        } else {
            routeInfo.classList.add('hidden');
            map.flyTo([10.800, -74.800], 8); // Reset to default view
        }
    });

    // 4. Mobile Menu Toggle
    const menuBtn = document.getElementById('menuBtn');
    const navLinks = document.getElementById('navLinks');
    const links = document.querySelectorAll('.nav-link');

    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = navLinks.classList.contains('active') ? 'x' : 'menu';
        // Re-render icon (using Lucide API if available or simple innerHTML replacement)
        // Since we use the script tag, we can just toggle the icon attribute and re-run createIcons
        // But for simplicity in vanilla without complex state:
        menuBtn.innerHTML = navLinks.classList.contains('active')
            ? '<i data-lucide="x"></i>'
            : '<i data-lucide="menu"></i>';
        lucide.createIcons();
    });

    // Close menu when clicking a link
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            menuBtn.innerHTML = '<i data-lucide="menu"></i>';
            lucide.createIcons();
        });
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
});
