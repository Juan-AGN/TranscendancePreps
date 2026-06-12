all: up

up:
	docker compose up --build -d

down:
	docker compose down

re: down up

clean: down
	docker system prune -f

fclean: down
	docker system prune -af --volumes

logs:
	docker compose logs -f

status:
	docker compose ps

.PHONY: all up down re clean fclean logs status
