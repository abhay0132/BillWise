# BillWise

BillWise is an intelligent receipt processing system that extracts structured information from bill images using Computer Vision and Optical Character Recognition (OCR). It automates extraction of key fields such as merchant name, total amount, and transaction date, enabling efficient expense tracking and automation.

---

# Overview

Managing receipts manually is inefficient and error-prone. BillWise solves this by automatically analyzing receipt images and converting them into structured, usable data.

The system uses object detection to identify important regions and OCR to extract text, which is then processed and returned in structured format.

This project demonstrates real-world implementation of:

- Computer Vision pipelines
- OCR systems
- Full-stack application architecture
- ML model integration into production workflow

---

# Features

- Automatic receipt information extraction
- Detects merchant name, total amount, and date
- Object detection using YOLOv5
- OCR using Tesseract
- Image upload and processing pipeline
- User-friendly frontend interface
- Modular and scalable architecture

---

# System Architecture

The system consists of three main components:

## Frontend
- Built with React
- Allows users to upload receipt images
- Displays extracted information

## Backend
- Built with Python
- Handles image processing requests
- Runs object detection model
- Performs OCR
- Processes and formats extracted data

## Model Layer
- YOLOv5 object detection model
- Detects important regions in receipts
- Improves OCR accuracy

---

# Tech Stack

## Frontend
- React
- JavaScript
- HTML
- CSS

## Backend
- Python
- Flask / FastAPI

## Computer Vision / OCR
- YOLOv5
- OpenCV
- Tesseract OCR
- pytesseract

## Tools
- Git
- GitHub
- Roboflow

---

# Project Structure

```
BillWise/
│
├── Frontend/
│   └── my-react-app/
│
├── Backend/
│   └── server files
│
├── Model/
│   └── trained YOLOv5 model
│
├── Dataset/
│   └── training data
│
└── README.md
```

---

# How It Works

1. User uploads receipt image via frontend
2. Image is sent to backend server
3. YOLOv5 detects important regions
4. OCR extracts text from detected regions
5. Backend processes extracted text
6. Structured data is returned to frontend
7. Results are displayed to user

---

# Installation

## Clone repository

```bash
git clone https://github.com/abhay0132/BillWise.git
cd BillWise
```

## Backend setup

```bash
cd Backend
pip install -r requirements.txt
```

Install Tesseract:

Mac:
```bash
brew install tesseract
```

Linux:
```bash
sudo apt install tesseract-ocr
```

## Frontend setup

```bash
cd Frontend/my-react-app
npm install
npm start
```

---

# Usage

1. Start backend server
2. Start frontend application
3. Upload receipt image
4. View extracted information

---

# Example Output

Input:
Receipt image

Output:

- Merchant Name: Starbucks
- Total Amount: 450.00
- Date: 2025-07-31

---

# Engineering Highlights

- Real-world OCR pipeline implementation
- Object detection using YOLOv5
- Full-stack application development
- ML model integration into backend
- Modular and scalable system design

---

# Future Improvements

- Improve OCR accuracy
- Add database integration
- Add user authentication
- Build analytics dashboard
- Deploy to cloud
- Mobile application support

---

# Applications

- Expense tracking systems
- Financial automation tools
- Accounting software
- Business expense management

---

# Author

Abhay Yadav  
Software Engineer  

GitHub: https://github.com/abhay0132

---

# License

This project is for educational and demonstration purposes.

---

# Acknowledgements

- YOLOv5
- OpenCV
- Tesseract OCR
- Roboflow

---

BillWise demonstrates practical application of computer vision and OCR in solving real-world automation problems.
