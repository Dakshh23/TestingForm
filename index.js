const express=require("express");
const app=express();
const mon=require("mongoose");
const zod=require("zod");
const cors=require("cors");
app.use(cors());
// Add CORS middleware
// CORS configuration
app.use((req, res, next) => {
    const allowedOrigins = [
        'https://testingform-production.up.railway.app',
        'http://localhost:3000',
        'http://localhost:8000'
    ];
    const origin = req.headers.origin;
    
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    next();
});

const PORT=process.env.PORT || 3000;


const emailSchema=zod.string().email();
const passwordSchema=zod.string().min(8);

mon.connect("mongodb+srv://system:nHmqOQyvgo8fhLe6@cluster69.o8sj6b0.mongodb.net/users");

// Serve static files from the current directory
app.use(express.static("./"));

const User=mon.model("User",
    new mon.Schema({username:String,email:String,password:String}));

app.use(express.json());

app.post("/signup",async function(req,res){
    const {username,email,password}=req.body;
    try{
        const result=emailSchema.safeParse(email);
        const result2=passwordSchema.safeParse(password);
        
        if(!result.success || !result2.success){
            return res.status(400).json({
                success: false,
                message: "Invalid email or password format"
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const newUser=new User({username,email,password});
        await newUser.save();
        
        res.status(201).json({
            success: true,
            message: "User created successfully"
        });
    } catch(e){
        console.error("Signup error:", e);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
});

app.listen(PORT,()=>console.log(`Listening on port ${PORT}`));