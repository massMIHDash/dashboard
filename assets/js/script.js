document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map to cover the entire state of Massachusetts
    const map = L.map('map').setView([42.4072, -71.3824], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    fetch('assets/data/MIH Data Mock Up.csv')
        .then(response => response.text())
        .then(csvText => {
            const data = Papa.parse(csvText, { header: true }).data;

            data.forEach(provider => {
                if (typeof provider.lat != "undefined") {
                    console.log(provider);
                    const marker = L.marker([provider.lat, provider.lng]).addTo(map);
                    const popupContent = `
                        <b>${provider["Primary Contact Name and Title"]}</b><br>
                        ${provider.Address}<br>
                        ${provider["Phone Number"]}<br>
                        ${provider["Email Address"]}<br>
                        ${provider["Services Provided"]}<br>
                        ${provider.Funding}
                    `;
                    marker.bindPopup(popupContent);

                    // Add click event listener to the marker
                    marker.on('click', () => {
                        updateDetails(provider);
                    });
                } else {
                    console.log('no address for', provider);
                }
            });

            document.getElementById('self-referral-filter').addEventListener('change', () => applyFilters(data, map));
            document.getElementById('funding-filter').addEventListener('change', () => applyFilters(data, map));
            document.getElementById('services-provided-filter').addEventListener('change', () => applyFilters(data, map));
        });

    function applyFilters(data, map) {
        const selfReferralFilter = document.getElementById('self-referral-filter').value;
        const fundingFilter = document.getElementById('funding-filter').value;
        const servicesProvidedFilter = document.getElementById('services-provided-filter').value;

        map.eachLayer(layer => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        data.forEach(provider => {
            const matchesSelfReferral = !selfReferralFilter || provider["Self-Referral Allowed (yes/no)"].toLowerCase() === selfReferralFilter.toLowerCase();
            const matchesFunding = !fundingFilter || provider.Funding.toLowerCase().includes(fundingFilter.toLowerCase());
            const matchesServicesProvided = !servicesProvidedFilter || provider["Services Provided"].toLowerCase().includes(servicesProvidedFilter.toLowerCase());

            if (matchesSelfReferral && matchesFunding && matchesServicesProvided) {
                const marker = L.marker([provider.lat, provider.lng]).addTo(map);
                const popupContent = `
                    <b>${provider["Primary Contact Name and Title"]}</b><br>
                    ${provider.Address}<br>
                    ${provider["Phone Number"]}<br>
                    ${provider["Email Address"]}<br>
                    ${provider["Services Provided"]}<br>
                    ${provider.Funding}
                `;
                marker.bindPopup(popupContent);

                // Add click event listener to the marker
                marker.on('click', () => {
                    updateDetails(provider);
                });
            }
        });
    }

    function updateDetails(provider) {
        document.getElementById('provider-name').innerText = provider["Primary Contact Name and Title"];
        document.getElementById('provider-contact').innerText = provider["Primary Contact Name and Title"];
        document.getElementById('provider-phone').innerText = provider["Phone Number"];
        document.getElementById('provider-email').innerText = provider["Email Address"];
        document.getElementById('provider-address').innerText = provider.Address;
        document.getElementById('provider-services').innerText = provider["Services Provided"];
        document.getElementById('provider-funding').innerText = provider.Funding;
        document.getElementById('provider-self-referral').innerText = provider["Self-Referral Allowed (yes/no)"];
    }
});
