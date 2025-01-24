require("dotenv").config();

const config = require("./config.json");
const mongoose = require("mongoose")
const bcrypt = require('bcryptjs');
const express = require("express");
const cors = require("cors");

const jwt = require("jsonwebtoken");
const upload = require("./multer");
const fs = require("fs");
const path = require("path");


const User = require("./models/user.model");
const Travel = require("./models/travelStory.model");

const { authenticateToken } = require("./utilities");
const { error } = require("console");

mongoose.connect(config.connectionString);

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

//Create account
app.post("/create-account", async (req, res) => {
    try {
        const { fullName, email, password } = req.body;
        if (!fullName || !email || !password) {
            return res.status(400).json({ error: true, message: "All fields are required" });
        }

        const isUser = await User.findOne({ email });
        if (isUser) {
            return res.status(400).json({ error: true, message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10); // Ensure password is a string
        const user = new User({
            fullName,
            email,
            password: hashedPassword,
        });

        await user.save();

        const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });
        return res.status(201).json({
            error: false,
            user: { fullName: user.fullName, email: user.email },
            accessToken,
            message: "User created successfully",
        });
    } catch (error) {
        console.error("Error occurred:", error); // Log detailed error info
        return res.status(500).json({ error: true, message: "Internal server error" });
    }
});
//Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password are required" });
    }
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid Credentials" });
    }

    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "72h" });
    return res.status(201).json({
        error: false,
        user: { fullName: user.fullName, email: user.email },
        accessToken,
        message: "Login successfully",
    });

});

//Get User 
app.get("/getUser", authenticateToken, async (req, res) => {
    const { userId } = req.user
    const isUser = await User.findOne({ _id: userId });
    if (!isUser) {
        return res.sendStatus(401);
    }
    return res.json({
        user: isUser,
        message: "",
    });
});

//Route to handle image upload
app.post("/image-upload", upload.single("image"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: true, message: "No image uploaded" });
        }
        const imagUrl = `http://localhost:8000/uploads/${req.file.filename}`;
        res.status(201).json({ imagUrl });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

//Delete imgage
app.delete("/delete-image", async (req, res) => {
    const { imageUrl } = req.query;
    if (!imageUrl) {
        return res.status(400).json({ error: true, message: "imgaeUrl parameter is required" });
    }
    try {
        const filename = path.basename(imageUrl);

        const filePath = path.join(__dirname, 'uploads', filename);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.status(200).json({ message: "Image deleted sucessfully" });
        }
        else {
            res.status(200).json({ error: true, message: "Image not found" });
        }
    } catch (error) {
        res.status(500).json({ error: true, message: error.message })
    }
});
//Add Travel Story
app.post("/addTravel", authenticateToken, async (req, res) => {
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;
    if (!title || !story || !visitedLocation || !visitedDate || !imageUrl) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }
    const parseVisitedDate = new Date(parseInt(visitedDate));
    try {
        const travelStory = new Travel({
            title,
            story,
            visitedLocation,
            userId,
            imageUrl,
            visitedDate: parseVisitedDate,
        });
        await travelStory.save();
        res.status(201).json({
            error: false,
            message: 'Added Successfully',
            story: travelStory
        });
    } catch (error) {
        res.status(400).json({ error: true, message: error.message });
    }
});
//Get Travel Story
app.get("/getAllTravelStories", authenticateToken, async (req, res) => {
    const { userId } = req.user;

    try {
        const travelStories = await Travel.find({ userId: userId }).sort({ isFavourite: -1, });

        res.status(200).json({ stories: travelStories });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

//Edit Travel Story
app.post("/editTravel/:id", authenticateToken, async (req, res) => {

    const { id } = req.params;
    const { title, story, visitedLocation, imageUrl, visitedDate } = req.body;
    const { userId } = req.user;
    if (!title || !story || !visitedLocation || !visitedDate) {
        return res.status(400).json({ error: true, message: "All fields are required" });
    }
    const parseVisitedDate = new Date(parseInt(visitedDate));
    try {
        const travelStory = await Travel.findOne({ _id: id, userId: userId });
        if (!travelStory) {
            res.status(404).json({ error: true, message: "Travel story not found" });
        }
        const defaultImage = `http://localhost:8000/assets/travelstory.jpg`;

        travelStory.title = title;
        travelStory.story = story;
        travelStory.visitedLocation = visitedLocation;
        travelStory.imageUrl = imageUrl || defaultImage;
        travelStory.visitedDate = parseVisitedDate;

        await travelStory.save();
        res.status(200).json({ story: travelStory, message: "Update Successful" });

    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
});

//Delete Travel Story
app.post("/deleteTravel/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    try {
        const travelStory = await Travel.findOne({ _id: id, userId: userId });
        if (!travelStory) {
            res.status(404).json({ error: true, message: "Travel story not found" });
        }
        await travelStory.deleteOne({ _id: id, userId: userId });
        //Extract the filename from the database
        const imageUrl = travelStory.imageUrl;
        const filename = path.basename(imageUrl);

        //Define the file path
        const filePath = path.join(__dirname, 'uploads', filename);

        fs.unlink(filePath, (err) => {
            if (err) {
                console.error("Failed to delete image file:", err);
            }
        });
        res.status(200).json({ message: "Travel story deleted successfully" });
    }
    catch {
        res.status(500).json({ error: true, message: error.message });
    }

});

//Update isFavourite
app.post("/updateFavourite/:id", authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;
    const { isFavourite } = req.body;
    try {
        const travelStory = await Travel.findOne({ _id: id, userId: userId });
        if (!travelStory) {
            res.status(404).json({ error: true, message: "Travel story not found" });
        }
        travelStory.isFavourite = isFavourite;
        await travelStory.save();
        res.status(200).json({ story: travelStory, message: "Update Successfully" });
    } catch (err) {
        res.status(500).json({ error: true, message: error.message });
    }
})

//Search Travel Story
app.get("/search", authenticateToken, async (req, res) => {
    const { query } = req.query;
    const { userId } = req.user;

    if (!query) {
        return res.status(400).json({ err: true, message: "Query is required" });
    }
    try {
        const searchResult = await Travel.find({
            userId: userId,
            $or: [
                { title: { $regex: query, $options: "i" } },
                { story: { $regex: query, $options: "i" } },
                { visitedLocation: { $regex: query, $options: "i" } },
            ],
        }).sort({ isFavourite: -1 });

        res.status(200).json({ stories: searchResult });
    } catch (error) {
        res.status(500).json({ error: true, message: error.message });
    }
})

//Filter travel stories by date range
app.get("/filter", authenticateToken, async (req, res) => {
    const { startDate, endDate } = req.query;
    const { userId } = req.user;

    try {
        const start = new Date(parseInt(startDate));
        const end = new Date(parseInt(endDate));
        const filterStories = await Travel.find({
            userId: userId,
            visitedDate: { $gte: start, $lte: end },
        }).sort({ isFavourite: -1 });

        res.status(200).json({ stories: filterStories })
    } catch (err) {
        res.status(500).json({ error: true, message: error.message });

    }
})
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/assets", express.static(path.join(__dirname, "assets")));


app.listen(8000);
module.exports = app;