# AdvocaOne

AdvocaOne is a web based legal consultation and appointment booking project.

The main idea of this project is to provide a platform where users can find lawyers, check their profiles, and book appointments with them. Lawyers can manage their appointments, availability and profile from their dashboard.

I am currently working on the frontend of the project. The frontend is developed using React and Vite. Later, I will connect the frontend with a Java Spring Boot backend and PostgreSQL database.

## Project Objective

The main objective of AdvocaOne is to make the process of finding a lawyer and booking a legal consultation easier.

The application has different sections for:

- Users
- Lawyers
- Admin

Users can search and view lawyers and book appointments.

Lawyers can manage their profile, availability and appointments.

Admin can manage lawyer related information.

## Features
- User Features
- Lawyer Features
- Admin Features

## Technologies Used

### Frontend

- React.js
- Vite
- JavaScript
- HTML
- CSS
- Bootstrap
- React Router
- LocalStorage

### Backend (Planned)

- Java
- Spring Boot
- Spring Security
- REST API
- JWT
- PostgreSQL


## Appointment Flow

The current appointment flow is:


User
  ↓
Select Lawyer
  ↓
View Lawyer Profile
  ↓
Select Date and Time
  ↓
Book Appointment
  ↓
Pending
  ↓
Lawyer Confirms
  ↓
Confirmed
  ↓
Appointment
  ↓
Completed


An appointment can also be cancelled or rejected depending on its status.

## Double Booking Protection

The application also checks whether the selected lawyer already has an appointment for the same date and time.

If the slot is already booked, another user cannot book the same slot.

## Data Storage

At the current frontend development stage, I am using browser LocalStorage to store the application data.

Some of the LocalStorage keys used in the project are:


advocaOneBookings
advocaOneLawyerProfile
advocaOneAdminLawyers
advocaOneAvailability
token


This is currently being used for testing the frontend.

In the future, this data will be stored in the backend database.

## How to Run the Project

First clone the repository:


git clone https://github.com/rathodmahesh010102-coder/AdvocaOne.git


Go inside the project:

cd AdvocaOne


Go to the frontend folder:


cd frontend


Install the required packages:


npm install


Start the development server:


npm run dev


After running the command, open the local URL shown in the terminal.

## Future Work

I am planning to add the backend using Java and Spring Boot.

Future development includes:

- Spring Boot backend
- PostgreSQL database
- REST APIs
- JWT authentication
- Spring Security
- Role based authentication
- User and lawyer database
- Appointment database
- Online payment
- Notifications
- Document management
- Case management
- Client portal
- Lawyer portal
- AI based legal assistance

## Current Status

The frontend is currently under development.

I have implemented and tested the main user appointment flow, lawyer dashboard features, appointment status management, cancellation, rescheduling and double booking protection.

The next major part of the project is connecting the frontend with the Java Spring Boot backend.

## Developer

**Mahesh Rathod**

Computer Science Engineering Student

Interested in Java Full Stack Development.

## Note

This project is currently under development and some features may change as I continue working on the project.
