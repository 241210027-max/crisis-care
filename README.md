# Sahyog — Disaster Management Platform

A full-stack disaster management platform for monitoring incidents, tracking relief resources, coordinating volunteers, and supporting emergency response operations.

## 🚀 Live Demo

http://13.233.194.180/

## ✨ Features

- Real-time disaster/incident monitoring
- Interactive disaster map
- Volunteer and response-team management
- Relief material inventory tracking
- Disaster severity tracking
- Resource and incident analytics
- REST APIs using Django REST Framework
- Responsive React dashboard

## 🏗️ Architecture

React → Nginx → Django REST API → MySQL

## 🛠️ Tech Stack

**Frontend**
- React
- JavaScript
- Vite
- Leaflet

**Backend**
- Python
- Django
- Django REST Framework

**Database**
- MySQL

**Deployment**
- AWS EC2
- Nginx
- Gunicorn

## 📁 Project Structure

```text
sahyog-crisis-management/
├── backend/
├── core/
├── frontend/
│   └── web/
├── manage.py
└── README.md

⚙️ Local Setup
Backend
cd backend
python -m venv venv

Activate the virtual environment and install dependencies:
pip install -r requirements.txt

Run Django:
python manage.py runserver

Frontend
cd frontend/web
npm install
npm run dev

☁️ Deployment
The application is deployed on AWS EC2 using:
- Nginx as the web server/reverse proxy
- Gunicorn for Django
- MySQL for persistent data
- React production build served through Nginx
👨‍💻 Author
Ayush Kumar Tripathi
B.Tech CSE — NIT Delhi

