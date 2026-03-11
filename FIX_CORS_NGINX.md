# Corrección CORS - Headers duplicados

## Problema

Error: `The 'Access-Control-Allow-Origin' header contains multiple values 'https://mysafebox.org, https://mysafebox.org'`

**Causa:** Tanto Nginx como Strapi están añadiendo headers CORS. El navegador solo acepta un valor.

## Solución

**Strapi** ya está configurado para enviar CORS correctamente. Debes **eliminar** los headers CORS de la configuración de Nginx.

### En el servidor (44.201.142.249)

1. Editar la configuración de Nginx:
```bash
sudo nano /etc/nginx/sites-available/default
# o el archivo que use tu sitio, ej: /etc/nginx/sites-available/api.mysafebox.org
```

2. **Buscar y ELIMINAR** estas líneas si existen en el bloque `location` que hace proxy a Strapi:
```nginx
add_header 'Access-Control-Allow-Origin' 'https://mysafebox.org';
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization';
```

3. El bloque `location` para la API debería verse así (SIN add_header CORS):
```nginx
location / {
    proxy_pass http://127.0.0.1:1337;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
    # NO añadir add_header Access-Control-* aquí
}
```

4. Verificar y reiniciar Nginx:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

5. Reiniciar Strapi para aplicar cambios:
```bash
cd /var/www/api
pm2 restart strapi-api
```

### Verificación

```bash
curl -I -X OPTIONS "https://api.mysafebox.org/api/auth/local/register" \
  -H "Origin: https://mysafebox.org" \
  -H "Access-Control-Request-Method: POST"
```

Debe mostrar solo **un** `Access-Control-Allow-Origin: https://mysafebox.org`.
