# Pill_Drop 💊
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)]() [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)]() [![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)]() [![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)]() [![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=fff)]()

A comprehensive platform built with React, Node.js, Express, and MongoDB, designed to streamline appointment booking and management for both administrators, doctors, and patients. Pill_Drop aims to bridge the gap between healthcare providers and patients, making healthcare more accessible and efficient.

🚀 Live Demo
👉 [Prescripto - Live Website](https://prescripto-frontend-verj.onrender.com/)

## 🌟 Table of Contents
- [🌟 Project Title & Badges](#-project-title--badges)
- [📝 Description](#-description)
- [✨ Features](#-features)
- [💻 Tech Stack](#-tech-stack)
- [🛠️ Installation](#️-installation)
- [🚀 Usage](#-usage)
- [📂 Project Structure](#-project-structure)
- [🔑 API Reference](#-api-reference)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [🔗 Important Links](#-important-links)
- [<footer> Footer](#footer)



## 📝 Description
Pill_Drop is a full-stack web application designed to facilitate online appointment booking with doctors. It provides separate interfaces for administrators, doctors, and patients, each with specific functionalities tailored to their roles. The application leverages modern web technologies such as React, Node.js, Express, and MongoDB to deliver a seamless user experience.



## ✨ Features
- **Admin Panel**: 
    - Manage doctors (add, list, change availability).
    - View and cancel appointments.
    - Monitor dashboard statistics.
- **Doctor Panel**: 
    - Manage appointments (complete, cancel).
    - View profile and update availability.
    - Access dashboard analytics.
- **User Panel**: 
    - Register and Login.
    - Book appointments with available doctors.
    - Manage profile and view appointment history.
    - Online payment via Razorpay.



## 💻 Tech Stack
- **Frontend**: 
    - React: A JavaScript library for building user interfaces.
    - Vite: A build tool that provides a fast and performant development experience.
    - React Router DOM: For handling client-side routing.
    - Tailwind CSS: A utility-first CSS framework for styling.
    - Axios: For making HTTP requests.
    - React Toastify: For displaying toast notifications.

- **Backend**: 
    - Node.js: A JavaScript runtime environment.
    - Express: A web application framework for Node.js.
    - MongoDB: A NoSQL database.
    - Mongoose: An ODM (Object-Document Mapper) for MongoDB.
    - JSON Web Tokens (JWT): For user authentication.
    - Bcrypt: For password hashing.
    - Cors: For enabling Cross-Origin Resource Sharing.
    - Dotenv: For loading environment variables.
    - Multer: For handling file uploads.
    - Nodemon: For automatically restarting the server during development.
    - Razorpay: For processing payments.
    - Validator: For validating data.
    - Cloudinary: For image storage.



## 🛠️ Installation
To set up Pill_Drop locally, follow these steps:

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/Vinayak-P1/Pill_Drop.git
    cd Pill_Drop
    ```

2.  **Install dependencies for the backend**:

    ```bash
    cd backend
    npm install
    ```

3.  **Configure environment variables**:

    Create a `.env` file in the `backend` directory and add the following variables:

    ```
    MONGODB_URI=<your_mongodb_uri>
    JWT_SECRET=<your_jwt_secret>
    ADMIN_EMAIL=<your_admin_email>
    ADMIN_PASSWORD=<your_admin_password>
    CLOUDINARY_NAME=<your_cloudinary_name>
    CLOUDINARY_API_KEY=<your_cloudinary_api_key>
    CLOUDINARY_SECRET_KEY=<your_cloudinary_secret_key>
    RAZORPAY_KEY_ID=<your_razorpay_key_id>
    RAZORPAY_KEY_SECRET=<your_razorpay_key_secret>
    CURRENCY=INR
    PORT=4000
    ```

4.  **Start the backend server**:

    ```bash
    npm run server
    ```

5.  **Install dependencies for the frontend**:

    ```bash
    cd ../frontend
    npm install
    ```

6.  **Configure environment variables for the frontend**:
    Create a `.env` file in the `frontend` directory and add the backend URL:
    ```
    VITE_BACKEND_URL=http://localhost:4000
    ```

7.  **Start the frontend development server**:

    ```bash
    npm run dev
    ```

8.   **Install dependencies for the admin panel**:

    ```bash
    cd ../admin
    npm install
    ```

9.  **Configure environment variables for the admin panel**:
    Create a `.env` file in the `admin` directory and add the backend URL:
    ```
    VITE_BACKEND_URL=http://localhost:4000
    ```

10.  **Start the admin panel development server**:

    ```bash
    npm run dev
    ```



## 🚀 Usage
Pill_Drop is designed to connect patients with doctors through an easy-to-use online platform. Here’s how to use the application:



### Real-World Use Cases:
1.  **Appointment Scheduling**: Patients can easily find doctors by specialty, view their availability, and book appointments online, reducing wait times and improving access to healthcare.
2.  **Remote Consultations**: Doctors can manage their schedules, view patient information, and conduct remote consultations, enhancing efficiency and patient care.
3.  **Healthcare Administration**: Administrators can oversee the entire system, manage doctor profiles, and ensure smooth operation, improving overall healthcare delivery.



### How to Use:
1.  **Accessing the Application**: Open your web browser and navigate to the frontend URL (usually `http://localhost:5173`).
2.  **Register or Log In**: If you are a new user, register for an account. Existing users can log in with their credentials.
3.  **Booking an Appointment**: 
    - Browse doctors by specialty or view all doctors.
    - Select a doctor and view their available slots.
    - Choose a suitable date and time and confirm your appointment.
4.  **Payment**: Pay for the appointment using Razorpay.
5.  **Managing Appointments**: View, cancel, or reschedule appointments from your profile.



### Admin Panel
1.  **Accessing the Admin Panel**: Open your web browser and navigate to the admin panel URL (usually `http://localhost:5174`).
2.  **Login**: Log in using the admin credentials specified in the `.env` file.
3.  **Managing Doctors**: Add new doctors, view existing doctors, and modify their availability.
4.  **Viewing Appointments**: Monitor all appointments and cancel them if necessary.
5.  **Dashboard**: Get an overview of key metrics such as the number of doctors, appointments, and users.



### Doctor Panel
1.  **Accessing the Doctor Panel**: Open your web browser and navigate to the frontend URL (usually `http://localhost:5173`) and login as a Doctor.
2.  **Login**: Log in using the doctor credentials.
3.  **Managing Appointments**: View scheduled appointments and mark them as complete or cancel them.
4.  **Profile**: View and update your profile information.
5.  **Dashboard**: View key metrics such as earnings, number of appointments, and number of patients.



## 📂 Project Structure
The project is structured into three main directories:

```
├── admin/        # React application for admin panel
├── backend/      # Node.js and Express server
└── frontend/     # React application for user interface
```



### Admin Directory
-   `admin/`: Contains the React application for the admin panel.
    -   `admin/src/`: Contains the source code for the admin panel.
        -   `admin/src/components/`: Reusable React components.
        -   `admin/src/context/`: React context providers for state management.
        -   `admin/src/pages/`: React components for different admin pages.
        -   `admin/src/assets/`: Static assets such as images and icons.
    -   `admin/index.html`: Entry point for the admin panel application.
    -   `admin/package.json`: Lists the admin panel's dependencies and scripts.
    -   `admin/vite.config.js`: Configuration file for Vite.



### Backend Directory
-   `backend/`: Contains the Node.js and Express server.
    -   `backend/config/`: Configuration files for the database and other services.
    -   `backend/controllers/`: Contains the route handlers.
    -   `backend/middlewares/`: Contains custom middleware functions.
    -   `backend/models/`: Defines the data models using Mongoose.
    -   `backend/routes/`: Defines the API routes.
    -   `backend/server.js`: Main entry point for the backend server.
    -   `backend/package.json`: Lists the backend's dependencies and scripts.



### Frontend Directory
-   `frontend/`: Contains the React application for the user interface.
    -   `frontend/src/`: Contains the source code for the user interface.
        -   `frontend/src/components/`: Reusable React components.
        -   `frontend/src/context/`: React context providers for state management.
        -   `frontend/src/pages/`: React components for different pages.
        -   `frontend/src/assets/`: Static assets such as images and icons.
    -   `frontend/index.html`: Entry point for the user interface application.
    -   `frontend/package.json`: Lists the frontend's dependencies and scripts.
    -   `frontend/vite.config.js`: Configuration file for Vite.



## 🔑 API Reference
The backend provides the following APIs:



### Admin Routes
-   `POST /api/admin/add-doctor`: Adds a new doctor (requires admin authentication).
-   `POST /api/admin/login`: Logs in an admin.
-   `POST /api/admin/all-doctors`: Retrieves all doctors (requires admin authentication).
-   `POST /api/admin/change-availability`: Changes doctor availability (requires admin authentication).
-   `GET /api/admin/appointments`: Retrieves all appointments (requires admin authentication).
-   `POST /api/admin/cancel-appointment`: Cancels an appointment (requires admin authentication).
-   `GET /api/admin/dashboard`: Retrieves dashboard data (requires admin authentication).



### Doctor Routes
-   `GET /api/doctor/list`: Retrieves a list of doctors.
-   `POST /api/doctor/login`: Logs in a doctor.
-   `GET /api/doctor/appointments`: Retrieves doctor appointments (requires doctor authentication).
-   `POST /api/doctor/complete-appointment`: Marks an appointment as complete (requires doctor authentication).
-   `POST /api/doctor/cancel-appointment`: Cancels an appointment (requires doctor authentication).
-   `GET /api/doctor/dashboard`: Retrieves doctor dashboard data (requires doctor authentication).
-   `GET /api/doctor/profile`: Retrieves doctor profile (requires doctor authentication).
-   `POST /api/doctor/update-profile`: Updates doctor profile (requires doctor authentication).



### User Routes
-   `POST /api/user/register`: Registers a new user.
-   `POST /api/user/login`: Logs in a user.
-   `GET /api/user/get-profile`: Retrieves user profile data (requires user authentication).
-   `POST /api/user/update-profile`: Updates user profile (requires user authentication).
-   `POST /api/user/book-appointment`: Books an appointment (requires user authentication).
-   `GET /api/user/appointments`: Retrieves user appointments (requires user authentication).
-   `POST /api/user/cancel-appointment`: Cancels an appointment (requires user authentication).
-   `POST /api/user/payment-razorpay`: Initiates a Razorpay payment (requires user authentication).
-   `POST /api/user/verifyRazorpay`: Verifies a Razorpay payment (requires user authentication).



## 🤝 Contributing
Contributions are welcome! Here are the steps to contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Commit your changes with descriptive commit messages.
4.  Push your changes to your fork.
5.  Submit a pull request to the main repository.



## 📜 License
This project is under the [No license](https://choosealicense.com/no-permission/).



## 🔗 Important Links
-   **Repository Link**: [https://github.com/Vinayak-P1/Pill_Drop](https://github.com/Vinayak-P1/Pill_Drop)



## <footer> Footer
Made by [Vinayak-P1](https://github.com/Vinayak-P1) ❤️

Feel free to **fork**, **star**, **like** and raise **issues**.


