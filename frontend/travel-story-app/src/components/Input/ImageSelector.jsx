import React, { useEffect, useRef, useState } from 'react';
import { FaRegFileImage } from 'react-icons/fa';
import { MdDeleteOutline } from 'react-icons/md';

const ImageSelector = ({ image, setImage,handleDeleteImg }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null); 

  // Hàm xử lý khi chọn ảnh
  const handleImageChange = (event) => {
    const file = event.target.files[0];  
    if (file) {
      setImage(file);  
      
    }
  };
  useEffect(() => {
    if(typeof image === 'string'){
      setPreviewUrl(image);
    }
    else if(image){
      setPreviewUrl(URL.createObjectURL(image));
    }
    else{
      setPreviewUrl(null);
    }
      return () => {
        if (previewUrl && typeof previewUrl === 'string' && !image) {
          URL.revokeObjectURL(previewUrl);
        }
    }
  }, [image])
  
  // Hàm mở hộp thoại chọn file
  const onChooseFile = () => {
    inputRef.current.click();
  };

  // Hàm xóa ảnh đã chọn
  const handleRemoveImage = () => {
    setImage(null);  // Xóa ảnh đã chọn
    handleDeleteImg();
  };

  return (
    <div>
      <input 
        type="file" 
        accept="image/*" 
        ref={inputRef} 
        onChange={handleImageChange} 
        className="hidden" 
      />
      
      {/* Nếu chưa chọn ảnh thì hiển thị nút bấm chọn ảnh */}
      {!image ? (
        <button 
          className="w-full h-[220px] flex flex-col items-center justify-center gap-4 bg-slate-50 rounded border border-slate-200/50"
          onClick={()=>onChooseFile()}
        >
          <div className="w-14 h-14 flex items-center justify-center bg-cyan-50 rounded-full border border-cyan-100">
            <FaRegFileImage className="text-xl text-cyan-500" />
          </div>
          <p className="text-sm text-slate-500">Browse image files to upload</p>
        </button>
      ) : (
        // Nếu đã chọn ảnh, hiển thị ảnh đã chọn
        <div className="w-full  relative">
          <img src={previewUrl} alt="Selected" className="w-full h-[300px] object-cover rounded-lg " />
          
          {/* Nút xóa */}
          <button 
            className="absolute top-2 right-2 bg-white p-2 rounded-full"
            onClick={handleRemoveImage}  // Gọi hàm xóa ảnh
          >
            <MdDeleteOutline className="text-xl text-red-500" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ImageSelector;
