all: up

up:
	docker compose up --build -d

down:
	docker compose down

re: down up

clean: down
	docker system prune -f

fclean:
	docker compose down -v
	docker system prune -af

logs:
	docker compose logs -f

status:
	docker compose ps

.PHONY: all up down re clean fclean logs status
