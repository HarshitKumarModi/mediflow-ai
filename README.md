# MediFlow AI 🏥

An AI-powered healthcare management platform connecting patients, doctors, and administrators through a secure full-stack web application.

🚀 **Live Demo:** https://mediflow-frontend-os85.onrender.com

## Features

### 👤 Patient Portal
- Patient registration and JWT-based authentication
- Browse available doctors
- Book appointments based on doctor schedules
- View appointments and medical records
- Manage medications and reminders
- AI-assisted pre-visit summaries

### 👨‍⚕️ Doctor Portal
- Doctor authentication and profile management
- Configure weekly working hours
- Manage appointments
- View patient medical records
- Generate AI-assisted post-visit summaries

### 🛡️ Admin Portal
- Manage users and doctors
- View platform analytics
- Monitor appointments and system activity

### 🤖 AI Integration
- FastAPI-based AI microservice
- OpenAI-powered pre-visit and post-visit summaries
- AI service integrated with the Spring Boot backend
- Graceful fallback when the AI service is unavailable

### 🔐 Security
- Spring Security
- JWT-based authentication
- Role-based access control
- CORS configuration
- Environment-based production secrets

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- React Query

### Backend
- Java 21
- Spring Boot
- Spring Security
- JWT
- Spring Data JPA / Hibernate
- REST APIs

### Database
- PostgreSQL

### AI Service
- Python
- FastAPI
- OpenAI API

### Deployment
- Docker
- Render
- PostgreSQL

## Architecture

React + TypeScript Frontend
        ↓
Spring Boot REST API
        ↓
PostgreSQL

Spring Boot
        ↓
FastAPI AI Service
        ↓
OpenAI API

## Deployment

The application is deployed using Render with:

- React frontend as a static site
- Dockerized Spring Boot backend
- PostgreSQL database
- FastAPI AI service
- Environment variables for production configuration

## Project Structure

```text
mediflow-ai/
├── frontend/       # React + TypeScript frontend
├── backend/        # Spring Boot REST API
├── ai-service/     # FastAPI + OpenAI AI service
├── .env.example
├── .gitignore
└── README.md