export const processFile = (file, setImage, showError) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
        showError("File size should not exceed 10 MB");
        return;
    }

    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
        showError("Only JPG, JPEG, PNG and WEBP files are allowed");
        return;
    }

    const url = URL.createObjectURL(file);

    const img = new Image();

    img.onload = () => {
        setImage({
            url,
            w: img.naturalWidth,
            h: img.naturalHeight,
            file,
        });
    };

    img.src = url;
  };