// LOAD MODELS
Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri("models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("models"),
]).then(startVideo);

async function startVideo() {
    document.getElementById("video").srcObject =
        await navigator.mediaDevices.getUserMedia({ video: {} });

    video.addEventListener("playing", async () => {
        const canvas = document.getElementById("overlay");
        const videoEl = document.getElementById("video");

        canvas.width = videoEl.width;
        canvas.height = videoEl.height;

        const ctx = canvas.getContext("2d");

        // LOAD VAISHNAVI DESCRIPTOR
        const labeledDescriptors = await loadFaces();

        const faceMatcher = new faceapi.FaceMatcher(labeledDescriptors, 0.45);

        setInterval(async () => {
            const detections = await faceapi
                .detectAllFaces(videoEl)
                .withFaceLandmarks()
                .withFaceDescriptors();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            detections.forEach(det => {
                const match = faceMatcher.findBestMatch(det.descriptor);

                const box = det.detection.box;

                // Draw Green Hitbox
                ctx.strokeStyle = "lime";
                ctx.lineWidth = 3;
                ctx.strokeRect(box.x, box.y, box.width, box.height);

                // Determine uniform
                const uniformStatus = match.label === "Vaishnavi"
                    ? "Uniform: YES"
                    : "Uniform: UNKNOWN";

                // Text background
                ctx.fillStyle = "rgba(0,0,0,0.6)";
                ctx.fillRect(box.x, box.y - 45, 180, 45);

                // White text
                ctx.fillStyle = "white";
                ctx.font = "18px Arial";
                ctx.fillText("Name: " + match.label, box.x + 5, box.y - 25);
                ctx.fillText(uniformStatus, box.x + 5, box.y - 5);
            });

        }, 100);
    });
}

async function loadFaces() {
    const img = await faceapi.fetchImage("faces/vaishnavi.jpg");

    const detection = await faceapi
        .detectSingleFace(img)
        .withFaceLandmarks()
        .withFaceDescriptor();

    return new faceapi.LabeledFaceDescriptors("Vaishnavi", [detection.descriptor]);
}
