# 🚀 Complete ERP Development Guide

## Overview
This guide will help you transform your frontend prototype into a **production-ready Enterprise ERP system** with backend, database, authentication, and advanced features.

---

## 📋 Table of Contents
1. [Phase 1: Setup & Foundation](#phase-1-setup--foundation)
2. [Phase 2: Backend API Development](#phase-2-backend-api-development)
3. [Phase 3: Database & Models](#phase-3-database--models)
4. [Phase 4: Authentication System](#phase-4-authentication-system)
5. [Phase 5: Frontend Integration](#phase-5-frontend-integration)
6. [Phase 6: Advanced Features](#phase-6-advanced-features)
7. [Phase 7: Testing & Deployment](#phase-7-testing--deployment)

---

## 🔧 PHASE 1: Setup & Foundation

### Step 1.1: Initialize Project

```bash
# Create project folder
mkdir vk-group-erp
cd vk-group-erp

# Initialize Node.js project
npm init -y

# Install core dependencies
npm install express mongoose bcryptjs jsonwebtoken dotenv cors multer
npm install --save-dev nodemon prettier eslint

# Create folder structure
mkdir backend frontend public config models routes controllers middleware uploads
```

### Step 1.2: Create `.env` file

```env
# Backend Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/vk-group-erp
DB_NAME=vk-group-erp

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRE=7d

# Email (Optional - for later)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
```

### Step 1.3: Create `package.json` scripts

```json
{
  "scripts": {
    "start": "node backend/server.js",
    "dev": "nodemon backend/server.js",
    "test": "jest --coverage",
    "lint": "eslint ."
  }
}
```

---

## 🔌 PHASE 2: Backend API Development

### Step 2.1: Create Main Server File

**File: `backend/server.js`**

```javascript
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/departments', require('./routes/departmentRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));
app.use('/api/work', require('./routes/workRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/recruitment', require('./routes/recruitmentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

module.exports = app;
```

### Step 2.2: Create Config File

**File: `config/database.js`**

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 📊 PHASE 3: Database & Models

### Step 3.1: User/Employee Model

**File: `models/User.js`**

```javascript
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Info
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /.+\@.+\..+/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  
  // Employee Info
  employeeId: {
    type: String,
    unique: true,
    sparse: true
  },
  designation: {
    type: String,
    enum: [
      'Owner', 'Chairman', 'Chairman_Assistant',
      'CEO', 'CEO_Assistant', 'CTO', 'CFO', 'COO',
      'VP', 'Director', 'Senior_Manager', 'Manager',
      'Team_Leader', 'Senior_Employee', 'Employee',
      'Junior_Employee', 'Intern'
    ],
    required: true
  },
  level: {
    type: Number,
    required: true,
    min: 1,
    max: 13
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  reportingManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Permissions
  permissions: {
    canViewFinance: Boolean,
    canAssignWork: Boolean,
    canRecruit: Boolean,
    canViewAll: Boolean,
    canApprove: Boolean,
    canManageUsers: Boolean
  },
  
  // Status
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'On_Leave', 'Terminated'],
    default: 'Active'
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get user data without password
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
```

### Step 3.2: Department Model

**File: `models/Department.js`**

```javascript
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    unique: true,
    sparse: true
  },
  description: String,
  manager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  budget: {
    type: Number,
    default: 0
  },
  headCount: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Department', departmentSchema);
```

### Step 3.3: Work Assignment Model

**File: `models/Work.js`**

```javascript
const mongoose = require('mongoose');

const workSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In_Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  dueDate: Date,
  completedDate: Date,
  attachments: [String],
  comments: [{
    user: mongoose.Schema.Types.ObjectId,
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Work', workSchema);
```

### Step 3.4: Finance Model

**File: `models/Finance.js`**

```javascript
const mongoose = require('mongoose');

const financeSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  transactionType: {
    type: String,
    enum: ['Revenue', 'Expense', 'Investment'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  category: String,
  description: String,
  month: {
    type: String,
    default: () => new Date().toISOString().slice(0, 7)
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Finance', financeSchema);
```

### Step 3.5: Recruitment Model

**File: `models/Recruitment.js`**

```javascript
const mongoose = require('mongoose');

const recruitmentSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  level: Number,
  noOfPositions: Number,
  salaryRange: String,
  description: String,
  requirements: String,
  status: {
    type: String,
    enum: ['Open', 'Closed', 'Filled'],
    default: 'Open'
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  applications: [{
    candidateName: String,
    email: String,
    resume: String,
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, enum: ['Pending', 'Shortlisted', 'Rejected'], default: 'Pending' }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Recruitment', recruitmentSchema);
```

---

## 🔐 PHASE 4: Authentication System

### Step 4.1: JWT Middleware

**File: `middleware/auth.js`**

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

module.exports = authMiddleware;
```

### Step 4.2: Role-Based Access Control

**File: `middleware/roleCheck.js`**

```javascript
const roleCheck = (requiredPermission) => {
  return (req, res, next) => {
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Unauthorized' 
      });
    }
    
    // Check permission based on user level and role
    const hasPermission = checkPermission(user, requiredPermission);
    
    if (!hasPermission) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied - insufficient permissions' 
      });
    }
    
    next();
  };
};

const checkPermission = (user, permission) => {
  const permissionMap = {
    'VIEW_FINANCE': user.level <= 4,
    'ASSIGN_WORK': user.level <= 9,
    'RECRUIT': user.level <= 6,
    'MANAGE_USERS': user.level <= 3,
    'VIEW_ALL': user.level <= 2,
    'APPROVE': user.level <= 8
  };
  
  return permissionMap[permission] || false;
};

module.exports = roleCheck;
```

### Step 4.3: Authentication Routes

**File: `routes/authRoutes.js`**

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, designation, level, department } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }
    
    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password,
      designation,
      level,
      department,
      employeeId: `EMP${Date.now()}`,
      permissions: getPermissionsByLevel(level)
    });
    
    await user.save();
    
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, level: user.level },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user._id, email: user.email, level: user.level },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET CURRENT USER
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('department')
      .populate('reportingManager');
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// LOGOUT
router.post('/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// Helper function to set permissions by level
const getPermissionsByLevel = (level) => {
  return {
    canViewFinance: level <= 4,
    canAssignWork: level <= 9,
    canRecruit: level <= 6,
    canViewAll: level <= 2,
    canApprove: level <= 8,
    canManageUsers: level <= 3
  };
};

module.exports = router;
```

---

## 👥 PHASE 5: Employee Routes & Controller

### Step 5.1: Employee Controller

**File: `controllers/employeeController.js`**

```javascript
const User = require('../models/User');
const Department = require('../models/Department');

// GET ALL EMPLOYEES
exports.getAllEmployees = async (req, res) => {
  try {
    const { department, level, status, search } = req.query;
    let filter = {};
    
    if (department) filter.department = department;
    if (level) filter.level = level;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const employees = await User.find(filter)
      .populate('department')
      .populate('reportingManager')
      .select('-password');
    
    res.json({ success: true, count: employees.length, employees });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET EMPLOYEE BY ID
exports.getEmployeeById = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id)
      .populate('department')
      .populate('reportingManager')
      .select('-password');
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({ success: true, employee });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE EMPLOYEE
exports.createEmployee = async (req, res) => {
  try {
    const { firstName, lastName, email, password, designation, level, department, reportingManager } = req.body;
    
    let employee = await User.findOne({ email });
    if (employee) {
      return res.status(400).json({ success: false, message: 'Employee with this email already exists' });
    }
    
    employee = new User({
      firstName,
      lastName,
      email,
      password,
      designation,
      level,
      department,
      reportingManager,
      employeeId: `EMP${Date.now()}`,
      permissions: getPermissionsByLevel(level)
    });
    
    await employee.save();
    
    res.status(201).json({ 
      success: true, 
      message: 'Employee created successfully',
      employee: employee.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE EMPLOYEE
exports.updateEmployee = async (req, res) => {
  try {
    let employee = await User.findById(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    const { firstName, lastName, designation, level, department, status, reportingManager } = req.body;
    
    if (firstName) employee.firstName = firstName;
    if (lastName) employee.lastName = lastName;
    if (designation) employee.designation = designation;
    if (level) {
      employee.level = level;
      employee.permissions = getPermissionsByLevel(level);
    }
    if (department) employee.department = department;
    if (status) employee.status = status;
    if (reportingManager !== undefined) employee.reportingManager = reportingManager;
    
    employee.updatedAt = Date.now();
    await employee.save();
    
    res.json({ 
      success: true, 
      message: 'Employee updated successfully',
      employee: employee.toJSON()
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE EMPLOYEE
exports.deleteEmployee = async (req, res) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    res.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPermissionsByLevel = (level) => {
  return {
    canViewFinance: level <= 4,
    canAssignWork: level <= 9,
    canRecruit: level <= 6,
    canViewAll: level <= 2,
    canApprove: level <= 8,
    canManageUsers: level <= 3
  };
};

module.exports = exports;
```

### Step 5.2: Employee Routes

**File: `routes/employeeRoutes.js`**

```javascript
const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

// Public routes
router.get('/', authMiddleware, employeeController.getAllEmployees);
router.get('/:id', authMiddleware, employeeController.getEmployeeById);

// Protected routes - Manager level or above
router.post('/', authMiddleware, roleCheck('MANAGE_USERS'), employeeController.createEmployee);
router.put('/:id', authMiddleware, roleCheck('MANAGE_USERS'), employeeController.updateEmployee);
router.delete('/:id', authMiddleware, roleCheck('MANAGE_USERS'), employeeController.deleteEmployee);

module.exports = router;
```

---

## 💼 PHASE 6: Work & Finance Routes

### Step 6.1: Work Assignment Controller

**File: `controllers/workController.js`**

```javascript
const Work = require('../models/Work');

exports.getAllWork = async (req, res) => {
  try {
    const { status, assignedTo, assignedBy, priority } = req.query;
    let filter = {};
    
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (assignedBy) filter.assignedBy = assignedBy;
    if (priority) filter.priority = priority;
    
    const work = await Work.find(filter)
      .populate('assignedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('department', 'name')
      .sort('-createdAt');
    
    res.json({ success: true, count: work.length, work });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createWork = async (req, res) => {
  try {
    const { title, description, assignedTo, department, priority, dueDate } = req.body;
    
    const work = new Work({
      title,
      description,
      assignedBy: req.user.id,
      assignedTo,
      department,
      priority,
      dueDate
    });
    
    await work.save();
    await work.populate('assignedBy assignedTo department');
    
    res.status(201).json({ success: true, work });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateWorkStatus = async (req, res) => {
  try {
    const { status, completedDate } = req.body;
    
    const work = await Work.findByIdAndUpdate(
      req.params.id,
      { status, completedDate: status === 'Completed' ? Date.now() : null, updatedAt: Date.now() },
      { new: true }
    ).populate('assignedBy assignedTo department');
    
    if (!work) {
      return res.status(404).json({ success: false, message: 'Work not found' });
    }
    
    res.json({ success: true, work });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
```

### Step 6.2: Finance Controller

**File: `controllers/financeController.js`**

```javascript
const Finance = require('../models/Finance');

exports.getFinancialOverview = async (req, res) => {
  try {
    const { month, department } = req.query;
    let filter = {};
    
    if (month) filter.month = month;
    if (department) filter.department = department;
    
    const financials = await Finance.find(filter)
      .populate('department', 'name')
      .populate('createdBy', 'firstName lastName');
    
    // Calculate summary
    const revenue = financials
      .filter(f => f.transactionType === 'Revenue')
      .reduce((sum, f) => sum + f.amount, 0);
    
    const expense = financials
      .filter(f => f.transactionType === 'Expense')
      .reduce((sum, f) => sum + f.amount, 0);
    
    const profit = revenue - expense;
    const margin = revenue > 0 ? ((profit / revenue) * 100).toFixed(2) : 0;
    
    res.json({
      success: true,
      summary: { revenue, expense, profit, margin },
      financials
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.addTransaction = async (req, res) => {
  try {
    const { department, transactionType, amount, category, description } = req.body;
    
    const transaction = new Finance({
      department,
      transactionType,
      amount,
      category,
      description,
      createdBy: req.user.id
    });
    
    await transaction.save();
    
    res.status(201).json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
```

### Step 6.3: Routes Files

**File: `routes/workRoutes.js`**

```javascript
const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const workController = require('../controllers/workController');

const router = express.Router();

router.get('/', authMiddleware, workController.getAllWork);
router.post('/', authMiddleware, roleCheck('ASSIGN_WORK'), workController.createWork);
router.put('/:id', authMiddleware, workController.updateWorkStatus);

module.exports = router;
```

**File: `routes/financeRoutes.js`**

```javascript
const express = require('express');
const authMiddleware = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const financeController = require('../controllers/financeController');

const router = express.Router();

router.get('/', authMiddleware, roleCheck('VIEW_FINANCE'), financeController.getFinancialOverview);
router.post('/', authMiddleware, roleCheck('VIEW_FINANCE'), financeController.addTransaction);

module.exports = router;
```

---

## 📈 PHASE 7: Dashboard & Analytics Routes

### Step 7.1: Dashboard Controller

**File: `controllers/dashboardController.js`**

```javascript
const User = require('../models/User');
const Work = require('../models/Work');
const Finance = require('../models/Finance');
const Department = require('../models/Department');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalEmployees = await User.countDocuments({ status: 'Active' });
    const totalDepartments = await Department.countDocuments();
    const activeTasks = await Work.countDocuments({ status: { $in: ['Pending', 'In_Progress'] } });
    const completedTasks = await Work.countDocuments({ status: 'Completed' });
    
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyFinance = await Finance.aggregate([
      { $match: { month: currentMonth } },
      {
        $group: {
          _id: '$transactionType',
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalEmployees,
        totalDepartments,
        activeTasks,
        completedTasks,
        monthlyFinance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getChartData = async (req, res) => {
  try {
    // Employees by department
    const employeesByDept = await User.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: '_id',
          foreignField: '_id',
          as: 'dept'
        }
      }
    ]);
    
    // Employees by level
    const employeesByLevel = await User.aggregate([
      {
        $group: {
          _id: '$level',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    // Tasks by status
    const tasksByStatus = await Work.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      charts: {
        employeesByDept,
        employeesByLevel,
        tasksByStatus
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = exports;
```

**File: `routes/dashboardRoutes.js`**

```javascript
const express = require('express');
const authMiddleware = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

router.get('/stats', authMiddleware, dashboardController.getDashboardStats);
router.get('/charts', authMiddleware, dashboardController.getChartData);

module.exports = router;
```

---

## 🎨 PHASE 8: Updated Frontend with API Integration

### Step 8.1: New HTML/JS (Enhanced Version)

**File: `public/index.html`** (Replace your old file)

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>VK Group Corporate ERP</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--main:#2563eb;--main-dark:#1e40af;--main-light:#dbeafe;--bg:#f8fafc;--card:#fff;--text:#1e293b;--text-light:#64748b;--border:#e2e8f0;--green:#10b981;--red:#ef4444;--orange:#f97316}
body{font-family:'Segoe UI',Arial,sans-serif;background:var(--bg);color:var(--text)}
.container{max-width:1400px;margin:0 auto;padding:20px}
.dashboard{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:20px}
.stat-card{background:var(--card);border-radius:10px;padding:20px;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.stat-card h3{color:var(--main);margin-bottom:10px}
.stat-card .value{font-size:28px;font-weight:bold;color:var(--main)}
.chart-container{background:var(--card);padding:20px;border-radius:10px;margin:20px 0;box-shadow:0 2px 10px rgba(0,0,0,0.1)}
.btn{padding:10px 20px;background:var(--main);color:white;border:none;border-radius:5px;cursor:pointer;font-weight:600}
.btn:hover{background:var(--main-dark)}
</style>
</head>
<body>

<div class="container">
  <h1>VK Group ERP Dashboard</h1>
  
  <div class="dashboard" id="statsContainer"></div>
  
  <div class="chart-container">
    <h2>Employees by Level</h2>
    <canvas id="employeesByLevelChart"></canvas>
  </div>
  
  <div class="chart-container">
    <h2>Tasks by Status</h2>
    <canvas id="tasksByStatusChart"></canvas>
  </div>
</div>

<script>
const API_BASE = 'http://localhost:5000/api';
let token = localStorage.getItem('authToken');

async function loadDashboard() {
  if (!token) {
    window.location.href = 'login.html';
    return;
  }
  
  try {
    // Load stats
    const statsRes = await fetch(`${API_BASE}/dashboard/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const statsData = await statsRes.json();
    
    // Display stats
    const statsHTML = `
      <div class="stat-card">
        <h3>Total Employees</h3>
        <div class="value">${statsData.stats.totalEmployees}</div>
      </div>
      <div class="stat-card">
        <h3>Departments</h3>
        <div class="value">${statsData.stats.totalDepartments}</div>
      </div>
      <div class="stat-card">
        <h3>Active Tasks</h3>
        <div class="value">${statsData.stats.activeTasks}</div>
      </div>
      <div class="stat-card">
        <h3>Completed Tasks</h3>
        <div class="value">${statsData.stats.completedTasks}</div>
      </div>
    `;
    document.getElementById('statsContainer').innerHTML = statsHTML;
    
    // Load chart data
    const chartsRes = await fetch(`${API_BASE}/dashboard/charts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const chartsData = await chartsRes.json();
    
    // Draw charts
    drawChart('employeesByLevelChart', chartsData.charts.employeesByLevel);
    drawChart('tasksByStatusChart', chartsData.charts.tasksByStatus);
  } catch (error) {
    console.error('Error loading dashboard:', error);
  }
}

function drawChart(canvasId, data) {
  const ctx = document.getElementById(canvasId).getContext('2d');
  const labels = data.map(d => d._id);
  const values = data.map(d => d.count);
  
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Count',
        data: values,
        backgroundColor: '#2563eb'
      }]
    }
  });
}

