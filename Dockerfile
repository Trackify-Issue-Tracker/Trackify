###### Stage 1: Build the Python dependencies ######
# Use an official Python runtime as a parent image
# no alpine since it compiles C differently - may lead to bugs in python
FROM python:3.12-slim AS backend-builder
# Install the dependencies for building psycopg2
# gcc is only needed in this builder stage
RUN apt-get update \
    && apt-get -y install libpq-dev gcc
# Create a virtual environment
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
# Install any needed packages specified in requirements.txt
COPY /api/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt


###### Stage 2: Build the Python API ######
# Use an official Python runtime as a parent image
FROM python:3.12-slim AS backend-stage
# Install dependencies for psycopg2, we don't need gcc since it was only used in builder
RUN apt-get update \
    && apt-get -y install libpq-dev \
    && rm -rf /var/lib/apt/lists/*
# Copy the virtual environment with the dependencies
COPY --from=backend-builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
# Set the working directory in the container
WORKDIR /code
# Copy the current directory contents into the container at /app
COPY /api .
# Avoid some bugs
# ENV PYTHONDONTWRITEBYTECODE=1 \
#     PYTHONUNBUFFERED=1
# Run the API
CMD ["python", "api.py"]


###### Stage 3: Build the Angular app using node/npm ######
# Builder installs dependencies only when needed
FROM node:18-alpine AS frontend-builder
# Set working directory to ./app
WORKDIR /app
# Copy the package.json to working directory (i.e. /app)
COPY /app/package*.json .
# Install all the dependencies
RUN npm install
# Copy the source code to working directory (i.e. /app)
COPY /app .
# Generate the build of the application
ARG configuration=production
RUN npm run ng build -- --output-path=./dist/out --configuration $configuration


###### Stage 4: With the compiled application, copy the files to nginx and run nginx ######
FROM nginx:stable-alpine AS frontend-stage
# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*
# Copy built app to default nginx public folder
COPY --from=frontend-builder /app/dist/out/* /usr/share/nginx/html
# Copy nginx config file
COPY /nginx.conf  /etc/nginx/conf.d/default.conf
# Start NgInx
CMD ["nginx", "-g", "daemon off;"]