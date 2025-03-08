document.getElementById("fileInput").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const imgElement = document.getElementById("uploadedImage");
        imgElement.src = e.target.result;

        EXIF.getData(file, function () {
            const lat = EXIF.getTag(this, "GPSLatitude");
            const lon = EXIF.getTag(this, "GPSLongitude");
            const latRef = EXIF.getTag(this, "GPSLatitudeRef");
            const lonRef = EXIF.getTag(this, "GPSLongitudeRef");

            if (lat && lon) {
                const latDec = convertToDecimal(lat, latRef);
                const lonDec = convertToDecimal(lon, lonRef);
                showMap(latDec, lonDec);
            } else {
                alert("No GPS data found in image.");
            }
        });
    };
    reader.readAsDataURL(file);
});

function convertToDecimal(coord, ref) {
    let decimal = coord[0] + coord[1] / 60 + coord[2] / 3600;
    return ref === "S" || ref === "W" ? -decimal : decimal;
}

function showMap(lat, lon) {
    document.getElementById("map").innerHTML = ""; // Reset map
    const map = L.map("map").setView([lat, lon], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    L.marker([lat, lon]).addTo(map).bindPopup("Photo taken here").openPopup();
}
