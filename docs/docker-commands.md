# Useful Docker Compose Commands

## Open a shell inside the backend container
```sh
docker-compose exec backend sh
```
- Use this to get a shell prompt inside your backend container (if it’s Alpine or uses `sh`).
- If your container uses bash, you can use:
```sh
docker-compose exec backend bash
```

## Run a command directly inside the backend container
For example, to run a seeder or script:
```sh
docker-compose exec backend node seeders/adminSeeder.js
```
or
```sh
docker-compose exec backend node resetAdminPassword.js
```

## View logs for the backend container
```sh
docker-compose logs backend
```
- Add `-f` to follow logs live:
```sh
docker-compose logs -f backend
```

## Restart the backend container
```sh
docker-compose restart backend
```

## List all running containers
```sh
docker-compose ps
```

## General pattern
```sh
docker-compose exec <service_name> <command>
```
- Replace `<service_name>` with `backend`, `frontend`, or `mongo` as needed.

---

**Tip:** You can use similar commands for the frontend or MongoDB containers by changing the service name. 