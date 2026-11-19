#!/bin/sh
set -e

cd /var/www/html

if [ ! -f .env ]; then
    cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --force
fi

if [ ! -f vendor/autoload.php ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

until php -r '
    $host = getenv("DB_HOST") ?: "127.0.0.1";
    $port = getenv("DB_PORT") ?: "3306";
    $user = getenv("DB_USERNAME") ?: "root";
    $pass = getenv("DB_PASSWORD") ?: "";
    try {
        new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $user, $pass, [PDO::ATTR_TIMEOUT => 2]);
        exit(0);
    } catch (PDOException $e) {
        exit(1);
    }
' >/dev/null 2>&1; do
    echo "Aguardando o MySQL..."
    sleep 3
done

php artisan migrate --force

if [ "${DB_SEED:-false}" = "true" ]; then
    php artisan db:seed --force
fi

php artisan storage:link --force >/dev/null 2>&1 || true

case "${1:-dev}" in
    dev)
        npm run dev -- --host 0.0.0.0 &
        vite_pid=$!
        php artisan queue:work --tries=1 &
        queue_pid=$!
        (cd public && exec php -S 0.0.0.0:8000 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php) &
        server_pid=$!
        trap 'kill "$vite_pid" "$queue_pid" "$server_pid" 2>/dev/null || true' EXIT INT TERM
        wait "$server_pid"
        ;;
    serve)
        php artisan queue:work --tries=1 &
        queue_pid=$!
        (cd public && exec php -S 0.0.0.0:8000 ../vendor/laravel/framework/src/Illuminate/Foundation/resources/server.php) &
        server_pid=$!
        trap 'kill "$queue_pid" "$server_pid" 2>/dev/null || true' EXIT INT TERM
        wait "$server_pid"
        ;;
    *)
        exec "$@"
        ;;
esac
