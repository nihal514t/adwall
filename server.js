const express = require('express');
const path = require('path');
const session = require('express-session');
const app = express();
const port = 3000;

// Sample user credentials for login (you can change these)
const USER_CREDENTIALS = { username: 'mikku1ee', password: 'Mikku@admin786#' };

// Initialize 784 box data (28 rows x 28 columns)
let boxData = Array(784).fill(null).map((_, index) => ({
  id: index + 1,
  imageUrl: null,
  redirectUrl: null,
  isSold: false,
  row: Math.floor(index / 28) + 1,  // Calculate row (1-based)
  col: (index % 28) + 1            // Calculate column (1-based)
}));

// Middleware to serve static files and parse JSON
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Session setup
app.use(session({
  secret: 'secret-key',  // Change this key for production
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,    // Makes the cookie accessible only by the web server
    secure: false,     // Change to true in production if using HTTPS
    maxAge: 1000 * 60 * 60 * 24,  // 1 day cookie expiration
  },
}));

// Serve the index.html at root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Login page route (serve a login page)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Handle login form submission
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  console.log('Login attempt:', username, password); // Debug log

  // Validate the credentials
  if (username === USER_CREDENTIALS.username && password === USER_CREDENTIALS.password) {
    req.session.loggedIn = true;  // Set session for logged-in user
    console.log('Login successful, session:', req.session); // Debug log
    res.redirect('/admin');  // Redirect to the admin page
  } else {
    console.log('Invalid login attempt'); // Debug log
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');  // Redirect to login page after logout
  });
});

// Serve the admin panel (for updating boxes, etc.) - only if logged in
app.get('/admin', (req, res) => {
  if (req.session.loggedIn) {
    console.log('Admin access granted');  // Debug log
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));  // Serve admin.html if logged in
  } else {
    console.log('Unauthorized access attempt to /admin');  // Debug log
    res.redirect('/login');  // Redirect to login page if not logged in
  }
});

// Endpoint to fetch all box data
app.get('/get-boxes', (req, res) => {
  res.json(boxData);  // Send the box data as JSON
});

// Endpoint to update box data (for example: marking a box as sold)
app.post('/update-box', (req, res) => {
  const { row, column, imageUrl, redirectUrl } = req.body;
  const boxIndex = (row - 1) * 28 + (column - 1);

  if (boxData[boxIndex]) {
    boxData[boxIndex].imageUrl = imageUrl;
    boxData[boxIndex].redirectUrl = redirectUrl;
    boxData[boxIndex].isSold = true;

    res.status(200).send({ message: `Box [Row ${row}, Column ${column}] updated successfully!` });
  } else {
    res.status(404).send({ message: 'Box not found.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
