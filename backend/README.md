# Getting started #
Note: Before you install anything, create a virtual environment and install afterwards.
1. cd to backend folder and create a virtual environment
```bash
   python -m venv venv
```
and activate it (powershell):
```bash
   venv\Scripts\Activate.ps1
```

# To start up backend #
1. If you haven't done this step before, make sure you have docker installed, and run the following in your virtual environment to build the container:
```bash
   docker build -t bridge-backend .
```

2. To run it: 
```bash
   docker run -p 8000:8000 bridge-backend
```

3. Visit http://127.0.0.1:8000/ and http://127.0.0.1:8000/docs

# Atlernatively, to test backend locally #
1. Install and use uvicorn instead:
```bash
   python -m uvicorn main:app --reload
```

2. Visit http://127.0.0.1:8000/ and http://127.0.0.1:8000/docs
