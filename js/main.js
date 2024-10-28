document.addEventListener('DOMContentLoaded', (event) => {
    // Initialiser la carte
    var map = L.map('map').setView([46.2044, 6.1432], 13); // Genève

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    L.marker([51.5, -0.09]).addTo(map)
    .bindPopup('A pretty CSS popup.<br> Easily customizable.')
    .openPopup();

    // Variables pour le stockage local
    let geocaches = JSON.parse(localStorage.getItem('geocaches')) || [];

    // Fonction pour ajouter un marqueur
    function addMarker(lat, lng, description, photos) {
        var marker = L.marker([lat, lng]).addTo(map);
        marker.bindPopup(`
            <div>
                <h3>Description</h3>
                <p>${description}</p>
                <h3>Photos</h3>
                ${photos.map(photo => `<img src="${photo}" width="100%">`).join('')}
            </div>
        `).openPopup();

        geocaches.push({ lat, lng, description, photos });
        localStorage.setItem('geocaches', JSON.stringify(geocaches));
    }

    // Afficher les marqueurs sauvegardés
    geocaches.forEach(cache => {
        addMarker(cache.lat, cache.lng, cache.description, cache.photos);
    });

    // Ajouter un marqueur à la carte avec un click
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        const description = prompt('Enter a description:');
        const photos = [];

        navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();

            const takePhoto = () => {
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const context = canvas.getContext('2d');
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const photo = canvas.toDataURL('image/png');
                photos.push(photo);

                if (confirm('Take another photo?')) {
                    takePhoto();
                } else {
                    stream.getTracks().forEach(track => track.stop());
                    addMarker(lat, lng, description, photos);
                }
            };

            takePhoto();
        });
    });
});
