import axiosInstance from "./axiosInstance";

const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
        const response = await axiosInstance.post("/image-upload", formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (response.data && response.data.imagUrl) {
            return response.data;// Trả về URL ảnh
        }
    } catch (error) {
        console.error('Error uploading the image:', error);
        throw error;
    }
};
export default uploadImage;