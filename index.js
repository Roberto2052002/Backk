const tcreator = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // save in uploads/ folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname); // unique file name
  }
});

const upload = multer({ storage });

dotenv.config();
const app = express();
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ Connected to MongoDB Atlas!"))
  .catch((err) => console.error("❌ Failed to connect to MongoDB:", err));

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true }
});

const User = mongoose.model("User", userSchema);

const authUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const AuthUser = mongoose.model("AuthUser", authUserSchema);

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header missing." });
  }

  const token = authHeader.split(" ")[1];

  tcreator.verify(token, process.env.PASSCODE, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Invalid or expired token." });
    }

    req.user = decoded;
    next();
  });
};

app.post("/register", async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // 2. Check if email already exists
    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    // 3. Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save new user
    const newUser = new AuthUser({ email, password: hashedPassword });
    const savedUser = await newUser.save();

    // 5. Return success
    res.status(201).json({ message: "User registered successfully!", userId: savedUser._id });

  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register user." });
  }
});


app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // 1. Validate input
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // 2. Find the user
    const existingUser = await AuthUser.findOne({ email });
    if (!existingUser) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 3. Compare passwords
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // 4. Generate a token
    const token = tcreator.sign(
      { userId: existingUser._id, email: existingUser.email },
      process.env.PASSCODE,
      { expiresIn: "1h" }
    );

    // 5. Return token
    res.json({ message: "Login successful!", token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: err.message });;
  }
});

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded." });
  }

  res.status(201).json({
    message: "File uploaded successfully!",
    filename: req.file.filename,
    path: req.file.path
  });
});

app.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "You have access!", user: req.user });
});

app.post("/users", verifyToken, async (req, res) => {
  const newEntry = req.body;

  if (!newEntry.name || typeof newEntry.name !== "string") {
    res.status(400).json({ error: "Name is required and must be a string." });
    return;
  }

  if (!newEntry.age || typeof newEntry.age !== "number") {
    res.status(400).json({ error: "Age is required and must be a number." });
    return;
  }

  try {
    const createdUser = new User(newEntry);
    const savedUser = await createdUser.save();

    res.status(201).json({ message: "User saved to MongoDB!", data: savedUser });
  } catch (err) {
    console.error("MongoDB save error:", err);
    res.status(500).json({ error: "Failed to save user to MongoDB." });
  }
});

app.put("/users/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  const updateData = req.body;

  if (updateData.name && typeof updateData.name !== "string") {
    res.status(400).json({ error: "Name must be a string." });
    return;
  }

  if (updateData.age && typeof updateData.age !== "number") {
    res.status(400).json({ error: "Age must be a number." });
    return;
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true, // return the updated document
      runValidators: true // make sure schema rules still apply
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User updated successfully!", data: updatedUser });

  } catch (err) {
    console.error("MongoDB update error:", err);
    res.status(500).json({ error: "Failed to update user in MongoDB." });
  }
});

app.get("/users/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error("MongoDB fetch error:", err);
    res.status(500).json({ error: "Failed to fetch user from MongoDB." });
  }
});

app.delete("/users/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: `User with ID ${userId} deleted.` });

  } catch (err) {
    console.error("MongoDB delete error:", err);
    res.status(500).json({ error: "Failed to delete user from MongoDB." });
  }
});

app.get("/users", verifyToken, async (req, res) => {
  try {
    let userList = await User.find();

    if (req.query.name) {
      const nameSearch = req.query.name.toLowerCase();
      userList = userList.filter((entry) =>
        entry.name.toLowerCase().includes(nameSearch)
      );
    }

    if (req.query.minAge) {
      const minAge = parseInt(req.query.minAge);
      userList = userList.filter((entry) => entry.age >= minAge);
    }

    if (req.query.sortBy) {
      const sortField = req.query.sortBy;
      let direction = 1;
      if (req.query.order === "desc") direction = -1;

      userList.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1 * direction;
        if (a[sortField] > b[sortField]) return 1 * direction;
        return 0;
      });
    }

    if (req.query.limit) {
      const limit = parseInt(req.query.limit);
      let skip = 0;

      if (req.query.skip) {
        skip = parseInt(req.query.skip);
      }

      userList = userList.slice(skip, skip + limit);
    }

    res.json(userList);

  } catch (err) {
    console.error("MongoDB fetch error:", err);
    res.status(500).json({ error: "Failed to fetch users from MongoDB." });
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});



