const dropbox = document.getElementById("dropbox");
const fileInput = document.getElementById("fileInput");
const uploadedImage = document.getElementById("uploadedImage");

// Initialize the map with a default view
let map = L.map("map").setView([37.7749, -122.4194], 3); // Default: San Francisco
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

dropbox.addEventListener("click", () => fileInput.click());

dropbox.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropbox.classList.add("hover");
});

dropbox.addEventListener("dragleave", () => {
    dropbox.classList.remove("hover");
});

dropbox.addEventListener("drop", (e) => {
    e.preventDefault();
    dropbox.classList.remove("hover");

    const file = e.dataTransfer.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
});

function handleFileUpload(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        uploadedImage.src = e.target.result;
        uploadedImage.style.display = "block";
        extractGPS(file);
    };
    reader.readAsDataURL(file);
}

function extractGPS(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const arrayBuffer = e.target.result;
        EXIF.getData(file, function () {
            const lat = EXIF.getTag(this, "GPSLatitude");
            const lon = EXIF.getTag(this, "GPSLongitude");
            const latRef = EXIF.getTag(this, "GPSLatitudeRef") || "N";
            const lonRef = EXIF.getTag(this, "GPSLongitudeRef") || "W";

            if (lat && lon) {
                const latDecimal = convertDMSToDecimal(lat, latRef);
                const lonDecimal = convertDMSToDecimal(lon, lonRef);
                showMap(latDecimal, lonDecimal);
            } else {
                alert("No GPS data found in this image.");
            }
        });
    };
    reader.readAsArrayBuffer(file);
}

function convertDMSToDecimal(dms, direction) {
    const degrees = dms[0];
    const minutes = dms[1] / 60;
    const seconds = dms[2] / 3600;
    let decimal = degrees + minutes + seconds;
    return direction === "S" || direction === "W" ? decimal * -1 : decimal;
}

function showMap(lat, lon) {
    map.setView([lat, lon], 13); // Move to new location
    L.marker([lat, lon]).addTo(map).bindPopup("Photo taken here").openPopup();
}

