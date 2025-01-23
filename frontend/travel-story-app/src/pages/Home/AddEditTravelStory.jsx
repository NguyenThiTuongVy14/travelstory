import React, { useState } from 'react'
import { MdAdd, MdDeleteOutline, MdUpdate, MdClose } from "react-icons/md"
import DateSelector from '../../components/Input/DateSelector';
import ImageSelector from '../../components/Input/ImageSelector';
import TagInput from '../../components/Input/TagInput';
import axiosInstance from '../../utils/axiosInstance';
import moment from 'moment';
import { toast } from 'react-toastify';
import uploadImage from '../../utils/uploadImage';
const AddEditTravelStory = ({ storyInfo, type, onClose, getAllTravelStories, }) => {

    const [title, setTitle] = useState(storyInfo?.title||"");
    const [storyImg, setStoryImg] = useState(storyInfo?.imageUrl|| null);
    const [story, setStory] = useState(storyInfo?.story || "");
    const [visitedLocation, setVisitedLocation] = useState(storyInfo?.visitedLocation || []);
    const [visitedDate, setVisitedDate] = useState(storyInfo?.visitedDate || null);

    const [error, setError] = useState("");

    const addNewTravelStory = async () => {
        try {
            let imageUrl = "";

            if (storyImg) {
                const immgUploadRes = await uploadImage(storyImg); 
                imageUrl = immgUploadRes.imagUrl || "";  
            }

            const response = await axiosInstance.post("/addTravel", {
                title,
                story,
                visitedLocation,
                imageUrl: imageUrl || "", 
                visitedDate: visitedDate ? moment(visitedDate).valueOf() : moment().valueOf(),
            });

            if (response.data && response.data.story) {
                toast.success("Story Added Successfully");
                getAllTravelStories();
                onClose();
            }
        } catch (error) {
            console.error('Error adding new travel story:', error);
            toast.error("Failed to add story");
        }
    };


    //Update Travel Story
    const updateTravelStory = async () => {
        const storyId = storyInfo._id;
        try {
            let imageUrl = storyInfo?.imageUrl; 
    
            if (storyImg && typeof storyImg === "object") {
                const immgUploadRes = await uploadImage(storyImg); 
                imageUrl = immgUploadRes.imagUrl || "";
            } else if (!storyImg) {
                imageUrl = null;
            }
    
            const postData = {
                title,
                story,
                imageUrl: imageUrl,  
                visitedLocation,
                visitedDate: visitedDate ? moment(visitedDate).valueOf() : moment().valueOf(),
            };
    
            // Send the update request
            const response = await axiosInstance.post(`/editTravel/${storyId}`, postData);
    
            if (response.data && response.data.story) {
                toast.success("Story Edited Successfully");
                getAllTravelStories();
                onClose();
            }
        } catch (error) {
            console.error('Error editing travel story:', error);
            toast.error("Failed to edit story");
        }
    };
    
    const handelAddOrUpdateClick = () => {
        console.log("Input Data:", { title, storyImg, story, visitedLocation, visitedDate })
        if (!title) {
            setError("Please enter the title");
            return;
        }
        if (!story) {
            setError("Please enter the story");
            return;
        }
        setError("");

        if (type == "edit") {
            updateTravelStory();
        }
        else {
            addNewTravelStory();
        }
    };
    //Delete Story Image and Update
    const handleDeleteStoryImg = async () => {
        if (!storyImg) {
            toast.info("No image to delete");
            return;
        }
    
        try {
            await axiosInstance.delete("/delete-image", {
                params: {
                    imageUrl: storyImg,  
                },
            });
    
            setStoryImg(null);
        } catch (error) {
            console.error("Error deleting image:", error);
            toast.error("Failed to delete image from the server.");
        }
    };
    return (
        <div className='relative'>
            <div className='flex items-center justify-between'>
                <h5 className='text-xl font-medium text-slate-700'>
                    {type === "add" ? "Add Story" : "Update Story"}
                </h5>
                <div>
                    <div className="flex items-center gap-3 bg-cyan-50/50 p-2 rounded-l-lg">
                        {type === 'add' ? (
                            <button className='btn-small' onClick={handelAddOrUpdateClick}>
                                <MdAdd className='text-lg' />ADD STORY
                            </button>
                        ) : (
                            <>
                                <button className='btn-small' onClick={handelAddOrUpdateClick}>
                                    <MdUpdate className='text-lg' />UPDATE STORY
                                </button>
                            </>
                        )}
                        <button className='' onClick={onClose}>
                            <MdClose className='text-xl text-slate-400 ' />
                        </button>
                    </div>
                    {error && (
                        <p className='text-red-500 text-xs pt-2 text-right'>{error}</p>
                    )}
                </div>
            </div>

            <div>
                <div className='flex-1 flex flex-col gap-2 pt-4'>
                    <label className='input-label'>TITLE</label>
                    <input type="text" name="" id="" className='text-2xl text-slate-950 outline-none' placeholder='A Day at the Great Wall' value={title} onChange={({ target }) => setTitle(target.value)} />

                </div>
                <div className='my-3'>
                    <DateSelector date={visitedDate} setDate={setVisitedDate} />
                </div>

                <ImageSelector
                    image={storyImg} setImage={setStoryImg} handleDeleteImg={handleDeleteStoryImg}
                />
                <div className='flex flex-col gap-2 mt-4'>
                    <label className='input-label'>STORY</label>
                    <textarea
                        type='text'
                        className='text-sm text-slate-950 outline-none bg-slate-50 p-2 rounded'
                        placeholder='Your Story'
                        rows={10}
                        value={story}
                        onChange={({ target }) => setStory(target.value)}
                    ></textarea>
                </div>
                <div className='pt-3'>
                    <label className='input-label'>VISITED LOCATIONS</label>
                    <TagInput tags={visitedLocation} setTags={setVisitedLocation} />
                </div>
            </div>
        </div>
    )
}

export default AddEditTravelStory