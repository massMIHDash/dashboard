document.addEventListener('DOMContentLoaded', () => {
    // Initialize the map to cover the entire state of Massachusetts
    const map = L.map('map').setView([42.4072, -71.3824], 8);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // limited by referrer, shouldn't have issues with this being public
    var apiKey = 'AIzaSyDatSI9wOGlbY5YkNodG1ERC2Tng44BsgU';

    var spreadsheetId = '19PCYqgDgeWs2LHhC3FXSOLlZwdfSnjrYsPdVp8hRNh0';

    var range = "A1:L";
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;

    $.getJSON(url, function (data) {
        const values = data.values;

        const keys = values[0]; // Assuming first row contains column names
        const dataArray = values.slice(1); // Data excluding the first row
        const dataObject = dataArray.map(row => {
            let obj = {};
            row.forEach((cell, index) => {
                obj[keys[index]] = cell;
            });
            return obj;
        });

        dataObject.forEach(provider => {
            if (typeof provider.lat != "undefined") {
                console.log(provider);
                const marker = L.marker([provider.lat, provider.lng]).addTo(map);
                const popupContent = `
                            <b>${provider.primary_contact}</b><br>
                            ${provider.address}<br>
                            ${provider.phone}<br>
                            ${provider.email}<br>
                            ${provider.services}<br>
                            ${provider.funding}
                        `;
                marker.bindPopup(popupContent);
    
                // Add click event listener to the marker
                marker.on('click', () => {
                    updateDetails(provider);
                });
            } 
        });
    })
        .fail(function (response) {

            console.error('Error fetching data:', response);
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
        const matchesSelfReferral = selfReferralFilter == (provider.self_referral.toLowerCase() === 'yes');

        //const matchesSelfReferral = !selfReferralFilter || provider.self_referral.toLowerCase() === selfReferralFilter.toLowerCase();
        const matchesFunding = !fundingFilter || provider.funding.toLowerCase().includes(fundingFilter.toLowerCase());
        const matchesServicesProvided = !servicesProvidedFilter || provider.services.toLowerCase().includes(servicesProvidedFilter.toLowerCase());

        if (matchesSelfReferral && matchesFunding && matchesServicesProvided) {
            const marker = L.marker([provider.lat, provider.lng]).addTo(map);
            const popupContent = `
                    <b>${provider.primary_contact}</b><br>
                    ${provider.address}<br>
                    ${provider.phone}<br>
                    ${provider.email}<br>
                    ${provider.services}<br>
                    ${provider.funding}
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
    document.getElementById('provider-name').innerText = provider.provider_title;
    document.getElementById('provider-contact').innerText = provider.primary_contact;
    document.getElementById('provider-phone').innerText = provider.phone;
    document.getElementById('provider-email').innerText = provider.email;
    document.getElementById('provider-address').innerText = provider.address;
    document.getElementById('provider-services').innerText = provider.services;
    document.getElementById('provider-funding').innerText = provider.funding;
    document.getElementById('provider-self-referral').innerText = provider.self_referral;
}
;
