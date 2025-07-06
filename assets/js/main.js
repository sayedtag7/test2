// DOM Elements
const registrationForm = document.getElementById('registrationForm');
const loginForm = document.getElementById('loginForm');
const bookingForm = document.getElementById('bookingForm');
const availableRooms = document.getElementById('availableRooms');
const showLoginLink = document.getElementById('showLogin');
const showRegisterLink = document.getElementById('showRegister');
const roomsList = document.getElementById('roomsList');
const roomTypeSelect = document.getElementById('roomType');

let token = null;

// Event Listeners
document.getElementById('registerForm').addEventListener('submit', handleRegister);
document.getElementById('loginForm').addEventListener('submit', handleLogin);
document.getElementById('bookForm').addEventListener('submit', handleBooking);
showLoginLink.addEventListener('click', toggleForms);
showRegisterLink.addEventListener('click', toggleForms);

// Toggle between registration and login forms
function toggleForms(e) {
    e.preventDefault();
    registrationForm.classList.toggle('hidden');
    loginForm.classList.toggle('hidden');
}

// Handle registration
async function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Input validation
    if (!username || !email || !password) {
        alert('Please fill in all fields');
        return;
    }

    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Registration successful! Please login.');
            toggleForms(e);
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred during registration. Please try again.');
    }
}

// Handle login
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        alert('Please fill in all fields');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            token = data.token;
            loginForm.classList.add('hidden');
            bookingForm.classList.remove('hidden');
            availableRooms.classList.remove('hidden');
            loadAvailableRooms();
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred during login. Please try again.');
    }
}

// Load available rooms
async function loadAvailableRooms() {
    try {
        const response = await fetch('http://localhost:3000/api/rooms');
        const rooms = await response.json();

        roomsList.innerHTML = '';
        roomTypeSelect.innerHTML = '<option value="">Select a room type</option>';

        rooms.forEach(room => {
            // Add room to the list
            const roomCard = document.createElement('div');
            roomCard.className = 'room-card';
            roomCard.innerHTML = `
                <h3>Room ${room.room_number}</h3>
                <p>Type: ${room.type}</p>
                <p>Price: $${room.price}/night</p>
            `;
            roomsList.appendChild(roomCard);

            // Add room to select options
            const option = document.createElement('option');
            option.value = room.id;
            option.textContent = `Room ${room.room_number} - ${room.type} ($${room.price}/night)`;
            roomTypeSelect.appendChild(option);
        });
    } catch (error) {
        alert('Failed to load available rooms');
    }
}

// Handle booking
async function handleBooking(e) {
    e.preventDefault();
    const roomId = document.getElementById('roomType').value;
    const checkIn = document.getElementById('checkIn').value;
    const checkOut = document.getElementById('checkOut').value;

    if (!roomId || !checkIn || !checkOut) {
        alert('Please fill in all fields');
        return;
    }

    if (!token) {
        alert('Please login first');
        return;
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();

    if (checkInDate < today) {
        alert('Check-in date cannot be in the past');
        return;
    }

    if (checkOutDate <= checkInDate) {
        alert('Check-out date must be after check-in date');
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/book', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ room_id: roomId, check_in: checkIn, check_out: checkOut })
        });

        const data = await response.json();
        if (response.ok) {
            alert('Booking successful!');
            loadAvailableRooms();
        } else {
            alert(data.error || 'Booking failed');
        }
    } catch (error) {
        console.error('Booking error:', error);
        alert('An error occurred during booking. Please try again.');
    }
} 