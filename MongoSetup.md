# MongoDB Setup with Podman

This guide explains how to run MongoDB using Podman with a mounted local volume for data persistence.

## Prerequisites

- Podman installed on your system
- Basic familiarity with container commands

## Setup Instructions

### 1. Create a Local Volume Directory

Create a directory to store MongoDB data on your host machine:

```bash
mkdir -p ~/mongodb-data
```

Or use a project-specific directory:

```bash
mkdir -p ./mongodb-data
```

### 2. Run MongoDB Container with Podman

Run MongoDB container with a mounted volume:

```bash
podman run -d \
  --name mongodb \
  -p 27017:27017 \
  -v ~/mongodb-data:/data/db \
  -e MONGO_INITDB_DATABASE=openjdk_jobs \
  docker.io/library/mongo:latest
```

**Explanation of flags:**
- `-d`: Run container in detached mode (background)
- `--name mongodb`: Name the container for easy reference
- `-p 27017:27017`: Map container port 27017 to host port 27017
- `-v ~/mongodb-data:/data/db`: Mount local directory to container's data directory
- `-e MONGO_INITDB_DATABASE=openjdk_jobs`: Create initial database (optional)
- `docker.io/library/mongo:latest`: MongoDB image from Docker Hub

### 3. Verify Container is Running

Check if the container is running:

```bash
podman ps
```

You should see the `mongodb` container in the list.

### 4. Check Container Logs

View container logs to ensure MongoDB started successfully:

```bash
podman logs mongodb
```

You should see messages indicating MongoDB is listening on port 27017.

### 5. Test Connection

Test the MongoDB connection:

```bash
podman exec -it mongodb mongosh
```

Or test from your host machine (if you have `mongosh` installed):

```bash
mongosh mongodb://localhost:27017
```

### 6. Update .env File

Update your `.env` file to use the local MongoDB instance:

```
MONGO_URI=mongodb://localhost:27017/openjdk_jobs
```

## Container Management

### Stop the Container

```bash
podman stop mongodb
```

### Start the Container

```bash
podman start mongodb
```

### Restart the Container

```bash
podman restart mongodb
```

### Remove the Container

**Warning:** This will remove the container but **NOT** the data in the mounted volume:

```bash
podman rm mongodb
```

To remove the container and data:

```bash
podman rm mongodb
rm -rf ~/mongodb-data
```

### View Container Status

```bash
podman ps -a
```

## Data Persistence

The data stored in MongoDB will persist in the mounted volume (`~/mongodb-data`) even if you:
- Stop the container
- Remove the container
- Restart your system

To backup your data, simply copy the `~/mongodb-data` directory:

```bash
cp -r ~/mongodb-data ~/mongodb-data-backup
```

## Using a Different MongoDB Version

To use a specific MongoDB version, replace `latest` with the version tag:

```bash
podman run -d \
  --name mongodb \
  -p 27017:27017 \
  -v ~/mongodb-data:/data/db \
  -e MONGO_INITDB_DATABASE=openjdk_jobs \
  docker.io/library/mongo:7.0
```

## Troubleshooting

### Port Already in Use

If port 27017 is already in use, you can map to a different port:

```bash
podman run -d \
  --name mongodb \
  -p 27018:27017 \
  -v ~/mongodb-data:/data/db \
  docker.io/library/mongo:latest
```

Then update your `.env`:
```
MONGO_URI=mongodb://localhost:27018/openjdk_jobs
```

### Permission Issues

If you encounter permission issues with the mounted volume, you may need to adjust permissions:

```bash
sudo chown -R $(id -u):$(id -g) ~/mongodb-data
```

### Container Won't Start

Check the logs for errors:

```bash
podman logs mongodb
```

Remove and recreate the container if needed:

```bash
podman rm mongodb
# Then run the podman run command again
```

## Alternative: Using Podman Compose

If you prefer using a compose file, create `podman-compose.yml`:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: mongodb
    ports:
      - "27017:27017"
    volumes:
      - ~/mongodb-data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=openjdk_jobs
    restart: unless-stopped
```

Then run:

```bash
podman-compose up -d
```

