# MongoDB Setup with Podman

This guide explains how to run MongoDB using Podman with a Podman-managed volume for data persistence.

## Prerequisites

- Podman installed on your system
- Basic familiarity with container commands

## Setup Instructions

### 1. Create a Podman Volume

Create a Podman-managed volume to store MongoDB data:

```bash
podman volume create mongodb-data
```

This creates a volume named `mongodb-data` that Podman will manage automatically. Podman volumes handle permissions automatically, so no manual permission setup is needed.

**Note:** Podman volumes are stored in Podman's storage location (typically `~/.local/share/containers/storage/volumes/`). You can list all volumes with `podman volume ls` and inspect a volume with `podman volume inspect mongodb-data`.

### 2. Run MongoDB Container with Podman

Run MongoDB container with a mounted volume:

```bash
podman run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  -e MONGO_INITDB_DATABASE=openjdk_jobs \
  docker.io/library/mongo:latest
```

**Explanation of flags:**
- `-d`: Run container in detached mode (background)
- `--name mongodb`: Name the container for easy reference
- `-p 27017:27017`: Map container port 27017 to host port 27017
- `-v mongodb-data:/data/db`: Mount Podman volume to container's data directory
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

**Warning:** This will remove the container but **NOT** the data in the volume:

```bash
podman rm mongodb
```

To remove the container and volume (this will delete all data):

```bash
podman rm mongodb
podman volume rm mongodb-data
```

### View Container Status

```bash
podman ps -a
```

## Volume Management

### List Volumes

View all Podman volumes:

```bash
podman volume ls
```

### Inspect Volume

Get detailed information about the volume:

```bash
podman volume inspect mongodb-data
```

### Backup Volume Data

To backup your data, you can mount the volume to a temporary container and copy the data:

```bash
# Create a backup directory
mkdir -p ~/mongodb-backup

# Use a temporary container to copy data
podman run --rm \
  -v mongodb-data:/source:ro \
  -v ~/mongodb-backup:/backup \
  docker.io/library/alpine:latest \
  sh -c "cp -r /source/* /backup/"
```

### Restore Volume Data

To restore from a backup:

```bash
# Stop and remove the existing container
podman stop mongodb
podman rm mongodb

# Remove the existing volume (WARNING: This deletes all data)
podman volume rm mongodb-data

# Create a new volume
podman volume create mongodb-data

# Restore data from backup
podman run --rm \
  -v mongodb-data:/target \
  -v ~/mongodb-backup:/backup:ro \
  docker.io/library/alpine:latest \
  sh -c "cp -r /backup/* /target/"

# Recreate and start the container
podman run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
  -e MONGO_INITDB_DATABASE=openjdk_jobs \
  docker.io/library/mongo:latest
```

## Data Persistence

The data stored in MongoDB will persist in the Podman volume (`mongodb-data`) even if you:
- Stop the container
- Remove the container
- Restart your system

The volume will only be deleted if you explicitly remove it with `podman volume rm mongodb-data`.

## Using a Different MongoDB Version

To use a specific MongoDB version, replace `latest` with the version tag:

```bash
podman run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db \
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
  -v mongodb-data:/data/db \
  docker.io/library/mongo:latest
```

Then update your `.env`:
```
MONGO_URI=mongodb://localhost:27018/openjdk_jobs
```

### Permission Issues

Podman volumes handle permissions automatically, so permission issues are rare. However, if you encounter any:

1. Check the container logs:
   ```bash
   podman logs mongodb
   ```

2. If you see permission errors, try recreating the volume:
   ```bash
   podman stop mongodb
   podman rm mongodb
   podman volume rm mongodb-data
   podman volume create mongodb-data
   # Then recreate the container using the steps above
   ```

**Note:** If you're using SELinux, you may need to add the `:Z` or `:z` flag to the volume mount:
```bash
podman run -d \
  --name mongodb \
  -p 27017:27017 \
  -v mongodb-data:/data/db:Z \
  -e MONGO_INITDB_DATABASE=openjdk_jobs \
  docker.io/library/mongo:latest
```

The `:Z` flag sets the SELinux context for private unshared content, while `:z` sets it for shared content.

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
      - mongodb-data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=openjdk_jobs
    restart: unless-stopped

volumes:
  mongodb-data:
    external: true
```

**Note:** Make sure to create the volume first:
```bash
podman volume create mongodb-data
```

Then run:

```bash
podman-compose up -d
```

