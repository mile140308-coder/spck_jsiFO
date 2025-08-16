async function uploadToCloudinary(file) {
    try {
      // Tạo FormData để upload file
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "SPLMIAU"); // Thay bằng upload preset của bạn

      // Upload lên Cloudinary
      // Sẽ phải thay đổi phần dcadizjkf thành tên của các bạn
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/da1idy1xu/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.secure_url) {
        return result.secure_url;
        console.log(result.secure_url);
      } else {
        throw new Error(
          `Upload thất bại: ${result.error?.message || "Không rõ lỗi"}`
        );
      }
    } catch (error) {
        throw error;
    }
}

// Setup event listeners khi trang load
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const imagePreview = document.getElementById('image-preview');
    const uploadArea = document.getElementById('upload-area');
    const statusDiv = document.getElementById('upload-status');

    // Preview ảnh khi chọn file
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Kiểm tra file type
            if (!file.type.startsWith('image/')) {
                showStatus('Vui lòng chọn file ảnh!', 'error');
                fileInput.value = '';
                return;
            }
            
            // Kiểm tra kích thước file (10MB)
            if (file.size > 10 * 1024 * 1024) {
                showStatus('File quá lớn! Vui lòng chọn file nhỏ hơn 10MB.', 'error');
                fileInput.value = '';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                uploadBtn.style.display = 'inline-block';
                
                // Thay đổi text của upload area
                uploadArea.innerHTML = `
                    <h3 style="color: white; margin-bottom: 20px;">✅ Đã chọn: ${file.name}</h3>
                    <p style="color: rgba(255, 255, 255, 0.7);">
                        Kích thước: ${(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <button class="upload-btn" onclick="document.getElementById('file-input').click()">
                        📁 Chọn File Khác
                    </button>
                `;
            };
            reader.readAsDataURL(file);
        }
    });

    // Upload khi bấm nút
    uploadBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            showStatus('Vui lòng chọn file ảnh trước!', 'error');
            return;
        }

        // Disable button và hiển thị loading
        uploadBtn.disabled = true;
        uploadBtn.textContent = '🔄 Đang upload...';
        showStatus('Đang upload ảnh lên Cloudinary...', 'loading');

        try {
            const imageUrl = await uploadToCloudinary(file);
            
            showStatus(`
                <div class="status-success">
                    <h4>✅ Upload thành công!</h4>
                    <div class="url-display">
                        <strong>URL:</strong><br>
                        <a href="${imageUrl}" target="_blank" style="color: #4caf50;">${imageUrl}</a>
                    </div>
                    <button onclick="copyToClipboard('${imageUrl}')" class="upload-btn" style="margin-top: 10px;">
                        📋 Copy URL
                    </button>
                </div>
            `, 'success');
            
            // Có thể lưu URL vào database hoặc sử dụng cho mục đích khác
            console.log('Image URL for database:', imageUrl);
            
        } catch (error) {
            showStatus(`❌ Lỗi upload: ${error.message}`, 'error');
        } finally {
            uploadBtn.disabled = false;
            uploadBtn.textContent = '☁️ Upload lên Cloudinary';
        }
    });
});

// Function hiển thị status
function showStatus(message, type = 'info') {
    const statusDiv = document.getElementById('upload-status');
    if (type === 'success') {
        statusDiv.innerHTML = message;
    } else {
        statusDiv.innerHTML = `<div class="status-${type}">${message}</div>`;
    }
}

// Function copy URL to clipboard
window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Đã copy URL vào clipboard!');
    }).catch(err => {
        console.error('Lỗi copy:', err);
        // Fallback cho trình duyệt cũ
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Đã copy URL vào clipboard!');
    });
};