loadDashboard();
</script>

</body>
</html>
```

---

## ✅ PHASE 9: Testing

### Step 9.1: Basic API Test File

**File: `tests/api.test.js`**

```javascript
const request = require('supertest');
const app = require('../backend/server');

describe('API Tests', () => {
  let token;
  
  // Test authentication
  test('POST /api/auth/register - Should register new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
        designation: 'Employee',
        level: 11
      });
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    token = res.body.token;
  });
  
  test('POST /api/auth/login - Should login user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
  
  // Test employees endpoint
  test('GET /api/employees - Should get all employees', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

---

## 🚀 PHASE 10: Deployment

### Step 10.1: MongoDB Atlas Setup

```bash
# 1. Go to https://www.mongodb.com/cloud/atlas
# 2. Create account and cluster
# 3. Update .env file:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/vk-group-erp
```

### Step 10.2: Heroku Deployment

```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create Heroku app
heroku create vk-group-erp

# Set environment variables
heroku config:set JWT_SECRET=your_secret_key
heroku config:set MONGODB_URI=your_mongodb_uri

# Deploy
git push heroku main
```

---

## 📚 Project Structure

```
vk-group-erp/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── workRoutes.js
│   │   ├── financeRoutes.js
│   │   └── dashboardRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── employeeController.js
│   │   ├── workController.js
│   │   ├── financeController.js
│   │   └── dashboardController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Department.js
│   │   ├── Work.js
│   │   ├── Finance.js
│   │   └── Recruitment.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── roleCheck.js
│   └── config/
│       └── database.js
├── public/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   └── employees.html
├── tests/
│   └── api.test.js
├── .env
├── .gitignore
├── package.json
└── README.md
```

---

## 🎯 Next Steps

1. **Setup MongoDB locally or Atlas**
2. **Install all dependencies**
3. **Run backend: `npm run dev`**
4. **Test APIs with Postman**
5. **Build frontend components**
6. **Add more features**
7. **Deploy to production**

---

## 📖 Useful Resources

- Express.js: https://expressjs.com/
- Mongoose: https://mongoosejs.com/
- JWT: https://jwt.io/
- REST API Best Practices: https://restfulapi.net/
- Chart.js: https://www.chartjs.org/
