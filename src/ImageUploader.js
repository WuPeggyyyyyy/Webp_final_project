import React, { useState } from "react";
import axios from "axios";

function ImageUploader({ onUploadSuccess }) {
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!imageFile) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", "CGUfoodtruck_preset"); // 替換成你的 preset 名稱

    try {
      const res = await axios.post(
        "https://api.cloudinary.com/v1_1/duij4v2sx/image/upload",
        formData
      );
      const imageUrl = res.data.secure_url;
      onUploadSuccess(imageUrl); // 把 URL 傳出去
      setPreviewUrl(imageUrl);
    } catch (err) {
      console.error("上傳失敗", err);
      alert("圖片上傳失敗");
    }

    setUploading(false);
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setImageFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={uploading}>
        {uploading ? "上傳中..." : "上傳圖片"}
      </button>
      {previewUrl && (
        <div>
          <p>預覽圖片：</p>
          <img src={previewUrl} alt="預覽" width="200" />
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
