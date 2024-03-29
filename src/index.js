const env = require("dotenv");
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const useRoutes = require("./routes/user");
const adminRoutes = require("./routes/admin/auth");
const cors = require('cors');
const path = require("path");
// import router from './routes/user';

//initializing environment variables
env.config();


//MongoDB connection
//mongodb+srv://root:<password>@cluster0.anmlv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority

// mongodb://vbank123:Ipw48fS97wvWZWSVgXaWq4agclhydzRgQFbcHNPUxSuFFpWkkKCW1PIvtkDVPDF1kgWGCSvcyhAOACDbiFZ3lg==@vbank123.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@vbank123@

mongoose.connect("mongodb+srv://barge237:Tejas123@cluster0.twxwkha.mongodb.net/VBank?retryWrites=true&w=majority").then(() => {
    console.log('DataBase Connected');
});
app.use(cors());
app.use(express.json());
app.use('/api', useRoutes);
app.use('/api', adminRoutes);

// Serve the frontend
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/build")));
    app.get("*", (req, res) =>
      res.sendFile(
        path.resolve(__dirname, "../", "frontend", "build", "index.html")
      )
    );
  } else {
    app.get("/", (req, res) => res.send("Please set to production"));
  }

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});