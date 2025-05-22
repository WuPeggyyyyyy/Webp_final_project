import React, { useState } from "react";
import axios from "axios";

function ImageUploader({ onUploadSuccess }) {
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!imageFiles.length) return;
    setUploading(true);

    const uploadedUrls = [];

    for (const file of imageFiles) {
      const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "CGUfoodtruck_preset"); // 替換成你的 preset 名稱

      try {
        const res = await axios.post(
          "https://api.cloudinary.com/v1_1/duij4v2sx/image/upload",
          formData
        );
      const imageUrl = res.data.secure_url;
      uploadedUrls.push(imageUrl); // 收集所有 URL
      } catch (err) {
        console.error("上傳失敗", err);
        alert("某張圖片上傳失敗");
      }
    }

    if (uploadedUrls.length) {
      setPreviewUrls((prev) => [...prev, ...uploadedUrls]);
      onUploadSuccess((prev) => [...(Array.isArray(prev) ? prev : []), ...uploadedUrls]);
    }

    setUploading(false);
  };

  const handleDeleteImage = (urlToDelete) => {
    setPreviewUrls((prev) => prev.filter((url) => url !== urlToDelete));
    onUploadSuccess((prev) => prev.filter((url) => url !== urlToDelete));
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => setImageFiles(Array.from(e.target.files))}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "上傳中..." : "上傳圖片"}
      </button>

      {Array.isArray(previewUrls) && previewUrls.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "10px",
            overflowX: "auto",
            paddingTop: "10px",
          }}
        >
          {previewUrls.map((url, index) => (
            <div key={index} style={{ position: "relative" }}>
              <img
                src={url}
                alt={`圖片${index}`}
                width="150"
                style={{ borderRadius: "8px" }}
              />
              <button
                onClick={() => handleDeleteImage(url)}
                style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  background: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
